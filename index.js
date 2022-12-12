const { initWxConfig, operateWxCli } = require('./src/weapp-ci')

function once(fn) {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, Array.prototype.slice.call(arguments))
    }
  }
}
/** 编译完成后自动打开开发者工具
 * 
 * @param {projectPath} options 需要打开的项目目录
 * @param {ignoreErrors} options 编译失败时是否触发，默认不触发
 * @param {hasWatch} options 是否仅在develop模式下触发，默认不限制
 * @param {type} options 开发者工具类型，默认 wx 微信开发者工具，可选：alipay、wx
 */
function openMiniTool(options = {
  projectPath: '',
  ignoreErrors: false,
  hasWatch: false,
  type: 'wx'
}) {
  options || (options = {})
  this.projectPath = options.projectPath
  this.ignoreErrors = options.ignoreErrors
  this.hasWatch = options.hasWatch
  this.ciType = options.type
}

openWxTool.prototype.apply = function (compiler) {
  let isWatch = false
  let projectPath = this.projectPath
  let ignoreErrors = this.ignoreErrors
  let hasWatch = this.hasWatch
  const executeOpen = once(function () {
    if (this.ciType === 'wx') {
      initWxConfig().then(res => {
        operateWxCli(projectPath, res)
      })
    } else {
      // TODO alipay
    }
  })
  compiler.plugin('watch-run', function checkWatchingMode(watching, done) {
    isWatch = true;
    done()
  })
  compiler.plugin('done', function doneCallback(state) {
    if (((isWatch && hasWatch) || !hasWatch) && (!state.hasErrors() || ignoreErrors)) {
    executeOpen()
  }
})
}

module.exports = openMiniTool