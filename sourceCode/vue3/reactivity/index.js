import { reactive } from './reactive.js'
import { ref } from './ref.js'
import { effect } from './effect.js'
import { computed } from './computed.js'

const foo = reactive({
  a: 1,
})

const refFoo = ref(0)

// const runner = effect(() => {
//   console.log(refFoo.value)
// })

foo.a++

const newFoo = computed(() => {
  console.log('computed')
  return refFoo.value++
})

console.log()
console.log(newFoo.value)

window.foo = refFoo
window.newFoo = newFoo
