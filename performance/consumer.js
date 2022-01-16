function consumer(fn, time) {
  let task = [],
    timer
  return function (...args) {
    tasks.push(fn.bind(this, ...args))
    if (timer == null) {
      timer = setInterval(() => {
        tasks.shift().call(this)
        if (tasks.length <= 0) {
          clearInterval(timer)
          timer = null
        }
      }, time)
    }
  }
}
