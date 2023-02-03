# open-minitool-plugin
自动化打开小程序开发者工具

```js
const OpenMinitoolPlugin = require('open-minitool-plugin')

// 在webpack 中的 plugins 中使用
{
  plugins:[
    ...,
    //  projectPath 需要打开的项目目录
    //  ignoreErrors 编译失败时是否触发，默认不触发
    //  hasWatch 是否仅在develop模式下触发，默认不限制
    new OpenMinitoolPlugin({
      projectPath: './dist/wx' // 打包完成的微信项目目录
    })
  ]
}
//也可以按需使用,如在添加指令 --opentool 时触发
if (process.env.npm_config_opentool === 'true') {
  webpack.plugins.push(
    new OpenMinitoolPlugin({
      projectPath: './dist/wx' // 打包完成的微信项目目录
    })
  )
}
```
