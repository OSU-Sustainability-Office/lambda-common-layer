/*
 * @Author: you@you.you
 * @Date:   Wednesday February 26th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Wednesday February 26th 2020
 * @Copyright:  (c) Oregon State University 2020
 */
const AWS = require('aws-sdk')
require('dotenv').config({ path: '/opt/nodejs/.env' })

exports = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})
