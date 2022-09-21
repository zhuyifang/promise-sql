const fs = require('fs')
const path = require('path')
fs.copyFileSync(path.resolve(__dirname,'./src/index.d.ts'),path.resolve(__dirname,'./dist/types/core.d.ts'))
fs.copyFileSync(path.resolve(__dirname,'./src/websql.d.ts'),path.resolve(__dirname,'./dist/types/websql.d.ts'))

let file = fs.readFileSync('./dist/types/index.d.ts').toString()
file = file.replace('./index.d','./core.d')
fs.writeFileSync(path.resolve(__dirname,'./dist/types/index.d.ts'),file)
console.log('build success')