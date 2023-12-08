---
cover: /assets/images/cover3.jpg
icon: blogk8s 
date: 2023-12-05
category:
  - Linux
tag:
  - Linux
  - shell
star: true
sticky: true
---

# Linux Shell中2>&1的含义解释

## 在Linux系统中0 1 2是一个文件描述符

| 名称                 | 代码 | 操作符           | Java中表示 | Linux 下文件描述符（Debian 为例)             |
| -------------------- | ---- | ---------------- | ---------- | -------------------------------------------- |
| 标准输入(stdin)      | 0    | < 或 <<          | System.in  | /dev/stdin -> /proc/self/fd/0 -> /dev/pts/0  |
| 标准输出(stdout)     | 1    | >, >>, 1> 或 1>> | System.out | /dev/stdout -> /proc/self/fd/1 -> /dev/pts/0 |
| 标准错误输出(stderr) | 2    | 2> 或 2>>        | System.err | /dev/stderr -> /proc/self/fd/2 -> /dev/pts/0 |

从上表看得出来，我们平时使用的
```shell
echo "hello" > t.log
```
其实也可以写成
```shell
echo "hello" 1> t.log
```
## 关于2>&1的含义
(关于输入/输出重定向本文就不细说了，不懂的可以参考[这里](http://www.runoob.com/linux/linux-shell-io-redirections.html)，主要是要了解> < << >> <& >& 这6个符号的使用)

 1. 含义：将标准错误输出重定向到标准输出
 2. 符号>&是一个整体，不可分开，分开后就不是上述含义了。比如有些人可能会这么想：2是标准错误输出，1是标准输出，>是重定向符号，那么"将标准错误输出重定向到标准输出"是不是就应该写成"2>1"？如果是尝试过，就知道2>1的写法其实是将标准错误输出重定向到名字为"1"的文件里了。
 3. 写成2&>1也是不可以的。

## 为什么2>&1要放在后面？
考虑如下一条shell命令
```shell
nohub java -jar app.jar >log 2>&1 &
```
(最后一个&表示把命令放到后台执行，不是本文重点。)为什么2>&1一定要放在>log后面，才表示标准错误输出和标准输出都定向到log中？

我们不妨把1和2都理解是一个指针，然后来看上面的语句就是这样的：
 1. 本来1--->屏幕(1指向屏幕)
 2. 执行>log后，1--->log(1指向log)
 3. 执行2>&1后，2--->1(2指向1，而1指向log,因此2也指向了log)

再来分析下
```shell
nohub java -jar app.jar 2>&1 >log &
```
 1. 本来1--->屏幕(1指向屏幕)
 2. 执行2>&1后，2--->1(2指向1，而1指向屏幕，因此2也指向了屏幕)
 3. 执行>log后，1--->log(1指向log，2还是指向屏幕)
所以这不是我们想要的结果。

## 每次都写">log 2>&1"太麻烦，能简写吗？
有以下两种简写方式
```shell
&>log
>&log
```
比如java启动命令就可以简写为：
```shell
nohup java -jar app.jar &>log &
```
上面两种方式都和">log 2>&1"一个语义。那么，上面两种方式中&>和>&有区别吗？
语义上是没有任何区别的，但是第一种方式是最佳选择，一般选择第一种。
参考：

 https://unix.stackexchange.com/questions/89386/what-is-symbol-and-in-unix-linux
 https://superuser.com/questions/335396/what-is-the-difference-between-and-in-bash

