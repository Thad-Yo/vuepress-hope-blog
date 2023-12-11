---
cover: /assets/images/cover3.jpg
icon: bloglinux 
date: 2023-12-11
category:
  - Linux
tag:
  - 密钥
  - SSH
star: true
sticky: true
---

# SSH密钥登录

SSH默认采用密码登录，这种方法有很多缺点，简单的密码不安全，复杂的密码不容易记忆，每次手动输入也很麻烦。秘钥登录是比密码登录更好的解决方案。

## 密钥是什么？
密钥(key)是一个非常大的数字，通过加密算法得到。对称加密只需要一个密钥，非对称加密需要两个密钥，分为公钥(public key)和私钥(private key)。

SSH密钥登录采用的是非对称加密，每个用户通过自己的密钥登录。其中，私钥必须私密保存，不能泄露；公钥是公开的，可以对外发送。它们的关系是，公钥和私钥是一一对应的，每一个私钥都有且仅有一个对应的公钥，反之亦然。

如果数据使用公钥加密，那么只有使用对应的私钥才能解密，其他密钥都不行；反过来，如果使用私钥加密(这个过程一般称为"签名")，也只有对应的公钥解密。

## 密钥登录的过程
SSH密钥登录分为以下的步骤。
预备步骤，客户端通过ssh-keygen生成自己的公钥和私钥。

第一步，手动将客户端的公钥放入远程服务器的指定位置。
第二步，客户端向服务器发起SSH登录的请求。
第三步，服务器收到用户SSH登录的请求，发送一些随机数据给用户，要求用户证明自己的身份。
第四步，客户端收到服务器发来的数据，使用私钥对数据进行签名，然后再发还给服务器。
第五步，服务器收到客户端发来的加密签名后，使用对应的公钥解密，然后跟原始数据比较。如果一致，就允许用户登录。

## ssh-keygen命令:生成密钥

### 基本用法
密钥登录时，首先需要生成公钥和私钥。OpenSSH提供了一个工具程序ssh-keygen命令，用来生成密钥。
直接输入ssh-keygen，程序会询问一系列问题，然后生成密钥。
```sh
$ ssh-keygen
```
通常的做法是使用-t 参数，指定密钥的加密算法。
```sh
$ ssh-keygen -t dsa
```
上面实例中，-t参数用来指定密钥的加密算法，一般会选择DSA算法或RSA算法。如果省略该参数，默认使用RSA算法。

输入上面的命令以后，ssh-keygen会要求用户回答一些问题。
```sh
$ ssh-keygen -t dsa
Generating public/private dsa key pair.
Enter file in which to save the key (/home/username/.ssh/id_dsa):  press ENTER
Enter passphrase (empty for no passphrase): ********
Enter same passphrase again: ********
Your identification has been saved in /home/username/.ssh/id_dsa.
Your public key has been saved in /home/username/.ssh/id_dsa.pub.
The key fingerprint is:
14:ba:06:98:a8:98:ad:27:b5:ce:55:85:ec:64:37:19 username@shell.isp.com
```
上面实例中，执行ssh-keygen命令以后，会出现第一个问题，询问密钥保存的文件名，默认是~/.ssh/id_dsa文件，这个是私钥的文件名，对应的公钥文件~/.ssh/id_dsa.pub 是自动生成的。用户的密钥一般都放在主目录的.ssh目录里面。

如果选择rsa算法，生成的密钥文件默认就会是~/.ssh/id_rsa(私钥)和~/.ssh/id_rsa.pub(公钥)。

接着，就会是第二个问题，询问是否要为私钥文件设定密码保护(passphrase)。这样的话，即使入侵者拿到私钥，还是需要破解密码。如果为了方便，不想设定密码保护，可以直接按回车键，密码就会为空。后面还会让你再输入一次密码，两次输入必须一致。注意，这里"密码"的英文单词是passphrase，这是为了避免与Linux账户的密码单词password混淆，表示这不是用户系统账户的密码。

最后，就会生成私钥和公钥，屏幕上还会给出公钥的密码，以及当前的用户名和主机名作为注释，用来识别密钥的来源。

公钥文件和私钥文件都是文本文件，可以用文本编辑器看一下他们的内容。公钥文件的内容类似下面这样。
```sh
ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAIEAvpB4lUbAaEbh9u6HLig7amsfywD4fqSZq2ikACIUBn3GyRPfeF93l/
weQh702ofXbDydZAKMcDvBJqRhUotQUwqV6HJxqoqPDlPGUUyo8RDIkLUIPRyq
ypZxmK9aCXokFiHoGCXfQ9imUP/w/jfqb9ByDtG97tUJF6nFMP5WzhM= username@shell.isp.com
```

