import { hasChanged, isObject } from '../shared/index.js'
import { isTracking, trackEffect, triggerEffect } from './effect.js'
import { reactive } from './reactive.js'

class RefImpl {
  constructor(value) {
    this._raw = value
    this._value = convert(value)
    this.__v_isRef = true
    this.dep = new Set()
  }

  get value() {
    trackRefEffect(this.dep)
    return this._raw
  }

  set value(newValue) {
    if (hasChanged(this._raw, newValue)) {
      this._value = convert(newValue)
      this._raw = newValue
      triggerEffect(this.dep)
    }
  }
}

function trackRefEffect(dep) {
  isTracking() && trackEffect(dep)
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

function isRef(raw) {
  return !!raw.__v_isRef
}

function unRef(raw) {
  return isRef(raw) ? raw.value : raw
}

export function ref(raw) {
  return new RefImpl(raw)
}

function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get: (target, key) => {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    },
  })
}
