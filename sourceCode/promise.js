class Promise {
  static status = {
    PENDING: 'PENDING',
    FULFILLED: 'FULFILLED',
    REJECTED: 'REJECTED',
  }
  constructor(fn) {
    this.PromiseState = Promise.status.PENDING
    this.PromiseResult = null
    this.callbacks = []

    const resolve = (data) => {
      if (this.PromiseState === Promise.status.PENDING) {
        this.PromiseState = Promise.status.FULFILLED
        this.PromiseResult = data
        this.callbacks.forEach((item) => {
          item.onResolved()
        })
      }
    }

    const reject = (reason) => {
      if (this.PromiseState === Promise.status.PENDING) {
        this.PromiseState = Promise.status.REJECTED
        this.PromiseResult = reason
        this.callbacks.forEach((item) => {
          item.onRejected()
        })
      }
    }

    try {
      fn(resolve.bind(this), reject.bind(this))
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (data) => data
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason
          }

    const newPromise = new Promise((resolve, reject) => {
      const resolvePromise = (type) => {
        queueMicrotask(() => {
          try {
            const result = type(this.PromiseResult)
            if (result === newPromise)
              return reject('Chaining cycle detected for promise')
            if (result instanceof Promise) {
              result.then(
                (v) => {
                  resolve(v)
                },
                (n) => {
                  reject(n)
                }
              )
            } else {
              resolve(result)
            }
          } catch (e) {
            reject(e)
          }
        })
      }

      if (this.PromiseState === Promise.status.FULFILLED) {
        resolvePromise(onFulfilled)
      }
      if (this.PromiseState === Promise.status.REJECTED) {
        resolvePromise(onRejected)
      }
      if (this.PromiseState === Promise.status.PENDING) {
        this.callbacks.push({
          onResolved: () => {
            resolvePromise(onFulfilled)
          },
          onRejected: () => {
            resolvePromise(onRejected)
          },
        })
      }
    })

    return newPromise
  }

  catch(onReject) {
    return this.then(null, onReject)
  }

  finally(callback) {
    return this.then(callback, callback)
  }

  static resolve(value) {
    if (value instanceof Promise) {
      return value
    } else {
      return new Promise((resolve, _) => {
        resolve(value)
      })
    }
  }

  static reject(reason) {
    return new Promise((_, reject) => {
      reject(reason)
    })
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      const result = []
      let count = 0
      promises.forEach((promise, index) => {
        Promise.resolve(promise).then(
          (value) => {
            result[index] = value
            ++count === promises.length && resolve(result)
          },
          (reason) => {
            reject(reason)
          }
        )
      })
    })
  }

  static any(promises) {
    return new Promise((resolve, reject) => {
      const result = []
      let count = 0
      promises.forEach((promise, index) => {
        Promise.resolve(promise).then(
          (value) => {
            resolve(value)
          },
          (reason) => {
            result[index] = reason
            ++count === promises.length && reject(result)
          }
        )
      })
    })
  }

  static allSettled(promises) {
    return new Promise((resolve, _) => {
      const result = []
      let count = 0
      promises.forEach((promise, index) => {
        Promise.resolve(promise).then(
          (value) => {
            result[index] = {
              status: Promise.status.FULFILLED,
              value,
            }
            ++count === promises.length && resolve(result)
          },
          (reason) => {
            result[index] = {
              status: Promise.status.REJECTED,
              reason,
            }
            ++count === promises.length && resolve(result)
          }
        )
      })
    })
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      promises.forEach((promise) => {
        Promise.resolve(promise).then(resolve, reject)
      })
    })
  }
}
