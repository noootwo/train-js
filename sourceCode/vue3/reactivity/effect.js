import { extend } from '../shared/index.js'

let activeEffect
let shouldTrack = true
export class ReactiveEffect {
  deps = []
  active = true
  constructor(fn, scheduler) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    if (!this.active) return this._fn()

    shouldTrack = true
    activeEffect = this
    const result = this._fn()
    shouldTrack = false
    activeEffect = null

    return result
  }

  stop() {
    if (this.active) {
      cleanEffect(this)
      if (this.onStop) {
        this.onStop()
      }

      this.active = false
    }
  }
}

function cleanEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect)
  })

  effect.deps.length = 0
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

let targetMap = new Map()
export function track(target, key) {
  if (!isTracking()) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffect(dep)
}

export function trackEffect(dep) {
  if (!activeEffect) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  triggerEffect(dep)
}

export function triggerEffect(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)

  _effect.run()

  const runner = _effect.run.bind(_effect)

  return runner
}
