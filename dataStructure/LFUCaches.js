/**
 * @param {number} capacity
 */
var LFUCache = function (capacity) {
  this.capacity = capacity
  this.caches = new Map()
  this.times = new Map()
}

/**
 * @param {number} key
 * @return {number}
 */
LFUCache.prototype.get = function (key) {
  if (!this.capacity) return -1
  if (this.caches.has(key)) {
    const current = this.caches.get(key)
    const index = this.times.get(current.count).indexOf({ ...current, key })
    this.times.get(current.count).splice(index, 1)
    console.log(this.times)
    if (this.times.get(current.count).length === 0) {
      this.times.delete(current.count)
      this.minCount = current.count + 1
    }
    current.count++
    if (this.times.has(current.count)) {
      this.times.get(current.count).push({ ...current, key })
    } else {
      this.times.set(current.count, [{ ...current, key }])
    }
    console.log(this.times)
    console.log('get', this.caches)
    return current.value
  } else {
    return -1
  }
}

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LFUCache.prototype.put = function (key, value) {
  if (!this.capacity) return
  if (this.caches.has(key)) {
    const current = this.caches.get(key)
    current.value = value
    const index = this.times.get(current.count).indexOf({ ...current, key })
    this.times.get(current.count).splice(index, 1)
    if (this.times.get(current.count).length === 0) {
      this.times.delete(current.count)
      this.minCount = current.count + 1
    }
    current.count++
    if (this.times.has(current.count)) {
      this.times.get(current.count).push({ ...current, key })
    } else {
      this.times.set(current.count, [{ ...current, key }])
    }
  } else {
    if (this.caches.size === this.capacity) {
      console.log(this.minCount)
      const del = this.times.get(this.minCount).shift()
      if (this.times.get(this.minCount).length === 0) {
        this.times.delete(this.minCount)
      }
      this.caches.delete(del.key)
    }
    const n = { value, count: 1 }
    this.caches.set(key, n)
    if (this.times.has(1)) {
      this.times.get(1).push({ ...n, key })
    } else {
      this.times.set(1, [{ ...n, key }])
    }
    console.log('puttimes', this.times)
    this.minCount = 1
  }
  console.log('put', this.caches)
}

/**
 * Your LFUCache object will be instantiated and called as such:
 * var obj = new LFUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */

// cnt(x) = 键 x 的使用计数
// cache=[] 将显示最后一次使用的顺序（最左边的元素是最近的）
const lfu = new LFUCache(2)
lfu.put(1, 1) // cache=[1,_], cnt(1)=1
lfu.put(2, 2) // cache=[2,1], cnt(2)=1, cnt(1)=1
lfu.get(1) // 返回 1
// cache=[1,2], cnt(2)=1, cnt(1)=2
lfu.put(3, 3) // 去除键 2 ，因为 cnt(2)=1 ，使用计数最小
// cache=[3,1], cnt(3)=1, cnt(1)=2
lfu.get(2) // 返回 -1（未找到）
lfu.get(3) // 返回 3
// cache=[3,1], cnt(3)=2, cnt(1)=2
lfu.put(4, 4) // 去除键 1 ，1 和 3 的 cnt 相同，但 1 最久未使用
// cache=[4,3], cnt(4)=1, cnt(3)=2
lfu.get(1) // 返回 -1（未找到）
lfu.get(3) // 返回 3
// cache=[3,4], cnt(4)=1, cnt(3)=3
lfu.get(4) // 返回 4
// cache=[3,4], cnt(4)=2, cnt(3)=3
