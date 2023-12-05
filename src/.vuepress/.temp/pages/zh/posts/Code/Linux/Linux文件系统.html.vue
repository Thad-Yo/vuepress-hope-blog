<template><div><h1 id="linux文件系统" tabindex="-1"><a class="header-anchor" href="#linux文件系统" aria-hidden="true">#</a> Linux文件系统</h1>
<h2 id="linux文件系统简介" tabindex="-1"><a class="header-anchor" href="#linux文件系统简介" aria-hidden="true">#</a> Linux文件系统简介</h2>
<p>Linux支持的文件系统格式很多，主要分为以下几类：</p>
<ul>
<li>磁盘文件系统：指本地主机中实际可以访问到的文件系统，包括硬盘、CD-ROM、DVD、USB存储器、磁盘阵列等。常见格式有：Ext2、Ext3、Ext4、JFS、NTFS、UFS、FAT、FAT16、FAT32等</li>
<li>网络文件系统：是可以远程访问的文件系统，在服务器端仍是本地磁盘文件系统，客户机通过网络远程访问数据。常见格式有：NFS、Samba等</li>
<li>专有/虚拟文件系统：不驻留在磁盘上的文件系统。常见格式有：TMPFS、PROCFS等</li>
</ul>
<h2 id="linux磁盘文件系统" tabindex="-1"><a class="header-anchor" href="#linux磁盘文件系统" aria-hidden="true">#</a> Linux磁盘文件系统</h2>
<p>目前Ext4(Extended File System,扩展文件系统)是广泛使用的一种磁盘文件格式。是在Ext3基础上发展起来的，对有效性保护、数据完整性、数据访问速度、向下兼容性等方面做了改进，其特点是日志文件系统：可将整个磁盘的写入动作完整地记录在磁盘的整个区域上，以便在必要时回溯追踪。</p>
<p>磁盘是一种计算机的外部存储器设备，由一个或多个覆盖有磁性材料的铝制或玻璃制的碟片组成，用来存储用户的信息，这种信息可以反复地被读取和改写，主要分为以下几类：</p>
<ul>
<li>IDE磁盘：价格低廉，兼容性强，性价比高，但是数据传输慢，不支持热插拔等</li>
<li>SCSI磁盘：传输效率高，读写性能好，运行稳定，可连接多个设备，支持热插拔，占用CPU低，但是价格相对较贵，一般用于工作站或服务器上</li>
<li>SATA磁盘：结构简单、支持热插拔<br>
Linux中硬盘以及分区等设备均表示为文件，其命名规则如下：</li>
<li>IDE磁盘的文件名为： /dev/hdxx</li>
<li>SCSI/SATA/USB磁盘文件名为： /dev/sdxx</li>
</ul>
 <img src="/assets/images/dev.png" title="文件系统命名规则" width="600"/>
