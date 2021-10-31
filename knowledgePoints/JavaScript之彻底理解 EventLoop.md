## 前言

`Event Loop`即事件循环，是浏览器或`Node`解决单线程运行时不会阻塞的一种机制。

在正式学习`Event Loop`之前，先需要解决几个问题：

1.  什么是同步与异步？
    
2.  `JavaScript`是一门单线程语言，那如何实现异步？
    
3.  同步任务和异步任务的执行顺序如何？
    
4.  异步任务是否存在优先级？
    

## 同步与异步

计算机领域中的同步与异步和我们现实社会的同步和异步正好相反。现实中的同步，就是同时进行，突出的是"同"，比如看足球比赛的时候吃着零食，两件事情同时发生；异步就是不同时。但计算机中与现实存在一定差异。

### 举个栗子

天气冷了，早上刚醒来想喝点热水暖暖身子，但这每天起早贪黑996，晚上回来太累躺下就睡，没开水啊，没法子，只好急急忙忙去烧水。

现在早上太冷了啊，不由得在被窝里面多躺了一会，收拾的时间紧紧巴巴，不能空等水开，于是我便趁此去洗漱，收拾自己。洗漱完，水开了，喝到暖暖的热水，舒服啊！

舒服完，开启新的996之日，打工人出发！

烧水和洗漱是在同时间进行的，这就是**计算机中的异步**。

**计算机中的同步**是连续性的动作，上一步未完成前，下一步会发生堵塞，直至上一步完成后，下一步才可以继续执行。例如：只有等水开，才能喝到暖暖的热水。

## 单线程却可以异步？

`JavaScript`的确是一门单线程语言，但是浏览器`UI`是多线程的，异步任务借助浏览器的线程和`JavaScript`的执行机制实现。例如，`setTimeout`就借助浏览器定时器触发线程的计时功能来实现。

### 浏览器线程

1.  `GUI`渲染线程
    

-   绘制页面，解析HTML、CSS，构建DOM树等
    
-   页面的重绘和重排
    
-   与JS引擎互斥(JS引擎阻塞页面刷新)
    

3.  `JS`引擎线程
    

-   js脚本代码执行
    
-   负责执行准备好的事件，例如定时器计时结束或异步请求成功且正确返回
    
-   与GUI渲染线程互斥
    

5.  事件触发线程
    

-   当对应的事件满足触发条件，将事件添加到js的任务队列末尾
    
-   多个事件加入任务队列需要排队等待
    

7.  定时器触发线程
    

-   负责执行异步的定时器类事件：setTimeout、setInterval等
    
-   浏览器定时计时由该线程完成，计时完毕后将事件添加至任务队列队尾
    

9.  `HTTP`请求线程
    

-   负责异步请求
    
-   当监听到异步请求状态变更时，如果存在回调函数，该线程会将回调函数加入到任务队列队尾
    

## 同步与异步执行顺序

1.  `JavaScript`将任务分为同步任务和异步任务，同步任务进入主线中中，异步任务首先到`Event Table`进行回调函数注册。
    
2.  当异步任务的**触发条件满足**，将回调函数从`Event Table`压入`Event Queue`中。
    
3.  主线程里面的同步任务执行完毕，系统会去`Event Queue`中读取异步的回调函数。
    
4.  只要主线程空了，就会去`Event Queue`读取回调函数，这个过程被称为`Event Loop`。
    

### 举个栗子

> -   setTimeout(cb, 1000)，当1000ms后，就将cb压入Event Queue。
>     
> -   ajax(请求条件, cb)，当http请求发送成功后，cb压入Event Queue。
>     

### EventLoop执行流程

