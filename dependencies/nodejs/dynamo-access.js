/**
 * @Author: Jack Woods <jackrwoods>
 * @Date:   2018-12-14T13:18:19-08:00
 * @Filename: ddb.js
 * @Last modified by:   Brogan
 * @Last modified time: 2019-05-05T17:57:53-07:00
 * @Copyright: 2018 Oregon State University
 */

require('dotenv').config({ path: '/opt/nodejs/.env' })
const AWS = require('aws-sdk')
AWS.config.update({
  region: 'us-west-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

class DDBQuery {
  constructor (ddb, table) {
    this.ddb = ddb
    this.table = table
  }

  select (params) {
    params.TableName = this.table

    return new Promise((resolve, reject) => {
      this.ddb.query(params, (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
  }

  scan (params) {
    params.TableName = this.table

    return new Promise((resolve, reject) => {
      this.ddb.scan(params, (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
  }

  update (params) {
    params.TableName = this.table

    return new Promise((resolve, reject) => {
      this.ddb.update(params, (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
  }

  put (params) {
    params.TableName = this.table

    return new Promise((resolve, reject) => {
      this.ddb.put(params, (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
  }
}

var state = {
  ddb: null
}

exports.initialize = function () {
  if (!state.ddb) {
    state.ddb = new AWS.DynamoDB.DocumentClient()
  }
}

exports.query = function (table) {
  return new DDBQuery(state.ddb, table)
}
