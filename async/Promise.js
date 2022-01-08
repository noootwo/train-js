class myPromise {
  static status = {
    PENDING: 'pending',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected',
  }

  constructor(func) {
    this.PromiseState = myPromise.status.PENDING
    this.PromiseResult = null
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    try {
      func(this.resolve.bind(this), this.reject.bind(this))
    } catch (error) {
      this.reject(error)
    }
  }

  resolve(result) {
    if (this.PromiseState === myPromise._status.PENDING) {
      setTimeout(() => {
        this.PromiseState = myPromise.status.FULFILLED
        this.PromiseResult = result
        this.onFulfilledCallbacks.forEach(callback => {
          callback(result)
        })
      })
    }
  }

  reject(reason) {
    if (this.PromiseState === myPromise._status.PENDING) {
      setTimeout(() => {
        this.PromiseState = myPromise.status.REJECTED
        this.PromiseResult = reason
        this.onRejectedCallbacks.forEach(callback => {
          callback(reason)
        })
      })
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : result => result
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : reason => {
            throw reason
          }
    const newPromise = new myPromise((resolve, reject) => {
      if (this.PromiseState === myPromise._status.PENDING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.PromiseResult)
              resolvePromise(newPromise, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.PromiseResult)
              resolvePromise(newPromise, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
      } else if (this.PromiseState === myPromise.status.FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.PromiseResult)
            resolvePromise(newPromise, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      } else if (this.PromiseState === myPromise.status.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.PromiseResult)
            resolvePromise(newPromise, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
    })

    return newPromise
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  finally(callback) {
    return this.then(callback, callback)
  }

  static resolve(value) {
    if (value instanceof myPromise) {
      return value
    } else if (typeof value === 'object' && 'then' in value) {
      return new myPromise((resolve, reject) => {
        value.then(resolve, reject)
      })
    }

    return new myPromise((resolve, _) => {
      resolve(value)
    })
  }

  static reject(reason) {
    return new myPromise((_, reject) => {
      reject(reason)
    })
  }

  static all(promises) {
    return new myPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let result = []
        let count = 0

        if (promises.length === 0) return resolve(promises)

        promises.forEach((item, index) => {
          myPromise.resolve(item).then(
            value => {
              result[index] = value
              ++count === promises.length && resolve(result)
            },
            reason => {
              reject(reason)
            }
          )
        })
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  static allSettled(promises) {
    return new myPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let result = []
        let count = 0

        if (promises.length === 0) return resolve(promises)

        promises.forEach((item, index) => {
          myPromise.resolve(item).then(
            value => {
              result[index] = {
                status: 'fulfilled',
                value,
              }
              ++count === promises.length && resolve(result)
            },
            reason => {
              result[index] = {
                status: 'rejected',
                reason,
              }
              ++count === promises.length && resolve(result)
            }
          )
        })
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  static any(promises) {
    return new myPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let errors = []
        let count = 0

        if (promises.length === 0)
          return reject(new AggregateError('All promises were rejected'))

        promises.forEach((item, index) => {
          myPromise.resolve(item).then(
            value => {
              resolve(value)
            },
            reason => {
              errors[index] = reason
              ++count === promises.length && reject(new AggregateError(errors))
            }
          )
        })
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  static race(promises) {
    return new myPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        if (promises.length > 0) {
          promises.forEach(item => {
            myPromise.resolve(item).then(resolve, reject)
          })
        }
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }
}

/**
 * 对resolve()、reject() 进行改造增强 针对resolve()和reject()中不同值情况 进行处理
 * @param  {promise} newPromise promise.then方法返回的新的promise对象
 * @param  {[type]} x         promise中onFulfilled或onRejected的返回值
 * @param  {[type]} resolve   newPromise的resolve方法
 * @param  {[type]} reject    newPromise的reject方法
 */
function resolvePromise(newPromise, x, resolve, reject) {
  if (x === newPromise) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }
  // 2.3.2 如果 x 为 Promise ，则使 newPromise 接受 x 的状态
  if (x instanceof myPromise) {
    if (x.PromiseState === myPromise._status.PENDING) {
      /**
       * 2.3.2.1 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
       *         注意"直至 x 被执行或拒绝"这句话，
       *         这句话的意思是：x 被执行x，如果执行的时候拿到一个y，还要继续解析y
       */
      x.then(y => {
        resolvePromise(newPromise, y, resolve, reject)
      }, reject)
    } else if (x.PromiseState === myPromise.FULFILLED) {
      // 2.3.2.2 如果 x 处于执行态，用相同的值执行 promise
      resolve(x.PromiseResult)
    } else if (x.PromiseState === myPromise.REJECTED) {
      // 2.3.2.3 如果 x 处于拒绝态，用相同的据因拒绝 promise
      reject(x.PromiseResult)
    }
  } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 2.3.3 如果 x 为对象或函数
    try {
      // 2.3.3.1 把 x.then 赋值给 then
      var then = x.then
    } catch (error) {
      // 2.3.3.2 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      return reject(error)
    }

    /**
     * 2.3.3.3
     * 如果 then 是函数，将 x 作为函数的作用域 this 调用之。
     * 传递两个回调函数作为参数，
     * 第一个参数叫做 `resolvePromise` ，第二个参数叫做 `rejectPromise`
     */
    if (typeof then === 'function') {
      // 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
      let called = false // 避免多次调用
      try {
        then.call(
          x,
          // 2.3.3.3.1 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          y => {
            if (called) return
            called = true
            resolvePromise(newPromise, y, resolve, reject)
          },
          // 2.3.3.3.2 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          r => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } catch (e) {
        /**
         * 2.3.3.3.4 如果调用 then 方法抛出了异常 e
         * 2.3.3.3.4.1 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
         */
        if (called) return
        called = true

        /**
         * 2.3.3.3.4.2 否则以 e 为据因拒绝 promise
         */
        reject(e)
      }
    } else {
      // 2.3.3.4 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x)
    }
  } else {
    // 2.3.4 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x)
  }
}

// 使用 promises-aplus-tests 测试
myPromise.deferred = function () {
  let result = {}
  result.promise = new myPromise((resolve, reject) => {
    result.resolve = resolve
    result.reject = reject
  })
  return result
}

module.exports = myPromise
