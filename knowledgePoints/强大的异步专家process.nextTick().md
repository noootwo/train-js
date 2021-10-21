在阅读[mqtt.js源码](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2FFrankKai%2FFrankKai.github.io%2Fissues%2F204)的时候，遇到一段很令人疑惑的代码。  
nextTickWork中调用`process.nextTick(work)`，其中函数work又调用了nextTickWork。  
这怎么这想递归呢？又有点像死循环？  
到底是怎么回事啊，下面我们来系统性学习一下`process.nextTick()`。

```
writable._write = function (buf, enc, done) {
    completeParse = done
    parser.parse(buf)
    work() 
}
function work () {
  var packet = packets.shift()
  if (packet) {
    that._handlePacket(packet, nextTickWork) 
  } else {
    var done = completeParse
    completeParse = null
    if (done) done()
  }
}
function nextTickWork () {
  if (packets.length) {
    process.nextTick(work) 
  } else {
    var done = completeParse
    completeParse = null
    done()
  }
}
```

-   初识`process.nextTick()`
    -   语法（callback和可选args）
    -   `process.nextTick()`知识点
    -   `process.nextTick()`使用示例
        -   最简单的例子
        -   `process.nextTick()`可用于控制代码执行顺序
        -   `process.nextTick()`可完全异步化API
-   如何理解process.nextTick()？
-   为什么说process.nextTick()是更加强大的异步专家？
    -   process.nextTick()比setTimeout()更严格的延迟调用
    -   process.nextTick()解决的实际问题
-   为什么要用process.nextTick()？
    -   允许用户处理error，清除不需要的资源，或者在事件循环前再次尝试请求
    -   有时确保callback在call stack unwound（解除）后，event loop继续循环前 调用
-   回顾一下

### 初识`process.nextTick()`

#### 语法（callback和可选args）

```
process.nextTick(callback[, ...args])
```

-   callback 回调函数
-   args 调用callback时额外传的参数

#### `process.nextTick()`知识点

-   `process.nextTick()`会将callback添加到”next tick queue“
-   ”next tick queue“会在当前JavaScript stack执行完成后，下一次event loop开始执行前按照FIFO出队
-   如果递归调用`process.nextTick()`可能会导致一个无限循环，需要去适时终止递归。
-   `process.nextTick()`可用于控制代码执行顺序。保证方法在对象完成constructor后但是在I/O发生前调用。
-   `process.nextTick()`可完全异步化API。API要么100%同步要么100%异步是很重要的，可以通过`process.nextTick()`去达到这种保证

#### `process.nextTick()`使用示例

-   最简单的例子
-   `process.nextTick()`对于API的开发很重要

##### 最简单的例子

```
console.log('start');
process.nextTick(() => {
  console.log('nextTick callback');
});
console.log('scheduled');



```

##### `process.nextTick()`可用于控制代码执行顺序

`process.nextTick()`可用于赋予用户一种能力，去保证方法在对象完成constructor后但是在I/O发生前调用。

```
function MyThing(options) {
  this.setupOptions(options);
  process.nextTick(() => {
    this.startDoingStuff();
  });
}
const thing = new MyThing();
thing.getReadyForStuff(); 
```

##### API要么100%同步要么100%异步时很重要的

API要么100%同步要么100%异步是很重要的，可以通过`process.nextTick()`去使得一个API完全异步化达到这种保证。

```

function maybeSync(arg, cb) {
  if (arg) {
    cb();
    return;
  }
  fs.stat('file', cb);
}
```

```

const maybeTrue = Math.random() > 0.5;
maybeSync(maybeTrue, () => {
  foo();
});
bar();
```

如何使得API完全是一个async的API呢？或者说如何保证foo()在bar()之后调用呢？  
通过process.nextTick()完全异步化。

```

function definitelyAsync(arg, cb) {
  if (arg) {
    process.nextTick(cb);
    return;
  }
  fs.stat('file', cb);
}
```

### 如何理解process.nextTick()

你也许会发现`process.nextTick()`不会在代码中出现，即使它是异步API的一部分。这是为什么呢？因为`process.nextTick()`不是event loop的技术部分。取而代之的是，`nextTickQueue`会在当前的操作完成后执行，不考虑event loop的当前阶段。在这里，`operation`的定义是指从底层的C/C++处理程序到处理需要执行的JavaScript的转换。

