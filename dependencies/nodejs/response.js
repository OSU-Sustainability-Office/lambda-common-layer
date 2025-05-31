// Filename: response.js
// Description: Defines a Response class for handling HTTP response in a Node.js environment,
//              particularly for AWS Lambda functions.
import dotenv from 'dotenv'
dotenv.config({ path: '/opt/nodejs/.env' })

class Response {
  constructor(event) {
    if (event && event.headers.origin) {
      this.headers = {
        'Access-Control-Allow-Origin': event.headers.origin,
        'Access-Control-Allow-Credentials': 'true'
      }
    } else if (event && event.headers.referer) {
      this.headers = {
        'Access-Control-Allow-Origin': event.headers.referer,
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
