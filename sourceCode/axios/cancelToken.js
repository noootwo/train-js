export class CancelToken {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.')
    }

    let resolvePromise
    this.promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    this.reason = undefined

    const cancel = (message) => {
      if (this.reason) {
        return
      }
      this.reason = 'cancel' + message
      resolvePromise(this.reason)
    }
    executor(cancel)
  }

  throwIfRequested() {
    if (this.reason) {
      throw this.reason
    }
  }

  static source() {
    let cancel
    const token = new CancelToken(function executor(c) {
      cancel = c
    })

    return { token, cancel }
  }
}