回过头来看我们的程序，任何阶段你调用`process.nextTick()`，所有传递进`process.nextTick()`的callback会在event loop继续前完成解析。这会造成一些糟糕的情况，**通过建立一个递归的process.nextTick()调用，它允许你“starve”你的I/O。**，这样可以使得event loop不到达poll阶段。

### 为什么说process.nextTick()是更加强大的异步专家？

#### process.nextTick()比setTimeout()更精准的延迟调用

为什么说“process.nextTick()比setTimeout()更精准的延迟调用”呢？  
不要着急，带着疑问去看下文即可。看懂就能找到答案。

为什么Node.js要设计这种递归的`process.nextTick()`呢 ？这是因为Node.js的设计哲学的一部分是**API必须是async的，即使它没有必要。** 看下下面的例子：

```
function apiCall(arg, callback) {
    if(typeof arg !== 'string'){
        return process.nextTick(callback, new TypeError('argument should be string'));
    }
}
```

代码片段做了argument的检查，如果它不是string类型的话，它会将一个error传递进callback中。这个API最近进行了更新，允许将参数传递到`process.nextTick()`，从而允许在callback之后传递的任何参数作为回调的参数进行传递，这样就不用嵌套函数了。

我们现在做的是将一个error传递到user，但是必须在我们允许执行的代码执行完之后。通过使用`process.nextTick()`，我们可以保证`apiCall`总是在用户代码的其余部分和允许事件循环继续之前运行它的callback。为了实现这一点，JS call stack可以被展开，然后immediately执行提供的回调，从而允许一个人递归调用`process.nextTick()`而不至于抛出`RangeError: Maximum call stack size exceeded from v8.`）

一句话概括的话就是：**`process.nextTick()`可以保证我们要执行的代码会正常执行，最后再抛出这个error。这个操作是setTimeout()无法做到的，因为我们并不知道执行那些代码需要多长时间。**

是怎么做到process.nextTick(callback)比setTimeout()更严格的延迟调用的呢？  
**process.nextTick(callback)可以保证在这一次事件循环的call stack 解除（unwound）后，在下一次事件循环前，调用callback。**

可以把原因再讲得详细一点吗？

**process.nextTick()会在这一次event loop的call stack清空后（下一次event loop开始前）再调用callback。而setTimeout()是并不知道什么时候call stack清空的。我们setTimeout(cb, 1000)，可能1s后，由于种种原因call 栈中还留存了几个函数没有调用，调大到10秒又很不合适，因为它可能1.1秒就执行完了。**

相信有一定开发经验的同学一看就懂，一看就知道process.nextTick()的强大了。  
心里默念：**“终于不用调坑爹的setTimeout延迟参数了！”**

#### 强大的process.nextTick()解决的实际问题

这个哲学会导致一些潜在问题。下面来看下这段代码：

```
let bar;

function someAsyncApiCall(callback) { callback(); }

someAsyncApiCall(() => {
  
  console.log('bar', bar); 
});
bar = 1;
```

用户定义了有一个异步签名的`someAsyncApiCall()`，但是它实际上同步执行了。当someAsyncApiCall()调用的时候，内部的callback在异步操作还没完成前就调用了，callback尝试获得bar的引用，但是作用域内是没有这个变量的，因为script还没有执行到`bar = 1`这一步。

**有什么办法可以保证在赋值之后再调用这个函数呢？**

通过将`callback`传递进`process.nextTick()`，script可以成功执行，并且**可以访问到所有变量和函数等等，并且在callback调用之前已经初始化好。** 它拥有允许不允许事件循环继续的优点。**对于用户在event loop想要继续运行之前alert一个error是很有用的。**

下面是通过`process.nextTick()`改进的上面的代码：

```
let bar;
function someAsyncApiCall(callback) {
    process.nextTick(callback);
}
someAsyncApiCall(() => {
  console.log('bar', bar); 
});
bar = 1;
```

还有一个真实世界的例子：

```
const server = net.createServer(() => {}).listen(8080);
server.on('listening', () => {});
```

当我们传递一个端口号进去时，端口号会被立刻绑定。所以'listening' callback可以被立即调用。问题是`.on('listening');`这个callback可能还没设置呢？这要怎么办?

