/**
 * @param {number} capacity
 */
var LFUCache = function (capacity) {
  this.capacity = capacity
  this.caches = new Map()
  this.times = new Map()
  this.minCount = 1
}

/**
 * @param {number} key
 * @return {number}
 */
LFUCache.prototype.get = function (key) {
  if (!this.capacity) return -1
  if (this.caches.has(key)) {
    const current = this.caches.get(key)
    this.times.get(current.count).delete({ ...current, key })
    current.count++
    if (this.times.has(current.count)) {
      this.times.get(current.count).add({ ...current, key })
    } else {
      this.times.set(current.count, new Set([{ ...current, key }]))
    }
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
    this.times.get(current.count).delete({ ...current, key })
    current.count++
    if (this.times.has(current.count)) {
      this.times.get(current.count).add({ ...current, key })
    } else {
      this.times.set(current.count, new Set([{ ...current, key }]))
    }
  } else {
    if (this.caches.size === this.capacity) {
      const current = this.caches.get(key)
    }
    this.caches.set(key, {
      value,
      count: 1,
    })
  }
  console.log(this.caches)
}

/**
 * Your LFUCache object will be instantiated and called as such:
 * var obj = new LFUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */
