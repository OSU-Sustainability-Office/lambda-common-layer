// Filename: sql-access.js
// Description: Provides a module for connecting to a MySQL database and executing queries.
import mysql from 'mysql'
import dotenv from 'dotenv'
dotenv.config({ path: '/opt/nodejs/.env' })

var state = {
  db: null
}

export function connect(database) {
  return new Promise((resolve, reject) => {
    if (state.db) {
      resolve(state.db)
    } else {
      state.db = mysql.createConnection({
        host: process.env.RDS_HOSTNAME,
        user: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        port: process.env.RDS_PORT,
        database: database == null ? process.env.RDS_DATABASE : database
      })
      state.db.connect(function (err) {
        if (err) {
          console.error('Database connection failed: ' + err.stack)
          return reject(err)
        }
        resolve(state.db)
      })
    }
  })
}

export function query(sql, args) {
  return new Promise((resolve, reject) => {
    state.db.query(sql, args, (err, rows) => {
      if (err) {
        return reject(err)
      }
      resolve(rows)
    })
  })
}