为了做到在**精准无误的监听到listen的动作**，**将对‘listening’事件的监听操作，队列到nextTick()，从而可以允许代码完全运行完毕。** 这可以使得用户设置任何他们想要的事件。

### 为什么要用process.nextTick()？

-   允许用户处理error，清除不需要的资源，或者在事件循环前再次尝试请求
-   有时确保callback在call stack unwound（解除）后，event loop继续循环前 调用

#### 允许用户处理error，清除不需要的资源，或者在事件循环前再次尝试请求

这里有一个匹配用户期望的例子。

```
const server = net.createServer();
server.on('connection', (conn) => { });

server.listen(8080);
server.on('listening', () => { });
```

`listen()`在event.loop循环的开始运行，但是listening callback被放置在`setImmediate()`中。除非传入hostname，否则立即绑定端口。event loop在处理的时候，它必须在poll阶段，这也就是意味着没有机会接收到连接，从而允许在侦听listen事件前触发connection事件。

#### 有时确保callback在call stack unwound（解除）后，event loop继续循环前 调用

再来看一个例子：  
运行一个继承了EventEmitter的function constructor，它想在constructor内部发出一个'event'事件。

```
const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this);
  this.emit('event');
}
util.inherits(MyEmitter, EventEmitter);
const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!'); 
});
```

无法在constructor内理解emit一个event，因为script不会运行到用户监听event响应callback的位置。所以在constructor内部，可以使用`process.nextTick`设置一个callback在constructor完成之后emit这个event，所以最终的代码如下：

```
const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this);
  
  process.nextTick(() => {
    this.emit('event');
  });
}
util.inherits(MyEmitter, EventEmitter);
const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!'); 
});
```

### 回顾一下

回过头来看下mqtt.js用于接收消息的message event源码中的process.nextTick()

> process.nextTick()确保work函数准确在这一次call stack清空后，下一次event loop开始前调用。

```
writable._write = function (buf, enc, done) {
    completeParse = done
    parser.parse(buf)
    work() 
}
function work () {
  var packet = packets.shift()
  if (packet) {
    that._handlePacket(packet, nextTickWork) 
  } else {
    
    var done = completeParse
    completeParse = null
    if (done) done()
  }
}
function nextTickWork () {
  if (packets.length) {
    process.nextTick(work) 
  } else {
   
    var done = completeParse
    completeParse = null
    done()
  }
}
```

通过对process.nextTick()的学习以及对源码的理解，我们得出：  
流写入本地执行work()，若接收到有效的数据包，开始process.nextTick()递归。

-   开始nextTick的条件：if(packet)/if (packets.length) 也就是说有接收到websocket包时开始。
-   递归nextTick的过程：work()->nextTickWork()->process.nextTick(work)。
-   结束nextTick的条件：packet为空或者packets为空，通过completeParse=null，done()结束递归。
-   如果对work不加process.nextTick会怎样？

```
function nextTickWork () {
  if (packets.length) {
    work() 
  }
}
```

会造成当前的event loop永远不会中止，一直处于阻塞状态，造成一个无限循环。  
正是因为有了process.nextTick()，才能确保work函数准确在这一次call stack清空后，下一次event loop开始前调用。

参考链接：

-   [https://nodejs.org/uk/docs/guides/event-loop-timers-and-nexttick/](https://links.jianshu.com/go?to=https%3A%2F%2Fnodejs.org%2Fuk%2Fdocs%2Fguides%2Fevent-loop-timers-and-nexttick%2F)
-   [https://nodejs.org/dist/latest-v13.x/docs/api/process.html#process\_process\_nexttick\_callback\_args](https://links.jianshu.com/go?to=https%3A%2F%2Fnodejs.org%2Fdist%2Flatest-v13.x%2Fdocs%2Fapi%2Fprocess.html%23process_process_nexttick_callback_args)
-   [https://github.com/mqttjs/MQTT.js/blob/master/lib/client.js](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fmqttjs%2FMQTT.js%2Fblob%2Fmaster%2Flib%2Fclient.js)
-   [https://github.com/FrankKai/FrankKai.github.io/issues/204](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2FFrankKai%2FFrankKai.github.io%2Fissues%2F204)
