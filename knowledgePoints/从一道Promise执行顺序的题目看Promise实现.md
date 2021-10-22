之前在网上看到一道Promise执行顺序的题目——打印以下程序的输出：

```
new Promise(resolve => {
    console.log(1);
    resolve(3);
}).then(num => {
    console.log(num)
});
console.log(2)
```

这道题的输出是123，为什么不是132呢？因为我一直理解Promise是没有异步功能，它只是帮忙解决异步回调的问题，实质上是和回调是一样的，所以如果按照这个想法，resolve之后应该会立刻then。但实际上并不是。难道用了setTimeout？

如果在promise里面再加一个promise：

```
new Promise(resolve => {
    console.log(1);
    resolve(3);
    Promise.resolve().then(()=> console.log(4))
}).then(num => {
    console.log(num)
});
console.log(2)
```

执行顺序是1243，第二个Promise的顺序会比第一个的早，所以直观来看也是比较奇怪，这是为什么呢？

Promise的实现有很多库，有jQuery的deferred，还有很多提供polyfill的，如[es6-promise](https://link.zhihu.com/?target=https%3A//www.npmjs.com/package/es6-promise)，[lie](https://link.zhihu.com/?target=https%3A//github.com/calvinmetcalf/lie)等，它们的实现都基于[Promise/A+](https://link.zhihu.com/?target=https%3A//promisesaplus.com/)标准，这也是ES6的Promise采用的。

为了回答上面题目的执行顺序问题，必须得理解Promise是怎么实现的，所以得看那些库是怎么实现的，特别是我错误地认为不存在的Promise的异步是怎么实现的，因为最后一行的console.log(2)它并不是最后执行的，那么必定有某些类似于setTimeout的异步机制让上面同步的代码在异步执行，所以它才能在代码执行完了之后才执行。

当然我们不只是为了解答一道题，主要还是借此了解Promise的内部机制。读者如果有时间有兴趣可以自行分析，然后再回过头来比较一下本文的分析。或者你可以跟着下面的思路，操起鼠标和键盘和我一起干。

这里使用lie的库，相对于es6-promise来说代码更容易看懂，先npm install一下：

让代码在浏览器端运行，准备以下html：

```
<!DOCType html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <script src="node_modules/lie/dist/lie.js"></script>
    <script src="index.js"></script>
</body>
</html>
```

其中index.js的内容为：

```
console.log(Promise);
new Promise(resolve => {
    console.log(1);
    resolve(3);
    Promise.resolve().then(()=> console.log(4))
}).then(num => {
    console.log(num)
});
console.log(2);
```

把Promise打印一下，确认已经把原生的那个覆盖了，对比如下：

![](https://pic2.zhimg.com/v2-7581bb41e57e5705853b2c44a8d09e8d_b.jpg)

因为原生的Promise我们是打不了断点的，所以才需要借助一个第三方的库。

我们在第4行的resolve(3)那里打个断点进去看一下resolve是怎么执行的，层层进去，最后的函数是这个：

![](https://pic2.zhimg.com/v2-60d00fde6dae7c293e7028464cf4e5e5_b.jpg)

我们发现，这个函数好像没干啥，它就是设置了下self的state状态为FULFILLED（完成），并且把结果outcome设置为调resolve传进来的值，这里是3，如果resolve传来是一个Promise的话就会进入到上图187行的Promise链处理，这里我们不考虑这种情况。这里的self是指向一个Promise对象：

![](https://pic2.zhimg.com/v2-6bbb2bf77801e10b1f3180e995cb9219_b.jpg)

它主要有3个属性——outcome、queue、state，其中outcome是resolve传进来的结果，state是Promise的状态，在第83行的代码可以查到Promise的状态总共有3种：

```
var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];
```

Rejected失败，fulfilled成功，pending还在处理中，在紧接着89行的Promise的构造函数可以看到，state初始化的状态为pending：

```
function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}
```

并且在右边的调用栈可以看到，resolver是由Promise的构造函数触发执行的，即当你new Promise的时候就会执行传参的函数，如下图所示：

![](https://pic4.zhimg.com/v2-cd8ac82ce860475d87f24002ff84db07_b.jpg)

传进来的函数支持两个参数，分别是resolve和reject回调：

```
let resolver = function(resolve, reject) {
    if (success) resolve();
    else reject();
};

new Promise(resolver);
```

这两个函数是Promise内部定义，但是要在你的函数里调一下它的函数，告诉它什么时候成功了，什么时候失败了，这样它才能继续下一步的操作。所以这两个函数参数是传进来的，它们是Promise的回调函数。Promise是怎么定义和传递这两个函数的呢？还是在刚刚那个断点的位置，但是我们改变一下右边调用栈显示的位置：

![](https://pic4.zhimg.com/v2-47b904e20de66b89cfd6502d414c3bcb_b.jpg)

上图执行的thenable函数就是我们传给它的resolver，然后传递onSuccess和onError，分别是我们在resolver里面写的resolve和reject这两个参数。如果我们调了它的resolve即onSuccess函数，它就会调236行的handlers.resolve就到了我们第一次打断点的那张图，这里再放一次：

![](https://pic1.zhimg.com/v2-5bf63efa99b5c48bda466f75040015b8_b.jpg)

然后去设置当前Promise对象的state，outcome等属性。这里没有进入到193行的while循环里，因为queue是空的。这个地方下文会继续提到。

接着，我们在then那里打个断点进去看一下：

![](https://pic2.zhimg.com/v2-ea16e6b782b8df373ef6194596c6afb9_b.jpg)

then又做了些什么工作呢？如下图所示：

![](https://pic2.zhimg.com/v2-66cca23e160187cc1ca934ea60b2019d_b.jpg)

then可以传两个参数，分别为成功回调和失败回调。我们给它传了一个成功回调，即上图划线的地方。并且由于在resolver里面已经把state置成fulfilled完成态了，所以它会执行unwrap函数，并传递成功回调、以及resolve给的结果outcome（还有一个参数promise，主要是用于返回，形成then链）。

unwrap函数是这样实现的：

![](https://pic3.zhimg.com/v2-1e979117eeca590980dd082a72d0710e_b.jpg)

在167行执行then里传给Promise的成功回调，并传递结果outcome。

这段代码是包在一个immediate函数里的，这里就是解决Promise异步问题的关键了。并且我们在node\_modules目录里面，也发现了lie使用了[immediate库](https://link.zhihu.com/?target=https%3A//www.npmjs.com/package/immediate)，它可以实现一个**nextTick**的功能，即在当前代码逻辑单元同步执行完了之后立刻执行，相当于setTimeout 0，但是它又不是直接用setTimeout 0实现的。

我们重点来看一下它是怎么实现一个nextTick的功能的。immediate里面会调一个scheduleDrain（drain是排水的意思）：

```
function immediate(task) {
  // 这个判断先忽略
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}
```

实现逻辑在这个scheduleDrain，它是这么实现的：

```
var Mutation = global.MutationObserver || global.WebKitMutationObserver;
var scheduleDrain = null;
{
  // 浏览器环境，IE11以上支持
  if (Mutation) {
      // ...
  } 
  // Node.js环境
  else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined')

  }
  // 低浏览器版本解决方案
  else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {

  }
  // 最后实在没办法了，用最次的setTimeout
  else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}
```

它会有一个兼容性判断，优先使用MutationObserver，然后是使用script标签的方式，这种到IE6都支持，最后啥都不行就用setTimeout 0.

我们主要看一下Mutation的方式是怎么实现的，[MDN](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)上有介绍这个MutationObserver的用法，可以用它来监听DOM结点的变化，如增删、属性变化等。Immediate是这么实现的：

```
if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    // 监听节点的data属性的变化
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      // 让data属性发生变化，在0/1之间不断切换，
      // 进而触发observer执行nextTick函数
      element.data = (called = ++called % 2);
    };
  }
```

使用nextTick回调注册一个observer观察者，然后创建一个DOM节点element，成为observer的观察对象，观察它的data属性。当需要执行nextTick函数的时候，就调一下scheduleDrain改变data属性，就会触发观察者的回调nextTick。它是异步执行的，在当前代码单元执行完之后立刻之行，但又是在setTimeout 0之前执行的，也就是说，以下代码，第一行的5是最后输出的：

```
setTimeout(()=> console.log(5), 0);
new Promise(resolve => {
    console.log(1);
    resolve(3);
    // Promise.resolve().then(()=> console.log(4))
}).then(num => {
    console.log(num)
});
console.log(2);
```

这个时候，我们就可以回答为什么上面代码的输出顺序是123，而不是132了。第一点可以肯定的是1是最先输出的，因为new一个Promise之后，传给它的resolver同步执行，所以1最先打印。执行了resolve(3)之后，就会把当前Promiser对象的state改成完成态，并记录结果outcome。然后跳出来执行then，把传给then的成功回调给immediate在nextTick执行，而nextTick是使用Mutation异步执行的，所以3会在2之后输出。

如果在promise里面再写一个promsie的话，由于里面的promise的then要比外面的promise的then先执行，也就是说它的nextTick更先注册，所以4是在3之前输出。

这样基本上就解释了Promise的执行顺序的问题。但是我们还没说它的nextTick是怎么实现的，上面代码在执行immediate的时候把成功回调push到一个全局的数组queue里面，而nextTick是把这些回调按顺序执行，如下代码所示：

```
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    // 把queue清空
    queue = [];
    i = -1;
    // 执行当前所有回调
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}
```

它会先把排水的变量draining设置成true，然后处理完成之后再设置成false，我们再回顾一下刚刚执行immediate的判断：

```
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}
```

由于JS是单线程的，所以我觉得这个draining的变量判断好像没有太大的必要。另外一个判断，当queue为空时，push一个变量进来，这个时候queue只有1个元素，返回值就为1。所以如果之前已经push过了，那么这里就不用再触发nextTick，因为第一次的push会把所有queue回调元素都执行的，只要保证后面的操作有被push到这个queue里面就好了。所以这个判断是一个优化。

另外，es6-promise的核心代码是一样的，只是它把immediate函数改成asap(as soon as possible)，它也是优先使用Mutation.

还有一个问题，上面说的resolver的代码是同步，但是我们经常用Promise是用在异步的情况，resolve是异步调的，不是像上面同步调的，如：

```
let resolver = function(resolve) {
    setTimeout(() => {
        // 异步调用resolve
        resolve();
    }, 2000);
    // resolver执行完了还没执行resolve
};
new Promise(resolver).then(num => console.log(num));
```

这个时候，同步执行完resolver，但还没执行resolve，所以在执行then的时候这个Promise的state还是pending的，就会走到134的代码（刚刚执行的是132行的unwrap）：

![](https://pic4.zhimg.com/v2-fd7e1565f156d4c95578fb9d3733ce0b_b.jpg)

它会创建一个QueueItem然后放到当前Promise对象的queue属性里面（注意这里的queue和上面说的immediate里全局的queue是两个不同的变量）。然后异步执行结束调用resolve，这个时候queue不为空了：

![](https://pic4.zhimg.com/v2-40cfdd88eb77ad13b92266c40df20413_b.jpg)

因为then是可以then多次的，所以成功回调可能会有多个。它也是调用immediate，在nextTick的时候执行的。

也就是说如果是**同步resolve**的，是通过MutationObserver/Setimeout 0之类的方式在当前的代码单元执行完之后立刻执行成功回调；而如果是**异步resolve**的，是先把成功回调放到当前Promise对象的一个队列里面，等到异步结束了执行resolve的时候再用同样的方式在nextTick调用成功回调。

我们还没说失败的回调，但大体是相似的。