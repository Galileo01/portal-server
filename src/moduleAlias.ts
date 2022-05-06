import moduleAlias from 'module-alias'

// 运行时 引入 路径别名
// 若注册在 package.json 文件中 ，tsc 编译之后 无法 把别名配置带到 js runtime
moduleAlias.addAliases({
  '@': `${__dirname}`,
})
