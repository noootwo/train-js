接触`nodejs`有两个月，对`nodejs`的两大特性一直有点模糊，即`异步IO`和`事件驱动`。通过对**_《深入浅出nodejs》_**和几篇博客的阅读以后，有了大致的了解，总结一下。

## 几个例子

在开始之前，先来看几个简单例子，这也是我在使用`nodejs`时候遇到的几个比较困惑的例子。

___

### example 1

var fs = require("fs");
var debug = require('debug')('example1');

debug("begin");

setTimeout(function(){
    debug("timeout1");
});

setTimeout(function(){
    debug("timeout2");
});

debug('end');

**question 1**

> 为何`timeout1`和`timeout2`的结果会在`end`后面？

___

### example 2

var fs = require("fs");
var debug = require('debug')('example2');

debug("begin");

setTimeout(function(){
    debug("timeout1");
});

setTimeout(function(){
    debug("timeout2");
});

debug('end');

while(true);

**question 2**

> 为何`timeout1`和`timeout2`没有输出到终端？`while(true)`到底阻塞了什么？

___

### example 3

var fs = require("fs");
var debug = require('debug')('example3');

debug("begin");

setTimeout(function(){
    debug("timeout1");
    while (true);
});

setTimeout(function(){
    debug("timeout2");
});

debug('end');

**question 3**

> 为什么`timeout1`中回调函数会阻塞`timeout2`中的回调函数的执行？

___

### example 4

var fs = require("fs");
var debug = require('debug')('example4');

debug("begin");

setTimeout(function(){
    debug("timeout1");
    
    for(var i = 0 ; i < 1000000 ; ++i){
        for(var j = 0 ; j < 100000 ; ++j);
    }
});

setTimeout(function(){
    debug("timeout2");
});

debug('end');

**question 4**

> 和上面的问题一样，为何`timeout1`的计算密集型工作将会阻塞`timeout2`的回调函数的执行？

___

### example 5

var fs = require("fs");
var debug = require('debug')('example5');

debug("begin");

fs.readFile('package.json','utf-8',function(err,data){
    if(err)  
        debug(err);
    else
        debug("get file content");
});

setTimeout(function(){
    debug("timeout2");
});

debug('end');

**question 5**

> 为何读取文件的`IO`操作不会阻塞`timeout2`的执行？

___

接下来我们就带着上面几个疑惑去理解`nodejs`中的`异步IO`和`事件驱动`是如何工作的。

## 异步IO(asynchronous I/O)

首先来理解几个容易混淆的概念，`阻塞IO(blocking I/O)`和`非阻塞IO(non-blocking I/O)`，`同步IO(synchronous I/O)和异步IO(synchronous I/O)`。

博主一直天真的以为`非阻塞I/O`就是`异步I/O` T\_T，`apue`一直没有读懂。

### 阻塞I/O 和 非阻塞I/O

简单来说，**阻塞I/O**就是当用户发一个读取文件描述符的操作的时候，进程就会被阻塞，直到要读取的数据全部准备好返回给用户，这时候进程才会解除`block`的状态。

那**非阻塞I/O**呢，就与上面的情况相反，用户发起一个读取文件描述符操作的时，函数立即返回，不作任何等待，进程继续执行。但是程序如何知道要读取的数据已经准备好了呢？最简单的方法就是轮询。

除此之外，还有一种叫做`IO多路复用`的模式，就是用一个阻塞函数同时监听多个文件描述符，当其中有一个文件描述符准备好了，就马上返回，在`linux`下，`select`,`poll`,`epoll`都提供了`IO多路复用`的功能。

### 同步I/O 和 异步I/O

那么`同步I/O`和`异步I/O`又有什么区别么？是不是只要做到`非阻塞IO`就可以实现`异步I/O`呢？

其实不然。

-   `同步I/O(synchronous I/O)`做`I/O operation`的时候会将process阻塞,所以`阻塞I/O`，`非阻塞I/O`，`IO多路复用I/O`都是`同步I/O`。
    
-   `异步I/O(asynchronous I/O)`做`I/O opertaion`的时候将不会造成任何的阻塞。
    

`非阻塞I/O`都不阻塞了为什么不是`异步I/O`呢？其实当`非阻塞I/O`准备好数据以后还是要阻塞住进程去内核拿数据的。所以算不上`异步I/O`。