上面示例中，末尾的 username@shell.isp.com 是公钥的注释，用来识别不同的，表示这是哪台主机(shell.isp.com)的哪个用户(username)的公钥，不是必需项。

注意，公钥只有一行。因为它太长了，所以上面分成三行显示。

下面的命令可以列出用户所有的公钥。
```sh
$ ls -l ~/.ssh/id_*.pub
```

生成密钥以后，建议修改它们的权限，防止其他人读取。
```sh
$ chmod 600 ~/.ssh/id_rsa 
$ chmod 600 ~/.ssh/id_rsa.pub
```

### 配置项
ssh-keygen 的命令行配置项，只要有下面这些。
（1）-b
-b参数指定密钥的二进制位数。这个参数值越大，密钥就越不容易破解，但是加密解密的计算开销也会加大。
一般来说，-b至少应该是1024，更安全一些可以设为2048或者更高。

（2）-C
-C参数可以为密钥文件指定新的注释，格式为username@host。

下面命令生成一个4096位 RSA 加密算法的密钥对，并且给出了用户名和主机名。
```sh
$ ssh-keygen -t rsa -b 4096 -C "your_email@domain.com"
```
（3）-f
-f参数指定生成的私钥文件。
```sh
$ ssh-keygen -t dsa -f mykey
```
上面命令会在当前目录生成私钥文件mykey和公钥文件mykey.pub。

（4）-F
-F参数检查某个主机名是否在known_hosts文件里面。
```sh
$ ssh-keygen -F example.com
```
（5）-N
-N参数用于指定私钥的密码（passphrase）。
```sh
$ ssh-keygen -t dsa -N secretword
```
（6）-p
-p参数用于重新指定私钥的密码（passphrase）。它与-N的不同之处在于，新密码不在命令中指定，而是执行后再输入。ssh 先要求输入旧密码，然后要求输入两遍新密码。

（7）-R
-R参数将指定的主机公钥指纹移出known_hosts文件。
```sh
$ ssh-keygen -R example.com
```
（8）-t
-t参数用于指定生成密钥的加密算法，一般为dsa或rsa 

## 手动上传公钥
生成密钥以后，公钥必须上传到服务器，才能使用公钥登录。

OpenSSH规定，用户公钥保存在服务器的~/.ssh/authorized_keys文件。你要以哪个用户的身份登录到服务器，密钥就必须保存在该用户主目录的~/.ssh/authorized_keys文件。只要把公钥添加到这个文件之中，就相当于公钥上传到服务器了。每个公钥占据一行。如果该文件不存在，可以手动创建。

用户可以手动编辑该文件，把公钥粘贴进去，也可以在本地计算机上，执行下面的命令。
```sh
$ cat ~/.ssh/id_rsa.pub | ssh user@host "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```
上面实例中，user@host要替换成你所要登录的用户名和主机名。

注意，authorrized_keys文件的权限要设为644，即只有文件所有者才能写。如果权限设置不对，SSH服务器可能会拒绝读取该文件。
```sh
$ chmod 644 ~/.ssh/authorized_keys
```
只要公钥上传到服务器，下次登录时，OpenSSH就会自动采用密钥登录，不再提示输入密码。
```sh
$ ssh -l username shell.isp.com
Enter passphrase for key '/home/you/.ssh/id_dsa': ************
Last login: Mon Mar 24 02:17:27 2014 from ex.ample.com
shell.isp.com>
```
上面例子中，SSH客户端使用私钥之前，会要求用户输入密码(passphrase)，用来解开私钥。

## ssh-copy-id命令:自动上传公钥

OpenSSH自带一个ssh-copy-id命令，可以自动将公钥拷贝到远程服务器的~/.ssh/authorized_keys文件。如果~/.ssh/authorized_key文件不存在，ssh-copy-id命令会自动创建该文件。

