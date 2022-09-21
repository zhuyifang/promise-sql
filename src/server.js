setTimeout(function () {
    const mysql = require('mysql')
    const fs = require('fs')
    console.log('node-main')
    let dbConfig = fs.readFileSync(__dirname + '/config.xlh', 'utf-8');
    console.log(dbConfig)


    function query(conn, sqls, params, cb) {
        if (sqls.length === 0) {
            console.log('所有语句执行完毕')
            cb()
            return
        }
        try{
            let sql = sqls.shift(), val = params.shift();
            console.log('query',sql,params)
            conn.query(sql, val, function (error) {
                if (error) {
                    cb(error)
                    console.log('sql 失败', sql, val)
                    console.error(error)
                    conn.rollback();
                    return
                }
                console.log('sql 执行成功', sql, val)
                query(conn,sqls, params, cb)
            });
        }catch (e) {
            console.log(sqls, params, cb)
            console.error(e)
        }
    }

    function dbConn(cb) {
        const $db = mysql.createConnection(JSON.parse(dbConfig));
        $db.connect(function (err) {
            if (err) {
                nw.process.emit('error','数据库连接失败,错误原因:'+err.message)
                console.error('error connecting: ' + err.stack);
                return;
            }
            cb($db)
            console.log('connected as id ' + $db.threadId);
        });
    }

    nw.process.mainModule.exports.db = {
        query(sqls, params, cb) {
            if (Object.prototype.toString.call(params) === "[object Function]") {
                cb = params;
                params = []
            }
            dbConn(function (conn) {
                conn.query(sqls, params, function (err, results, fields) {
                    if(err){
                        console.error(err)
                    }
                    cb(err, results, fields)
                    console.log('sql 执行成功', sqls,params,results )
                    conn.end()
                })
            })
        },
        ts(sqls, params, cb) {
            if (Object.prototype.toString.call(params) === "[object Function]") {
                cb = params;
                params = []
            }
            dbConn(function (conn) {
                conn.beginTransaction(function (err) {
                    console.log('开始事务', sqls, params)
                    if (err) {
                        cb(err)
                        conn.end()
                        console.error(err)
                        return;
                    }
                    query(conn, sqls, params, function (err, results, fields) {
                        if (err) {
                            cb(err)
                            console.log('事务执行失败!');
                            console.error(err)
                            return
                        }
                        conn.commit(function (err) {
                            if (err) {
                                cb(err)
                                conn.rollback(function () {
                                    conn.end()
                                });
                                console.log('事务执行失败!');
                                console.error(err)
                            } else {
                                console.log('事务执行成功!');
                                cb(null, results, fields)
                                conn.end()
                            }
                        });


                    })
                });
            })
        }
    };
}, 0);
