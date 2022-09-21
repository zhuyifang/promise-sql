# promise-websql
### This is a very small database manipulation library.

Feature list:
1. Supported databases: Mysql, Websql
2. Database transaction support
3. Support parameterized query
4. Wrap all callback functions into Promise
5. Simplify database addition and modification operations (planned)
6. Message formatting for various errors in the database (planned)

#### Mysql example
```javascript
const PromiseSql = require('../dist/index.commonjs.js').default;

(async function() {
    const promiseSql = new PromiseSql({
        type: 'mysql',
        mysql: {
            "host": "",
            "port": "",
            "user": "",
            "password": "",
            "database": "",
        }
    })

    await promiseSql.init()
    promiseSql.query('select * from pro_model where id > ?',[100]).then((results)=>{
        console.log(results)
    })

    promiseSql.transaction(['select * from pro_model','select * from pro_type'],[[],[]]).then((results)=>{
        console.log(results)
    })
})()
```
#### Websql example
```javascript
//use type="module"
import PromiseSql from '../dist/index.esnext.js'

    (async function () {
        const promiseSql = new PromiseSql({
            type: 'websql',
            websql: {
                name: 'test-database',
                version: '1.0',
                displayName: '',
                estimatedSize: 1024 * 1024
            }
        })

        await promiseSql.init()
        promiseSql.query('select * from pro_model where id > ?', [100]).then((results) => {
            console.log(results)
        })

        promiseSql.transaction(['select * from pro_model', 'select * from pro_type'], [[], []]).then((results) => {
            console.log(results)
        })
    })()
```