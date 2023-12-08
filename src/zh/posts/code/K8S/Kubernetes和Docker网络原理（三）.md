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

# Kubernetes和Docker网络原理(三)
## Service通信

## kube-proxy运行机制
为了支持集群的水平扩展、高可用性，Kubernetes抽象出了Service的概念。Service是对一组Pod的抽象，它会根据访问策略(如如负载均衡策略)来访问这组Pod。Kubernetes在创建服务时会为服务分配一个虚拟的IP地址，客户端通过访问这个虚拟的IP地址来访问服务，服务则负责将请求转发到后端的Pod上。起到一个类似于反向代理的作用，但是它和普通的反向代理还是有一些不同：首先，它的Service的IP地址，也就是所谓的ClusterIP是虚拟的，想从外面访问还需要一些技巧；其次，它的部署和启停是由Kubernetes统一自动管理的。

Service和Pod一样，其实仅仅是一个抽象的概念，背后的运作机制是依赖于kube-proxy组件实现的。

在Kubernetes集群的每个Node上都会运行一个kube-proxy服务进程，我们可以把这个进程看做Service的透明代理兼负载均衡器，其核心功能是将到某个Service的访问请求转发到后端的多个Pod实例上。此外，Service的Cluster IP与NodePort等概念是kube-proxy服务通过iptables的NAT转换实现的，kube-proxy在运行过程中动态创建与Service相关的iptables规则，这些规则实现了将访问服务(Cluster IP或NodePort)的请求负载分发到后端Pod的功能。由于iptables机制针对的是本地kube-proxy端口，所以在每个Node上都要运行kube-proxy组件，这样一来，在Kubernetes集群内部，我们可以在任意Node上发起对Service的访问请求。综上所述，由于kube-proxy的作用，在Service的调用过程中客户端无需关心后端有几个Pod，中间过程的通信、负载均衡及故障恢复都是透明的。

## kube-proxy运行模式
kub-proxy的具体运行模式其实是随着Kubernetes版本的演进有着较大的变化的，整体上分为以下几个模式的演化：
 - userspace(用户空间代理)模式
 - iptables模式
 - IPVS模式

**userspace**
kube-proxy最早的工作模式便是userspace用户控件代理模式，在这种模式下kube-proxy是承担着真实的TCP/UDP代理任务的，当Pod通过Cluster IP访问Service的时候，流量被iptables拦截后转发到节点的kube-proxy进程，服务的路由信息通过watch API Server进行获取，然后kube-proxy进程再与具体的Pod建立TCP/UDP连接，从而将请求发送给Service的后端Pod上，在这个过程中实现负载均衡。

**iptables模式**

从kubernetes1.2版本开始不再采用userspace用户空间代理模式，取而代之的是iptables模式，在iptables模式下kube-proxy不再担任直接的proxy作用，它的核心职责变为：一方面通过watch API Server实时获取Service与Endpoint的变更信息，然后动态地更新iptables规则，然后流量会根据iptables的NAT机制直接路由到目标Pod，而不是再去单独建立连接。
<img src="/assets/images/k8s4-1.png" title="文件系统分区规则" width="350"/>
与之前的userspace模式相比，iptables模式完全工作在内核态，不需要切换到用户态的kube-proxy，避免了内核态用户态频繁地切换使得性能相比之前有所提高。

但是iptables也存在着局限性，就是由于iptables客观因素，当Kubernetes集群规模扩大，Pod数量大量增加以后，iptables的规则数量会随之急剧增加，进而导致其转发性能的下降，甚至会出现规则丢失的情况(故障非常难以重现和排查)，因此iptables模式也有待于改进。

## IPVS模式
IPVS模式即IP Virtual Server模式，在Kubernetes 1.11中IPVS模式升级为GA，IPVS虽然和iptables都是基于Netfilter实现，但是定位有着本质不同，iptables设计为防火墙使用，而IPVS用于高性能负载均衡，而且从规则的存储角度，IPVS采用的是Hash Table结构，因此理论上讲更适合在不影响性能的情况下大规模的扩展，同时IPVS支持比iptables更复杂的负载均衡算法(最小负载/最小连接数/加权等)，支持服务器健康检查和连接重试等功能，另外还可以动态修改ipset集合。
<img src="/assets/images/k8s4-2.png" title="文件系统分区规则" width="350"/>

在IPVS模式下，并不是就直接抛弃iptables了，虽然IPVS在性能上肯定是优于iptables的，但同时也有许多功能IPVS相比iptables是缺失的，比如包过滤、地址伪装、SNAT等功能，因此在一些场景下是需要IPVS与iptables配合工作的，比如NodePort实现。同时在IPVS模式下，kube-proxy使用的是iptables的扩展ipset，而不是直接通过iptables生成规则链。iptables规则链是线性的数据结构，而ipset是带索引的数据结构，因此当规则很多时，可以高效的匹配查找。