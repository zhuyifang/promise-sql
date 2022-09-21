import {DbConfig, Param, Sql} from './index.d'
import {SQLTransaction, WindowDatabase} from "./websql";


export default class PromiseSql {
    private dbConfig: DbConfig;
    private $db: any;

    constructor(dbConfig: DbConfig) {
        this.dbConfig = dbConfig
    }

    async init() {
        switch (this.dbConfig.type) {
            case 'websql':
                return await this.connWebsql()
            case "mysql":
                return await this.connMysql()
        }
    }

    async connWebsql() {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined') {
                return reject('Please use it in a browser environment')
            }
            console.log(typeof window)
            window.openDatabase(this.dbConfig.websql.name, this.dbConfig.websql.version, this.dbConfig.websql.displayName, this.dbConfig.websql.estimatedSize, (db: WindowDatabase) => {
                this.$db = db
                resolve(this)
            })
        })
    }

    async connMysql() {
        return new Promise((resolve, reject) => {
            if (typeof window !== 'undefined') {
                throw new Error('Please use it in Nodejs environment')
            }
            const mysql = require('mysql')
            let conn = mysql.createConnection({
                "host": this.dbConfig.mysql.host,
                "port": this.dbConfig.mysql.port,
                "user": this.dbConfig.mysql.user,
                "password": this.dbConfig.mysql.password,
                "database": this.dbConfig.mysql.database,
            })
            conn.connect((err: Error) => {
                if (err) {
                    return reject(err)
                }
                this.$db = conn
                return resolve(this)
            });
        })
    }

    async query(sql: Sql, param: Param[] = []) {
        return this.dbConfig.type === 'websql' ? this.queryWebsql(sql, param) : this.queryMysql(sql, param)
    }

    queryWebsql(sql: Sql, param: Param[] = []) {
        return new Promise((resolve, reject) => {
            try {
                this.$db.transaction(function (tx: SQLTransaction) {
                    return tx.executeSql(sql, param, (_tx, results) => {
                        return resolve(results);
                    });
                });
            } catch (e) {
                reject(e)
            }
        })
    }

    queryMysql(sql: Sql, param: Param[] = []) {
        return new Promise((resolve, reject) => {
            try {
                this.$db.query(sql, param, (err: Error, results: Array<any>, fields: Array<any>) => {
                    if (err) {
                        this.$db.end()
                        throw new Error(err.message)
                    }
                    resolve({
                        results: this.sqlArray2Array(results),
                        fields
                    })
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    transaction(sqls: [string, string], params: [any[], any[]]) {
        return new Promise((resolve, reject) => {
            this.$db.beginTransaction(async (err: Error) => {
                if (err) {
                    this.$db.end()
                    return reject(err)
                }
                for (const sql of sqls) {
                    const index = sqls.indexOf(sql);
                    await this.query(sql, params[index])
                }

                await this.$db.commit((err: Error, results: object) => {
                    if (err) {
                        this.$db.rollback();
                        this.$db.end()
                        reject(err)
                    } else {
                        resolve(results)
                        this.$db.end()
                    }
                })
            })
        })
    }

    transactionWebsql() {

    }

    transactionMysql() {

    }

    sqlArray2Array(results: object) {
        return JSON.parse(JSON.stringify(results))
    }
}