/*
 * Created Date: Monday, May 13th 2019, 7:15:01 pm
 * Author: Brogan
 * Copyright (c) 2019 Oregon State University
 */
require('dotenv').config({ path: '/opt/nodejs/.env' })

class Response {
  constructor (event) {
    if (event && event.headers.origin) {
      this.headers = {
        'Access-Control-Allow-Origin': event.headers.origin,
        'Access-Control-Allow-Credentials': 'true'
      }
    } else {
      this.headers = {
        'Access-Control-Allow-Origin': '*'
        'Access-Control-Allow-Credentials': 'true'
      }
    }
    this.statusCode = 200
    this.body = ''
  }
  updateCookie (cookie) {
    this.headers['Set-Cookie'] = cookie + '; Path=/v2; Domain=.oregonstate.edu; Max-Age=7200; SameSite=None; Secure' // This prevents the path from defaulting to /v2/auth on Firefox, and makes the cookie expire in 2 hours.
  }
  redirect (url) {
    return {
      headers: {
        ...this.headers,
        Location: url
      },
      statusCode: 302
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
