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

