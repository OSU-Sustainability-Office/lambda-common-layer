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
  updateCookie(cookie) {
    this.headers['Set-Cookie'] = cookie + '; Path=/v2; Domain=.oregonstate.edu; Max-Age=7200; SameSite=None; Secure' // This prevents the path from defaulting to /v2/auth on Firefox, and makes the cookie expire in 2 hours.
    console.log('Cookie: ', cookie)
  }
  redirect(url) {
    return {
      headers: {
        ...this.headers,
        Location: url
      },
      statusCode: 302
    }
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
