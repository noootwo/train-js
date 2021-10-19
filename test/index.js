import { debounce } from '../performance/debounce.js'
import { throttle } from '../performance/throttle.js'

function sayHi() {
  console.log('防抖成功');
}
var inp = document.getElementById('inp')
inp.addEventListener('input', debounce(sayHi, 500))

window.addEventListener('resize', throttle((e) => {console.log(e.target.innerWidth, e.target.innerHeight)}, 500))