用户在本地计算机执行下面的命令，就可以把本地的公钥拷贝到服务器。
```sh
$ ssh-copy-id -i key_file user@host
```
上面命令中，-i参数用来指定公钥文件，user是所要登陆的账户名，host是服务器地址。如果省略用户名，默认为当前的本机用户名。执行完该命令，公钥就会拷贝到服务器。
注意，公钥文件可以不指定路径和.pub后缀名，ssh-copy-id会自动在~/.ssh目录里面寻找。
```sh
$ ssh-copy-id -i id_rsa user@host
```
上面命令中，公钥文件会自动匹配到~/.ssh/id_rsa.pub。
ssh-copy-id会采用密码登录，系统会提示输入远程服务器的密码。

注意，ssh-copy-id是直接将公钥添加到authorized_keys文件的末尾。如果authorized_keys文件的末尾不是一个换行符，会导致新的公钥添加到前一个公钥的末尾，两个公钥连在一起，使得它们都无法生效。所以，如果authorized_keys文件已经存在，使用ssh-copy-id命令之前，务必保证authorized_keys文件的末尾是换行符(假设该文件已经存在)。

## ssh-agent命令，ssh-add命令
### 基本用法
私钥设置了密码以后，每次使用都必须输入密码，有时让人感觉非常麻烦。比如，连续使用scp命令远程拷贝文件时，每次都要求输入密码。

ssh-agent命令就是为了解决这个问题而设计的，它让用户在整个Bash对话(session)职中，只在第一次使用SSH命令时输入密码，然后将私钥保存在内存中，后面都不需要在输入私钥的密码了。

第一步，使用下面的命令新建一次命令行对话。
```sh
$ ssh-agent bash
```
上面命令中，如果你使用的命令行环境不是bash，可以用其他的shell命令代替。比如zsh和fish。
如果想在当前对话启用ssh-agent，可以使用下面的命令。
```sh
$ eval 'ssh-agent'
```
上面命令中，ssh-agent会先自动在后台运行，并将需要设置的环境变量输出到屏幕上，类似下面这样：
$ ssh-agent
SSH_AUTH_SOCK=/tmp/ssh-barrett/ssh-22841-agent; export SSH_AUTH_SOCK;
SSH_AGENT_PID=22842; export SSH_AGENT_PID;
echo Agent pid 22842;
```
eval命令的作用，就是运行上面的ssh-agent命令的输出，设置环境变量。
第二步，在新建的Shell对话里面，使用ssh-add命令添加默认的私钥(比如~/.ssh/id_rsa，或~/.ssh/id_dsa，或~/.ssh/id_ecdsa，或~/.ssh/id_ed25519)。
```sh
$ ssh-add
Enter passphrase for /home/you/.ssh/id_dsa: ********
Identity added: /home/you/.ssh/id_dsa (/home/you/.ssh/id_dsa)
```
上面例子中，添加私钥时，会要求输入密码。以后，在这个对话里面再使用密钥时，就不再需要输入私钥的密码了，因为私钥已经加载到内存里面了。

如果添加的不是默认私钥，ssh-add命令需要显示指定私钥文件。
```sh
$ ssh-add my-other-key-file
```
上面的命令中，my-other-key-file就是用户指定的私钥文件。
第三步，使用ssh命令正常登录远程服务器
```sh
$ ssh remoteHost
```
上面命令中，remoteHost是远程服务器的地址，ssh使用的是默认的私钥。这时如果私钥设有密码，ssh将不再询问密码，而是直接去除内存里面的私钥。

如果要是用其他私钥登录服务器，需要使用ssh命令的-i参数指定私钥文件。
```sh
ssh -i OpenSSHPrivateKey remoteHost
```
最后，如果要退出ssh-agent，可以直接退出子Shell(按下Ctrl + d)，也可以使用下面的命令。
```sh
$ ssh-agent -k
```

### ssh-add 命令
ssh-add命令用来将私钥加入ssh-agent，它有如下的参数。
 (1) -d
 -d参数从内存中删除指定私钥。
 ```sh
 $ ssh-add -d name-of-key-file
 ```
 (2) -D
 -D参数从内存中删除所有已经添加的私钥
 ```sh
 $ ssh-add -D
 ```
 (3) -l 
 -l参数列出所有已经添加的私钥。
 ```sh
 $ ssh-add -l
 ```

## 关闭密码登录
为了安全性，启用密码登录之后，最好关闭服务器的密码登录。
对于OpenSSH，具体方法就是打开服务器sshd的配置文件/etc/ssh/sshd_config，将PasswordAuthentication这一项设为no。
```json
PasswordAuthentication no
```
修改配置文件以后会，不要忘了重启sshd，否则不会生效。
