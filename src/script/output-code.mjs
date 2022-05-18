#!/usr/bin/env zx
/* eslint-disable no-undef */

// 常量
const publicDir = 'public'
const baseDir = `${publicDir}/output_code`
const repositoryGitLink =
  'https://github.com/Galileo01/portal-code-output-template.git'

const pwd = (await $`pwd`).stdout.trim() // stdout 末尾存在 ’\n‘ 换行符

// 配置文件
const resourceDataFile = `${baseDir}/temp-resource-data.json`

const targetResourceDataFileName = 'resource-data.json'

// 从全局变量命令行 解析 参数
const { pageId, type = 'src_code', env = 'prod' } = global.argv

const codeDir = `${baseDir}/${pageId}`

// 拉取 github 代码模板
// await $`git clone ${repositoryGitLink} ${codeDir}`
// 测试 环境 从开发分支 拉取
await $`git clone -b template-frame ${repositoryGitLink} ${codeDir}`

// 复制 json 配置文件
await $`cp ${resourceDataFile} ${codeDir}/src/${targetResourceDataFileName}`

// 源码模式 直接打压缩包
if (type === 'src_code') {
  // 压缩 文件夹
  cd(codeDir) // NOTE:进入该目录 压缩 才不会保存 目录结构
  await $`zip -r ../${pageId}.zip *`
}
// 打包模式  需要 npm i  & npm build
else {
  cd(codeDir) // 进入该目录
  await $`npm i`
  await $`npm run build`
  cd('dist') // NOTE:进入该目录 压缩 才不会保存 目录结构
  await $`zip -r ../../${pageId}.zip *`
}

// 切回 项目目录 进行后续删除操作
cd(pwd)

// 删除 临时文件

await $`rm -r -f ${codeDir}`
await $`rm  ${resourceDataFile}`
