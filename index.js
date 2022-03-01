const { spawnSync } = require('child_process')
const path = require('path')
const shelljs = require('shelljs')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const os = require('os')

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
 */
function openWxTool(options = {
  projectPath: '',
  ignoreErrors: false,
  hasWatch: false
}) {
  options || (options = {})
  this.projectPath = options.projectPath
  this.ignoreErrors = options.ignoreErrors
  this.hasWatch = options.hasWatch
}

openWxTool.prototype.apply = function (compiler) {
  let isWatch = false
  let projectPath = this.projectPath
  let ignoreErrors = this.ignoreErrors
  let hasWatch = this.hasWatch
  const executeOpen = once(function () {
    initConfig().then(res => {
      operateCli(projectPath, res)
    })
  })
  compiler.plugin('watch-run', function checkWatchingMode(watching, done) {
    isWatch = true;
    done()
  })
  compiler.plugin('done', function doneCallback(state) {
    if (((isWatch && hasWatch) || !hasWatch) && (!state.hasErrors() || ignoreErrors))) {
    executeOpen()
  }
})
}

function operateCli(projectPath, cliPath) {
  const openCliCwd = cliPath + ' open --project ' + projectPath
  shell.exec(cliPath ' -h', { silent: true }, function (err, stdout, stderr) {
    console.log('微信开发者工具安装路径：', cliPath)
    const childClose = spawnSync(cliPath, ['close', '--project', projectPath], { stdio: 'inherits' })
    const timer = setTimeout(() => {
      shell.exec(openCliCwd, { silent: true })
      clearTimeout(timer)
    }, childClose.status === 0 ? 3000 : 0)
  })
}

async function initConfig() {
  const pathStr = path.resolve(process.env.PWD, '.dea/config.json')
  fs.ensureFileSync(pathStr)
  let indexContent = fs.readFileSync(pathStr, 'utf8')
  const fileData = indexContent ? JSON.parse(indexContent) : {}
  if (fileData.wxToolPath) return fileData.wxToolPath
  const plat = os.type()
  let defaultPath = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
  switch (plat) {
    case 'Linux': break
    case 'Darwin': break // macOS
    case 'Windows_NT': // Windows
      defaultPath = 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\Contents\\cli.bat'
      break
  }
  const promptList = [{
    name 'toolPath',
    type: 'text',
    message: '设置微信开发者工具cli安装路径',
    default: defaultPath
  }]
  const res = await inquirer.prompt(promptList)
  fileData.wxToolPath = res.toolPath
  fs.writeFileSync(pathStr, JSON.stringify(fileData, "", "\t"))
  return res.toolPath
}

module.exports = openWxTool