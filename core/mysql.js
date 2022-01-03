const mysql = require('mysql');//引入mysql
const pool = mysql.createPool(require('../config').dev);
pool.on('connection', (connection) => {

});
pool.on('enqueue', () => {
    console.log('Waiting for available connection slot');
});
module.exports.Pool = pool;
/**
 * 事件驱动回调
 * @param sql
 * @param values
 */
module.exports.getConnection = (cb) => {
    if (typeof cb == 'function') {
        cb(err, connection)
    } else {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(connection);
                }
            });
        });
    }
};
module.exports.query = (sql, values, cb) => {
    if (typeof cb == 'function') {
        pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                cb(err);
            } else {
                connection.query(sql, values((error, rows) => {
                    connection.release();
                    cb(error, rows)
                }));
            }
        });
    } else {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    connection.release();
                    reject(err);
                } else {
                    connection.query(sql, values, (error, rows) => {
                        connection.release();
                        if (error) {
                            reject(error);
                        } else {
                            resolve(rows)
                        }
                    });
                }
            });
        })
    }
};
module.exports.exec = (sql, values, cb) => {
    if (typeof cb == 'function') {
        pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                cb(err)
            } else {
                connection.query(sql, values, (error, rows) => {
                    connection.release();
                    cb(error, rows);
                });
            }
        });
    } else {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    connection.release();
                    reject(err);
                } else {
                    connection.query(sql, values, (error, rows) => {
                        connection.release();
                        if (error) {
                            reject(error);
                        } else {
                            resolve(rows)
                        }
                    });
                }
            });
        });
    }
};
/**
 * 事务
 * @param sql
 * @param values
 * @returns {Promise}
 */
module.exports.query2 = ((connection, sql, values, cb) => {
    if (typeof cb == 'function') {
        connection.query(sql, values, (error, rows) => {
            cb(error, rows)
        })
    } else {
        return new Promise((resolve, reject) => {
            connection.query(sql, values, (error, rows) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(rows)
                }
            })
        })
    }
})
