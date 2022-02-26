export const isObject = (val) => val !== null && typeof val === 'object'

export const extend = Object.assign

export const hasChanged = (val, newVal) => !Object.is(val, newVal)
