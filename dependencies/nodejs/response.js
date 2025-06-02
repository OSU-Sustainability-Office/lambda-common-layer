// Filename: response.js
// Description: Defines a Response class for handling HTTP response in a Node.js environment,
//              particularly for AWS Lambda functions.
import dotenv from 'dotenv'
dotenv.config({ path: '/opt/nodejs/.env' })

class Response {
  constructor(event) {
    // normalize headers
    const normalizedHeaders = event.headers || {}
    const originHeader = normalizedHeaders.origin || normalizedHeaders.Origin
    const refererHeader = normalizedHeaders.referer || normalizedHeaders.Referer

    if (originHeader) {
      this.headers = {
        'Access-Control-Allow-Origin': originHeader,
        'Access-Control-Allow-Credentials': 'true'
      }
    } else if (refererHeader) {
      this.headers = {
        'Access-Control-Allow-Origin': refererHeader,
        'Access-Control-Allow-Credentials': 'true'
      }
    } else {
      this.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      }
    }

    this.statusCode = 200
    this.body = ''
  }
  get data() {
    return {
      headers: this.headers,
      statusCode: this.statusCode,
      body: this.body
    }
  }
}

export default Response
