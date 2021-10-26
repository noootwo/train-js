其中一个主要的区别在于浏览器的event loop 和nodejs的event loop 在处理异步事件的顺序是不同的,nodejs中有micro event;其中Promise属于micro event 该异步事件的处理顺序就和浏览器不同.nodejs V11.0以上 这两者之间的顺序就相同了.

`function test () {  
   console.log('start')  
    setTimeout(() => {  
        console.log('children2')  
        Promise.resolve().then(() => {console.log('children2-1')})  
    }, 0)  
    setTimeout(() => {  
        console.log('children3')  
        Promise.resolve().then(() => {console.log('children3-1')})  
    }, 0)  
    Promise.resolve().then(() => {console.log('children1')})  
    console.log('end')   
}  
  
test()  
  
// 以上代码在node11以下版本的执行结果(先执行所有的宏任务，再执行微任务)  
// start  
// end  
// children1  
// children2  
// children3  
// children2-1  
// children3-1  
  
// 以上代码在node11及浏览器的执行结果(顺序执行宏任务和微任务)  
// start  
// end  
// children1  
// children2  
// children2-1  
// children3  
// children3-1`