---
cover: /assets/images/cover2.jpg
icon: blogk8s 
date: 2023-12-06
category:
  - Linux
tag:
  - 容器化
  - Kubernetes
star: true
sticky: true
---

# Kubernets 架构

## Kubernetes 主要核心组件
 - etcd 保存了整个集群的状态；
 - kube-apiserver 供了资源操作的唯一入口，并提供认证、授权、访问控制、API注册和发现等机制；
 - kube-controller-manager 负责维护集群的状态，比如故障检测、自动扩展、滚动更新等；
 - kube-scheduler 负责资源的调度，按照预定的调度策略将pod调度到相应的机器上；
 - kubelet 负责容器的生命周期，同时也负责Volume(CVI)和网络(CNI)的管理；
 - Container runtime 负责镜像管理以及Pod和容器的真正运行(CRI),默认的容器运行时为Docker
 - kube-proxy 负责为Service提供cluster内部的容器服务发现和负载均衡
 <img src="/assets/images/k8s1.png" title="文件系统分区规则" width="800"/>

## 除了核心组件，还有一些推荐的Add-Ons：
 - kube-dns 负责为整个集群提供DNS服务
 - Ingress Controller 为服务提供外网入口
 - Heapster 提供资源监控
 - Dashboard 提供GUI
 - Federation 提供跨可用区的集群
 - Fluentd-elasticsearch 提供集群的日子采集，存储与查询