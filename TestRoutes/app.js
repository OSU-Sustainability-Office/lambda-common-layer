/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-05-05T18:10:16-07:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-05-07T20:10:51-07:00
 */

const rds = require('/opt/nodejs/sql-access.js')
const ddb = require('/opt/nodejs/dynamo-access.js')
// const fs = require('fs')

// exports.rds = async (event, context) => {
//   let r = ''
//   fs.readdirSync('/opt/nodejs').forEach(file => {
//     r += file + '\n'
//   })
//   return {
//     'statusCode': 200,
//     'body': r
//   }
// }

exports.rds = async (event, context) => {
  let response
  try {
    await rds.connect()
    let msg = await rds.query('SELECT * FROM stories WHERE id = 95')
    response = {
      'statusCode': 200,
      'body': JSON.stringify({
        message: msg
      })
    }
  } catch (e) {
    console.error(e)
    return e
  }
  return response
}

exports.ddb = async (event, context) => {
  ddb.initialize()
  let response
  try {
    let features = await ddb.query('sus_map').scan({
      'Select': 'ALL_ATTRIBUTES'
    })
    response = {
      'statusCode': 200,
      'body': JSON.stringify({
        message: features
      })
    }
  } catch (e) {
    console.error(e)
    return e
  }
  return response
}