这里借一张图(图来自[这里](https://segmentfault.com/a/1190000003063859?utm_source=Weibo&utm_medium=shareLink&utm_campaign=socialShare))来说明他们之间的区别

![![Alt text\](https://segmentfault.com/img/remote/1460000005173228 "![Alt text\")\]\[1\]

更多IO更多的详细内容可以在这里找到:

-   [Linux IO模式及 select、poll、epoll详解](https://segmentfault.com/a/1190000003063859?utm_source=Weibo&utm_medium=shareLink&utm_campaign=socialShare#articleHeader0)
    
-   [select / poll / epoll: practical difference for system architects](https://link.segmentfault.com/?enc=ZmBqTuRRNftLNyWdiZuOAw%3D%3D.vAhxEPizvgZsa4RdkYARsuoCdj2tjG1P0ZksW6iWERXOrsdODZBJYocDVjC7wmHGAyOpiRv2OwUmBu5qQWYR29AG%2FQv61O9CjfbQ0Eqzr8ecXLm2BAz5FZSInkKXx7Sr)
    

## 事件驱动

`事件驱动(event-driven)`是`nodejs`中的第二大特性。何为`事件驱动`呢？简单来说，就是通过监听事件的状态变化来做出相应的操作。比如读取一个文件，文件读取完毕，或者文件读取错误，那么就触发对应的状态，然后调用对应的回掉函数来进行处理。

### 线程驱动和事件驱动

那么`线程驱动`编程和`事件驱动`编程之间的区别是什么呢？

-   `线程驱动`就是当收到一个请求的时候，将会为该请求开一个新的线程来处理请求。一般存在一个线程池，线程池中有空闲的线程，会从线程池中拿取线程来进行处理，如果线程池中没有空闲的线程，新来的请求将会进入队列排队，直到线程池中空闲线程。
    
-   `事件驱动`就是当进来一个新的请求的时，请求将会被压入队列中，然后通过一个循环来检测队列中的事件状态变化，如果检测到有状态变化的事件，那么就执行该事件对应的处理代码，一般都是回调函数。
    

对于`事件驱动`编程来说，如果某个时间的回调函数是`计算密集型`，或者是`阻塞I/O`,那么这个回调函数将会阻塞后面所有事件回调函数的执行。这一点尤为重要。

## nodejs的事件驱动和异步I/O

### 事件驱动模型

上面介绍了那么多的概念，现在我们来看看`nodejs`中的`事件驱动`和`异步I/O`是如何实现的.

`nodejs`是**单线程(single thread)**运行的，通过一个**事件循环(event-loop)**来循环取出**消息队列(event-queue)**中的消息进行处理,处理过程基本上就是去调用该**消息**对应的回调函数。**消息队列**就是当一个事件状态发生变化时，就将一个消息压入队列中。

`nodejs`的时间驱动模型一般要注意下面几个点：

-   因为是**单线程**的，所以当顺序执行`js`文件中的代码的时候，**事件循环**是被暂停的。
    
-   当`js`文件执行完以后，**事件循环**开始运行，并从**消息队列**中取出消息，开始执行回调函数
    
-   因为是**单线程**的，所以当回调函数被执行的时候，**事件循环**是被暂停的
    
-   当涉及到I/O操作的时候，`nodejs`会开一个独立的线程来进行`异步I/O`操作，操作结束以后将消息压入**消息队列**。
    

下面我们从一个简单的`js`文件入手，来看看 `nodejs`是如何执行的。

var fs = require("fs");
var debug = require('debug')('example1');

debug("begin");

fs.readFile('package.json','utf-8',function(err,data){
    if(err)  
        debug(err);
    else
        debug("get file content");
});

setTimeout(function(){
    debug("timeout2");
});

debug('end'); 

1.  同步执行`debug("begin")`
    
2.  异步调用`fs.readFile()`，此时会开一个新的线程去进行`异步I/O`操作
    
3.  异步调用`setTimeout()`，马上将超时信息压入到**消息队列**中
    
4.  同步调用`debug("end")`
    
5.  开启**事件循环**，弹出**消息队列**中的信息(目前是超时信息)
    
6.  然后执行信息对应的回调函数(**事件循环**又被暂停)
    
7.  **回调函数**执行结束后，开始**事件循环**(目前**消息队列**中没有任何东西，文件还没读完)
    
8.  `异步I/O`读取文件完毕，将消息压入**消息队列(**消息中含有文件内容或者是出错信息)
    
9.  **事件循环**取得消息，执行回调
    
10.  程序退出。
    

这里借一张图来说明`nodejs`的事件驱动模型（图来自[这里](https://link.segmentfault.com/?enc=dkyUNZFRQSwPeOU9H69gCA%3D%3D.Aln3GgitnxIMIhHP5w7Hu3o5l2T0pad2RDtHWIisQOhs9VmRRrKljLxoyNOQXX6bAux08OpPUhV4K2tqPRh%2F4Ltau5K%2B7ZU%2FXrPQJSD66HM%3D)）  
![![这里写图片描述\](https://segmentfault.com/img/remote/1460000006792647 "![这里写图片描述\")\]\[2\]

这里最后要说的一点就是如何手动将一个函数推入队列,`nodejs`为我们提供了几个比较方便的方法:

-   setTimeout()
    
-   process.nextTick()
    
-   setImmediate()
    

### 异步I/O

`nodejs`中的`异步I/O`的操作是通过`libuv`这个库来实现的，包含了`window`和`linux`下面的`异步I/O`实现，博主也没有研究过这个库，感兴趣的读者可以移步到[这里](https://link.segmentfault.com/?enc=sOrx%2Fs3loPOzkJwFAVSolQ%3D%3D.lQdSBY85A0oZaVc9BB%2FgcxZ%2BUP1MljbG9XPPMkZLSlM%3D)

### 问题答案

好，到目前为止，已经可以回答上面的问题了

___

**question 1**

> 为何`timeout1`和`timeout2`的结果会在end后面？

**answer 1**

> 因为此时`timeout1`和`timeout2`只是被异步函数推入到了队列中，**事件循环**还是暂停状态

___

**question 2**

> 为何`timeout1`和`timeout2`没有输出到终端？`while(true)`到底阻塞了什么？

**answer 2**

> 因为此处直接阻塞了**事件循环**，还没开始，就已经被阻塞了

___

**question 3,4**

> 1.  为什么`timeout1`中回调函数会阻塞`timeout2`中的回调函数的执行？
>     
> 2.  为何`timeout1`的计算密集型工作将会阻塞`timeout2`的回调函数的执行？
>     

**answer 3,4**

> 因为该回调函数执行返回**事件循环**才会继续执行，回调函数将会阻塞事件循环的运行

___

**question 5**

> 为何读取文件的IO操作不会阻塞`timeout2`的执行？

**answer 5**

> 因为`IO`操作是异步的，会开启一个新的线程，不会阻塞到**事件循环**

___

参考文献：

-   [What exactly is a Node.js event loop tick?](https://link.segmentfault.com/?enc=zYo6yE6WLH3WUMTGBWDmPg%3D%3D.a8IwClxaxT8ec4Ny%2FUlZbZFgACLZ0o4h4XPvMLHvk1xhL0Efi58aeMVFK43XkOTPHHbgJFlak4V5hTeFVJbO0HgLKn6nBExlDxUo3YXGjcEevEL4cdvMLDe53k6Mgmlu)
    
-   [What is the difference between a thread-based server and an event-based server?](https://link.segmentfault.com/?enc=7M4y4uGAPEQmNCUyaWXKWw%3D%3D.%2FGCFRtrNeH%2FXuGyjLX1ci4q0Q%2BBw6B8P9W1VncI5RiPSKx26Asl4FrmoMTAS3zd5NeXl0DhfhVeaqIamoeaLcLLWtq5gKAeePdh3em3zloiv6eLu1u7pGnO%2F8jNJ0WJo76E15LEKA8k15s5S1LrtlUCd90tO9WwwUfOA2EzioWotliTpb8e1QAG5vcOvQQep)
    
-   [Some confusion about nodejs threads](https://link.segmentfault.com/?enc=sALuy6aNO8u5cjM6wDhM7w%3D%3D.6YgG2PqycQgjtW7mHKS%2BYcO4kAyv5Zt8Hu0Pr5U2RKEJhFF%2BZL75UI8Db95pRPfHpMkRYMLubWRJTdzRGz2ygj6%2BabRii3hyTtynGBYFT0uQysevxQjVDOPY3Ob8NzLai6nPFJvPq4LSZO4usx9IpQ%3D%3D)
    
-   [The JavaScript Event Loop: Explained](https://link.segmentfault.com/?enc=uDfiJ0cYTiUuAOtE6kwy%2BQ%3D%3D.Kn1RGfqTj3gLpSmLhKeTWgjUgTFzY7qpu8qA0D96ppRh0O7v7o5pJVUIxgOE83WQ182tWpdEWt6why%2FsvJEPpuIcXgS4mLwxDlTZe7ZKlr8%3D)
    
-   [poll vs select vs event-based](https://link.segmentfault.com/?enc=Yjt%2F6%2Fohu2MjaUvE9JDUcw%3D%3D.3RhPL%2Fd0EMCD%2BTCmdnZviFnn7cX0IwrLn1Un8LGvabgh%2FGrdRU3QqYb3FfwuKwIz)
    
-   [Linux IO模式及 select、poll、epoll详解](https://segmentfault.com/a/1190000003063859?utm_source=Weibo&utm_medium=shareLink&utm_campaign=socialShare#articleHeader0)