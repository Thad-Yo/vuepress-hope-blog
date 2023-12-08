---
cover: /assets/images/cover2.jpg
icon: blogk8s 
date: 2023-12-08
category:
  - Linux
tag:
  - Docker
  - Kubernetes
star: true
sticky: true
---

# Kubernetes和Docker网络原理(二)

## Kubernetes Pod 间通信
之前文章中主要关于Docker的网络实现进行了介绍和探讨，对于Docker网络而言，其最大的局限性在于跨主机的容器通信方案上存在空白，而Kubernetes作为适合大规模分布式集群的容器编排平台，其在网络实现层面上主要解决的问题就包括了如下几点：
 - 容器间通信
 - Pod间通信
 - Pod与Service通信
 - 集群内外通信

这篇博文主要针对Kubernetes的容器间通信和Pod间通信进行介绍和探讨，之后再通过单独一篇文章去探讨Pod与Service的通信，也就是kube-proxy工作原理和Service机制相关。

## 容器间通信
学习Kubernetes的容器间通信方案之前要理解Kubernetes中的Pod概念，Pod是Kubernetes中最基本的调度单位，而不是Docker容器，Pod的本意是豆荚，可以将容器理解为豆荚中的豆子，一个Pod可以包含多个有关联关系的容器，之后讨论的Pod与Service的通信也是从Pod层面而言的。这是必须要提前认识的概念，但是在底层，还是涉及到容器之间的通信，毕竟Pod只是一个抽象概念。

同一个Pod内的容器不会跨主机通信，它们共享同一个Network Namespace空间，共享同一个Linux协议栈。所以对于网络的各类操作，因此可以把一个Pod视作一个独立的[主机]，内部的容器可以用localhost地址访问彼此的端口。这么做是简单、安全和高效，也能减少将已经存在的程序从物理机或者虚拟机移植到容器下运行的难度。

如图，Node上运行着一个Pod实例，Pod内部的容器共享同一个Network Namespace，因此容器1和容器2之间的通信非常简单，就可以通过直接的本地IPC方式通信，对于网络应用，可以直接通过localhost访问指定端口通信。因此对于一些传统程序想要移植到Pod中，几乎不需要做太多的修改。
<img src="/assets/images/k8s3-1.png" title="文件系统分区规则" width="350"/>

## Pod间通信
刚才说同一个Pod内容器都在同一个Node上，因此不会出现跨节点通信的问题，但是在Pod层面，作为Kubernetes的基本调度单位，不同的Pod是很有可能被调度到不同的Node上的，当然也有可能被调度到同一个Node上，因此对于Pod间的通信，应该分为两种来探讨：
 - 相同Node下Pod间通信
 - 不同Node下Pod间通信

### 相同Node下Pod的通信
每一个Pod都有一个真是的全局IP地址，同一个Node内不同的Pod之间可以直接采用对方Pod的IP地址通信，而且不需要采用其他发现机制，例如DNS、Consul或者ETCD。
<img src="/assets/images/k8s3-2.png" title="文件系统分区规则" width="350"/>
同一个Node下，不同的Pod都通过Veth设备对连接至docker0网桥，Docker bridge模式在之前的Docker网络实现里已经讲过了，Pod的IP都是从docker0网桥上动态分配的，图上的Pod1、Pod2、docker0网桥它们三者属于同一个网段，即它们之间是可以直接通信的，这个很好理解。

对于每个Pod的eth0这一点，难道大家没有疑问吗？为什么Pod是一个抽象的虚拟概念，自己还能有一个独立的网络协议栈，即Network Namespace，还能挂载一个Veth设备？实际上这图没有画出来，每个Pod默认会有一个pause容器(实际名称：google_container/pause)，可以认为是Pod的一个[管家容器]，pause容器负责了包括Pod网络相关的一些初始化工作，pause容器使用的就是之前讲到的Docker的默认网络通信模型bridge，pause通过Veth设备对与docker0桥接，而Pod内其它容器采用了非默认的网络配置和映射容器的模型，指定映射目标容器到Pause容器上，这么做的目的很简单，为实现一个Pod内多个容器，本身没有很好的方式进行连接，pause提供一个Pod内部的通信[桥梁]，为什么不是后一个容器关联前一个容器的方式呢？这种方式的话一旦前一个容器启动不起来或者挂掉，后面的容器都会跟着受影响。

### 不同Node下Pod的通信
在同一个Node下的Pod间通信因为可以直接通过docker0桥接实现，因此很容易理解，但是在不同Node下的Pod间通信如何实现就是个很有学问的事情了。

首先我们要知道的是，每个宿主机上docker0网桥为Pod分配的都是私有IP,而Kubernetes要求网络对Pod的地址是平面且直达的，说白了就是在即群众可以通过Pod的私有IP在各个不同的Node之间通信。因此我们可以知道，对于Pod IP的规划是非常重要的，要实现上面讲的可以在集群内部使用私有IP进行不同的Node间的Pod通信，最起码要保证在集群层面这些私有IP一定是不冲突的才行，注意，这些Pod私有IP是保存在Etcd集群中的。

另外，我们知道，不同Node之间的通信一定是要经由宿主机的物理网卡，因此要实现Pod在不同Node之间的通信，还要通过Node的IP进行寻址和通信，这也是要关注的一点。

综上我们可知，对于不同的Nod下的Pod间通信，核心是满足两点：
 1. Pod IP实现集群层级的不冲突。Pod的IP分配虽然是有本地docker0负责，但是具体的地址规划一定是要在集群层面，保证其不冲突，这是通过私有Pod IP跨Node通信的基本条件；
 2. Pod IP借助Node IP 进行寻址访问。Node之间通信的桥梁还是Node实实在在的物理网卡，因此需要找到一种方法，将Pod IP与Node IP关联起来，通过这个关联实现不同Node的Pod之间的访问。

对于这一点，实现Pod IP在集群层级的不冲突，我们需要对docker0的地址进行规划，保证每个Node上的docker0网段是没有冲突的，针对这一点，可以手工配置，当然如果是小集群还好，如果是大规模集群的话，我认为这是在扯淡，因此，应该有不这么反运维工程师的方案，比如做一个分配规则，让程序自己去分配地址段，这是很容易想到的，没错，多亏了Kubernetes的CNI（容器网络接口），有一些优秀的Kubernetes网络增强软件就可以接进来帮我们完成这些工作，典型的比如Flannel、Calico。

对于第二点，其核心目标就是实现Pod IP经由Node IP的寻址，也就是说需要一个机制知道Pod IP具体在哪一个Node上，通过宿主机将数据转发到目标Node上，然后再由目标Node将数据转发到具体的本地docker0上，最后转发到目标Pod中，整个过程大致如图所示：
<img src="/assets/images/k8s3-3.png" title="文件系统分区规则" width="350"/>

一些致命的云平台本身就设计实现Pod的IP管理，因此Pod的通信可以借助平台层的网络设计打通，但是在大部分情况下，尤其是一般企业自己维护的Kubernetes集群上，可能无法享受到这种机制，因此还需要自己进行相关的网络配置，让网络满足Kubernetes的要求之后才能实现Pod之间的正常通信，进而实现集群的正常运转，就像上面第一点中说的那样，好在Kubernetes的高可扩展性，通过CNI机制，一些网络增强组件（Flannel、Calico等）实现了上面这些网络要求。但是基本的原理，基本的需求是上面描述的，这个是必须要理解的，但是对于其实际实现，每个增强组件都有自己的实现方案，这里没法一个个去详细介绍，心有余而力不足，真有时间的话会好好研究并且撰写相关的博文与大家分享。