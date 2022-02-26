import { Interceptor } from './interceptor'
import { getDefaultAdapter } from './adapters/index.cjs'

export class Axios {
  constructor(options) {
    this.defaultOptions = options
    this.interceptors = {
      request: new Interceptor(),
      response: new Interceptor(),
    }
  }

  request(config) {
    if (typeof config === 'string') {
      config = arguments[1] || {}
      config.url = arguments[0]
    } else {
      config = config || {}
    }

    if (config.method) {
      config.method = config.method.toLowerCase()
    } else {
      config.method = 'get'
    }

    const { dispatchRequest } = getDefaultAdapter()

    const chain = [dispatchRequest, undefined]
    this.interceptors.request.forEach((item) => {
      chain.unshift(item.fulfilled, item.rejected)
    })

    this.interceptors.response.forEach((item) => {
      chain.push(item.fulfilled, item.rejected)
    })

    let promise = Promise.resolve(config)

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift())
    }

    return promise
  }
}
