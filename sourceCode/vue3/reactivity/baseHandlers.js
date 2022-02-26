import { extend, isObject } from '../shared/index.js'
import { reactive, readonly, reactiveFlags } from './reactive.js'
import { track, trigger } from './effect.js'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, isShallow = false) {
  return function (target, key) {
    if (key === reactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === reactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    if (isShallow) return res

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    track(target, key)

    return res
  }
}

function createSetter() {
  return function (target, key, value) {
    const res = Reflect.set(target, key, value)

    trigger(target, key)

    return res
  }
}

export const reactiveHandler = {
  get,
  set,
}

export const readonlyHandler = {
  get: readonlyGet,
  set: function (target, key) {
    console.log(`${target}的${key}属性不能修改，因为${target}是readonly。`)

    return
  },
}

export const shallowReadonlyHandler = extend({}, readonlyHandler, {
  get: shallowReadonlyGet,
})
