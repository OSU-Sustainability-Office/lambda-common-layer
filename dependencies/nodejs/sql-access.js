// Filename: sql-access.js
// Description: Provides a module for connecting to a MySQL database and executing queries.
import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config({ path: '/opt/nodejs/.env' })

var state = {
  db: null
}

// Forget a connection that can no longer be used, so the next connect() opens a fresh one.
// Without this, a warm Lambda keeps reusing a dead connection and every query fails with
// PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR until the instance is recycled (2026-11-04 outage).
function discard(conn) {
  if (state.db === conn) {
    state.db = null
  }
  conn.destroy()
}

export function connect(database) {
  return new Promise((resolve, reject) => {
    if (state.db) {
      resolve(state.db)
    } else {
      const conn = mysql.createConnection({
        host: process.env.RDS_HOSTNAME,
        user: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        port: process.env.RDS_PORT,
        database: database == null ? process.env.RDS_DATABASE : database,
        // Keep the old `mysql` package's result types so callers see no difference:
        // JSON columns as strings (callers JSON.parse them, e.g. buildings.geojson in the
        // energy dashboard) and DECIMAL columns as numbers rather than strings.
        jsonStrings: true,
        decimalNumbers: true
      })
      // Fatal errors outside a query (e.g. the server closing an idle connection)
      conn.on('error', err => {
        console.error('Database connection error: ' + err.stack)
        if (err.fatal) {
          discard(conn)
        }
      })
      state.db = conn
      conn.connect(function (err) {
        if (err) {
          console.error('Database connection failed: ' + err.stack)
          discard(conn)
          return reject(err)
        }
        resolve(conn)
      })
    }
  })
}

export function query(sql, args) {
  return new Promise((resolve, reject) => {
    const conn = state.db
    // The 'error' listener above may have discarded the connection since connect() ran
    if (!conn) {
      return reject(new Error('Not connected to the database: call connect() first'))
    }
    conn.query(sql, args, (err, rows) => {
      if (err) {
        if (err.fatal) {
          discard(conn)
        }
        return reject(err)
      }
      resolve(rows)
    })
  })
}