**Event Loop**执行的流程如下：![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

下面一起来看一个例子，熟悉一下上述流程。

```
// 下面代码的打印结果？// 同步任务 打印 firstconsole.log("first");     setTimeout(() => {        // 异步任务 压入Event Table 4ms之后cb压入Event Queue  console.log("second");},0)// 同步任务 打印lastconsole.log("last");     // 读取Event Queue 打印second复制代码
```

### 常见异步任务

-   `DOM`事件
    
-   `AJAX`请求
    
-   定时器`setTimeout`和`setlnterval`
    
-   `ES6`的`Promise`
    

## 异步任务的优先级

下面继续来看一个案例：

```
setTimeout(() => {  console.log(1);}, 1000)new Promise(function(resolve){    console.log(2);    for(var i = 0; i < 10000; i++){        i == 99 && resolve();    }}).then(function(){    console.log(3)});console.log(4)复制代码
```

按照上面的学习：可以很轻松得出案例的打印结果：**2，4，1，3**。

> Promise定义部分为同步任务，回调部分为异步任务

将案例代码在控制台运行，最终返回结果却有些出人意料：

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

在这里插入图片描述

刚看到如此结果，我的第一感觉是，`setTimeout`函数1s触发太慢导致它加入`Event Queue`的时间晚于`Promise.then`

于是我修改了`setTimeout`的回调时间为0(浏览器最小触发时间为`4ms`)，但结果仍为发生改变。

那么也就意味着，`JavaScript`的异步任务是存在优先级的。

## 宏任务和微任务

`JavaScript`除了广义上将任务划分为同步任务和异步任务，还对异步任务进行了更精细的划分。异步任务又进一步分为微任务和宏任务。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

在这里插入图片描述

> -   `history traversal`任务（`h5`当中的历史操作）
>     
> -   `process.nextTick`（`nodejs`中的一个异步操作）
>     
> -   `MutationObserver`（`h5`里面增加的，用来监听`DOM`节点变化的）
>     

宏任务和微任务分别有各自的任务队列`Event Queue`，即宏任务队列和微任务队列。

## Event Loop执行过程

了解到宏任务与微任务过后，我们来学习宏任务与微任务的执行顺序。

1.  代码开始执行，创建一个全局调用栈，`script`作为宏任务执行
    
2.  执行过程过同步任务立即执行，异步任务根据异步任务类型分别注册到微任务队列和宏任务队列
    
3.  同步任务执行完毕，查看微任务队列
    

-   若存在微任务，将微任务队列全部执行(包括执行微任务过程中产生的新微任务)
    
-   若无微任务，查看宏任务队列，执行第一个宏任务，宏任务执行完毕，查看微任务队列，重复上述操作，直至宏任务队列为空
    

更新一下`Event Loop`的执行顺序图：

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

在这里插入图片描述

## 总结

在上面学习的基础上，重新分析当前案例：

```
setTimeout(() => {  console.log(1);}, 1000)new Promise(function(resolve){    console.log(2);    for(var i = 0; i < 10000; i++){        i == 99 && resolve();    }}).then(function(){    console.log(3)});console.log(4)复制代码
```

分析过程见下图：![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

## 面试题

文章的最后附赠几道经典面试题，可以测试一下自己对`Event Loop`的掌握程度。

### 题目一

```
console.log('script start');setTimeout(() => {    console.log('time1');}, 1 * 2000);Promise.resolve().then(function() {    console.log('promise1');}).then(function() {    console.log('promise2');});async function foo() {    await bar()    console.log('async1 end')}foo()async function errorFunc () {    try {        await Promise.reject('error!!!')    } catch(e) {        console.log(e)    }    console.log('async1');    return Promise.resolve('async1 success')}errorFunc().then(res => console.log(res))function bar() {    console.log('async2 end') }console.log('script end');复制代码
```

### 题目二

```
setTimeout(() => {    console.log(1)}, 0)const P = new Promise((resolve, reject) => {    console.log(2)    setTimeout(() => {        resolve()        console.log(3)    }, 0)})P.then(() => {    console.log(4)})console.log(5)复制代码
```

### 题目三

```
var p1 = new Promise(function(resolve, reject){    resolve("2")})setTimeout(function(){    console.log("1")},10)p1.then(function(value){    console.log(value)})setTimeout(function(){    console.log("3")},0)复制代码
```

关于本文

https://juejin.cn/post/7020328988715270157

## 最后

欢迎关注【前端瓶子君】✿✿ヽ(°▽°)ノ✿  

回复「算法」，加入前端编程源码算法群，每日一道面试题（工作日），第二天瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持

 》》面试官也在看的算法资料《《  

“在看和转发”就是最大的支持