/*
 * @Description: 手写vue3 -- reactivity
 * @Date: 2022-01-10 13:00:04
 * @LastEditTime: 2022-01-10 13:26:08
 * @FilePath: \train-js\sourceCode\reactivity.js
 */

function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key)
      track(target, key)
      return res
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      trigger(target, key)
      return res
    },
  })
}

let activeEffect

class ReactiveEffect {
  constructor(fn) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    this._fn()
  }
}

let targetsMap = new Map()
function track(target, key) {
  let depsMap = targetsMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetsMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  dep.add(activeEffect)
}

function trigger(target, key) {
  let depsMap = targetsMap.get(target)
  let dep = depsMap.get(key)
  for (const fn of dep) {
    fn.run()
  }
}

function effect(fn) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}

const a = reactive({
  b: 1,
})

let c
effect(() => {
  c = a.b + 1
})

console.log(a.b)
console.log(c)
a.b++
console.log(a.b)
console.log(c)
