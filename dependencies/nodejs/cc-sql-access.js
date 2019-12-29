/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-05-05T14:08:50-07:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-05-07T20:29:32-07:00
 */
const mysql = require('mysql')
require('dotenv').config({ path: '/opt/nodejs/.env' })

var state = {
  db: null
}

exports.connect = function () {
  return new Promise((resolve, reject) => {
    console.log(process.env.RDS_HOSTNAME)
    if (state.db) {
      resolve(state.db)
    } else {
      state.db = mysql.createConnection({
        host: process.env.AURORA_HOSTNAME,
        user: process.env.AURORA_USERNAME,
        password: process.env.AURORA_PASSWORD,
        port: process.env.AURORA_PORT,
        database: process.env.AURORA_DATABASE
      })
      state.db.connect(function (err) {
        if (err) {
          console.error('Database connection failed: ' + err.stack)
          return
        }
        resolve()
      })
    }
  })
}

exports.query = function (sql, args) {
  return new Promise((resolve, reject) => {
    state.db.query(sql, args, (err, rows) => {
      if (err) { return reject(err) }
      resolve(rows)
    })
  })
}

exports.get = function () {
  return state.db
}

exports.close = function () {
  return new Promise((resolve, reject) => {
    state.db.end(err => {
      if (err) { return reject(err) }
      resolve()
    })
  })
}
