/*
 * Created Date: Monday, May 13th 2019, 7:15:01 pm
 * Author: Brogan
 * Copyright (c) 2019 Oregon State University
 */

class Response {
  constructor () {
    this.Headers = {}
    this.statusCode = 200
    this.body = ''
  }
  updateCookie (cookie) {
    this.Headers['Set-Cookie'] = cookie
  }
  redirect (url) {
    return {
      Headers: {
        ...this.Headers,
        Location: url
      },
      statusCode: 301
    }
  }
  get
  data () {
    return {
      Headers: this.Headers,
      statusCode: this.statusCode,
      body: this.body
    }
  }
}

exports = Response
