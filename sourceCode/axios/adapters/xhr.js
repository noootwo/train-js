export function dispatchRequest(config) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(config.method, config.url)
    xhr.onreadystatechange = function () {
      if (xhr.status >= 200 && xhr.status <= 300 && xhr.readyState === 4) {
        resolve(xhr.responseText)
      } else {
        reject('失败了')
      }
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!xhr) {
          return
        }
        xhr.abort()
        reject(cancel)
        // Clean up request
        xhr = null
      })
    }
    xhr.send()
  })
}
