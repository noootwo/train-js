class myPromise{
  static status = {
    PENDING: 'pending',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected'
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
    if (this.PromiseState === myPromise.status.PENDING) {
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
    if (this.PromiseState === myPromise.status.PENDING) {
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
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : result => result
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
    if (this.PromiseState === myPromise.status.PENDING) {
      this.onFulfilledCallbacks.push(onFulfilled)
      this.onRejectedCallbacks.push(onRejected)
    } else if (this.PromiseState === myPromise.status.FULFILLED) {
      setTimeout(() => {
        onFulfilled(this.PromiseResult)
      })
    } else if (this.PromiseState === myPromise.status.REJECTED) {
      setTimeout(() => {
        onRejected(this.PromiseResult)
      })
    }
  }
}
