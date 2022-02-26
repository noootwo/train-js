import {
  reactiveHandler,
  readonlyHandler,
  shallowReadonlyHandler,
} from './baseHandlers.js'

export const reactiveFlags = {
  IS_REACTIVE: '__is_reactive',
  IS_READONLY: '__is_readonly',
}

export function reactive(target) {
  return new Proxy(target, reactiveHandler)
}

export function readonly(target) {
  return new Proxy(target, readonlyHandler)
}

export function shallowReadonly(target) {
  return new Proxy(target, shallowReadonlyHandler)
}

export function isReactive(raw) {
  return !!raw[reactiveFlags.IS_REACTIVE]
}

export function isReadonly(raw) {
  return !!raw[reactiveFlags.IS_READONLY]
}

export function isProxy(raw) {
  return isReactive(raw) || isReadonly(raw)
}
