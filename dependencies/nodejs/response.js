/*
 * Created Date: Monday, May 13th 2019, 7:15:01 pm
 * Author: Brogan
 * Copyright (c) 2019 Oregon State University
 */
require('dotenv').config({ path: '/opt/nodejs/.env' })

class Response {
  constructor () {
    this.headers = {}
    if (process.env.DEV_HOST && process.env.DEV_HOST !== '') {
      this.headers['Access-Control-Allow-Origin'] = process.env.DEV_HOST
      this.headers['Access-Control-Allow-Credentials'] = true
    }
    this.statusCode = 200
    this.body = ''
  }
  updateCookie (cookie) {
    this.headers['Set-Cookie'] = cookie
  }
  redirect (url) {
    return {
      headers: {
        ...this.headers,
        Location: url
      },
      statusCode: 301
    }
  }
  get
  data () {
    return {
      headers: this.headers,
      statusCode: this.statusCode,
      body: this.body
    }
  }
}

module.exports = Response
