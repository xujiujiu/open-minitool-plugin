const { spawnSync } = require('child_process')
const path = require('path')
const shell = require('shelljs')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const os = require('os')

export function operateWxCli(projectPath, cliPath) {
  const openCliCwd = cliPath + ' open --project ' + projectPath
  shell.exec(cliPath + ' -h', { silent: true }, function (err, stdout, stderr) {
    console.log('微信开发者工具安装路径：', cliPath)
    const childClose = spawnSync(cliPath, ['close', '--project', projectPath], { stdio: 'inherits' })
    const timer = setTimeout(() => {
      shell.exec(openCliCwd, { silent: true })
      clearTimeout(timer)
    }, childClose.status === 0 ? 3000 : 0)
  })
}

export async function initWxConfig() {
  const pathStr = path.resolve(process.env.PWD, '.dea/config.json')
  const tailPath = os.platform() === 'win32' ? '\\Contents\\cli.bat' : '/Contents/MacOS/cli'
  fs.ensureFileSync(pathStr)
  let indexContent = fs.readFileSync(pathStr, 'utf8')
  const fileData = indexContent ? JSON.parse(indexContent) : {}
  if (fileData.wxToolPath) return fileData.wxToolPath + tailPath
  let defaultPath = os.platform() === 'win32' ? 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具' : '/Applications/wechatwebdevtools.app';
  const promptList = [{
    name: 'toolPath',
    type: 'text',
    message: '设置微信开发者工具cli安装路径',
    default: defaultPath
  }]
  const res = await inquirer.prompt(promptList)
  fileData.wxToolPath = res.toolPath + tailPath
  fs.writeFileSync(pathStr, JSON.stringify(fileData, null, "\t"))
  return fileData.wxToolPath
}