<p>下面是一些具体的命名实例：</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code>/dev/hda      <span class="token comment">#表示第一个IDE硬盘</span>
/dev/hda1     <span class="token comment">#表示第一块IDE硬盘的第一个主分区</span>
/dev/hda2     <span class="token comment">#表示第一块IDE硬盘的扩展分区（或第二个主分区）</span>
/dev/hda5     <span class="token comment">#表示第一块IDE硬盘的第一个逻辑分区</span>
/dev/hda8     <span class="token comment">#表示第一块IDE硬盘的第四个逻辑分区</span>
/dev/hdb      <span class="token comment">#表示第二个IDE硬盘</span>
/dev/sda      <span class="token comment">#表示第一个SCSI硬盘</span>
/dev/sda1     <span class="token comment">#表示第一个SCSI硬盘的第一个主分区</span>
/dev/sdd3     <span class="token comment">#表示第四个SCSI硬盘的第三个主分区</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>为了便于管理和使用，通常会对磁盘进行分区：</p>
<ul>
<li>主分区：必须要存在的分区，最多能创建4个，最少1个，编号只能是1~4，可以直接格式化，然后安装系统，直接存放文件</li>
<li>扩展分区：会占用主分区位置，即主分区+扩展分区之和最多4个。相当于独立的磁盘，有独立的分区表，但不能独立的存放数据</li>
<li>逻辑分区：扩展分区不能直接存放数据，必须经过再次分割，成为逻辑分区后才能存放数据。一个扩展分区中的逻辑分区可以有任意多个，编号只能从5开始</li>
</ul>
<p>下图中的分区方案为：2个主分区 + 1个扩展分区，其中扩展分区又分割出了2个逻辑分区<br>
<img src="/assets/images/dev2.png" title="文件系统分区规则" width="800"/></p>
<h2 id="linux文件系统结构" tabindex="-1"><a class="header-anchor" href="#linux文件系统结构" aria-hidden="true">#</a> Linux文件系统结构</h2>
<p>Linux采用载入/挂载的方式将分区与目录联系起来，通过访问目录就可以访问分区的存储空间。挂载点就是硬盘分区挂载到文件系统的某目录后，该目录就是相应分区的挂载点。</p>
<p>在挂载点创建的文件，实际上是存储到硬盘的分区上，通过挂载点可以访问分区上的文件，若将硬盘分区与目录的挂载关系删除，分区上的文件不会被删除，只是原挂载点不能访问到分区上的文件。</p>
<p>除了swap分区外，其他分区都是在根分区(/)目录上操作的。Linux文件系统是一个树形的分层组织结构，根作为整个文件系统的惟一起点，其他所有目录都从该点出发，如下图：<br>
<img src="/assets/images/dev3.png" title="文件系统命名规则" width="800"/></p>
<p>由于Linux是完全开源的软件，因此众多Linux发行版本的目录结构不尽相同。为了规范文件目录命名和存放标准，颁发了文件层次结构标准(FHS)，Ubuntu系统也遵循该标准。</p>
<h2 id="文件系统与磁盘管理相关命令" tabindex="-1"><a class="header-anchor" href="#文件系统与磁盘管理相关命令" aria-hidden="true">#</a> 文件系统与磁盘管理相关命令</h2>
<p>文件系统与磁盘管理相关命令非常多，下面仅对几个较常用的命令做简单介绍<br>
⏩ df命令：disk free,用于列出文件系统的整体磁盘使用量，命令的格式为：</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token function">df</span> <span class="token punctuation">[</span>-a <span class="token parameter variable">-h</span> <span class="token parameter variable">-i</span> <span class="token parameter variable">-k</span> <span class="token parameter variable">-H</span> <span class="token parameter variable">-T</span> -m<span class="token punctuation">]</span> <span class="token punctuation">[</span>目录或文件名<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>不加参数使用时，默认会将系统内所有的(特殊内存与swap除外)都以KBytes容量列出来。常用的选项如下所示：</p>
<ul>
<li>-a: 列出所有的文件系统</li>
<li>-k: 以KBytes容量显示各文件系统</li>
<li>-m: 以MBytes容量显示各文件系统</li>
<li>-h: 以GBytes,MBytes,KBytes等格式自行显示</li>
<li>-H: 以M=1000K取代M=1024K的进位方式</li>
<li>-T: 显示出文件系统类型</li>
<li>-i: 不用硬盘容量，而以inode数量来显示</li>
</ul>
<p>⏩ du命令：disk used，用于查看文件和目录磁盘使用空间的，命令的格式为：</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token function">du</span> <span class="token punctuation">[</span>-a <span class="token parameter variable">-h</span> <span class="token parameter variable">-s</span> <span class="token parameter variable">-k</span> -m<span class="token punctuation">]</span> 文件或目录名称
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>不加参数使用时，默认会分析当前所在目录里的子目录所占用的硬盘空间。常用的选项如下示：</p>
<ul>
<li>-a：列出所有的文件与目录容量</li>
<li>-h：以人们较易读的容量格式 (G/M) 显示</li>
<li>-s：列出总量，而不是单个目录占用容量</li>
<li>-S：不包括子目录下的总计</li>
<li>-k：以KB列出容量显示</li>
<li>-m：以MB列出容量显示</li>
</ul>
<p>⏩ fdisk命令：磁盘分区表操作工具，命令的格式为：</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token function">fdisk</span> <span class="token punctuation">[</span>-l<span class="token punctuation">]</span> 装置名称
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>常用的选项如下示：</p>
<ul>
<li>-l：输出装置名称里所有的分区内容，若为空，则会搜寻系统里所有装置的分区并列出来</li>
</ul>
<p>⏩ file命令：用于辨识文件类型，命令的格式为：</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token function">file</span> <span class="token punctuation">[</span>-b <span class="token parameter variable">-c</span> <span class="token parameter variable">-L</span> <span class="token parameter variable">-v</span> -z<span class="token punctuation">]</span><span class="token punctuation">[</span>-f <span class="token operator">&lt;</span>名称文件<span class="token operator">></span><span class="token punctuation">]</span><span class="token punctuation">[</span>文件或目录<span class="token punctuation">..</span>.<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>常用的选项如下示：</p>
<ul>
<li>-b：列出辨识结果时，不显示文件名称</li>
<li>-c：详细显示指令执行过程，便于排错或分析程序执行的情形</li>
<li>-f &lt;名称文件&gt;：指定名称文件</li>
<li>-L：直接显示符号连接所指向的文件的类别</li>
<li>-v：显示版本信息</li>
<li>-z：尝试去解读压缩文件的内容</li>
<li>[文件或目录...]：要确定类型的文件列表，多个文件之间使用空格分开</li>
</ul>
<p>⏩ mkdir命令：make directory的缩写，用于创建目录，命令的格式为：</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token function">mkdir</span> <span class="token punctuation">[</span>-p<span class="token punctuation">]</span> dirName
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>常用的选项如下示：</p>
<ul>
<li>-p：确保目录名称存在，不存在的就建一个</li>
</ul>
<p>⏩ ln命令：link files，为某一个文件在另外一个位置建立一个同步的链接。命令的格式为：</p>
<div class="language-bash line-numbers-mode" data-ext="sh"><pre v-pre class="language-bash"><code><span class="token function">ln</span> <span class="token punctuation">[</span>参数<span class="token punctuation">]</span><span class="token punctuation">[</span>源文件或目录<span class="token punctuation">]</span><span class="token punctuation">[</span>目标文件或目录<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>常用的选项如下示：</p>
<ul>
<li>-b：删除，覆盖以前建立的链接</li>
<li>-d：允许超级用户制作目录的硬链接</li>
<li>-f：强制执行</li>
<li>-i：交互模式，文件存在则提示用户是否覆盖</li>
<li>-n：把符号链接视为一般目录</li>
<li>-s：软链接(符号链接)</li>
<li>-v：显示详细的处理过程</li>
<li>--help 显示帮助信息</li>
<li>--version 显示版本信息</li>
</ul>
</div></template>


