export function throttle(fn, time){
  let canRun = true
  return function () {
    if(!canRun) return
    canRun = false
    setTimeout(() => {
      fn.apply(this, arguments)
      canRun = true
    }, time)
  }
}
