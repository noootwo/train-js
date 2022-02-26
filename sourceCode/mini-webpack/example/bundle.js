;(function (modules) {
  function require(id) {
    const [fn, mapping] = modules[id]

    function localRequire(filePath) {
      const id = mapping[filePath]
      return require(id)
    }

    const module = {
      exports: {},
    }

    fn(localRequire, module, module.exports)

    return module.exports
  }

  require(1)
})({
  1: [
    function (require, module, exports) {
      const { foo } = require('./foo.js')

      foo()
      console.log('index')
    },
    {
      './foo.js': 2,
    },
  ],
  2: [
    function (require, module, exports) {
      const bar = require('./bar.js')

      function foo() {
        console.log('foo')
      }

      module.exports = {
        foo,
      }
    },
    {
      './bar.js': 3,
    },
  ],
  3: [function () {}, {}],
})
