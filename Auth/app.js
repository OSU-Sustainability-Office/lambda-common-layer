/*
 * @Author: Brogan.Miner@oregonstate.edu
 * @Date: 2019-05-09 21:21:36
 * @Last Modified by: Brogan.Miner@oregonstate.edu
 * @Last Modified time: 2019-05-09 23:29:42
 * @Copyright: 2018 Oregon State University
*/
const User = require('/opt/nodejs/user.js')
const Response = require('/opt/nodejs/response.js')
const axios = require('axios')
const DomParser = require('dom-parser')
const cookie = require('cookie')
// const jwt = require('jsonwebtoken')
// require('dotenv').config({ path: '/opt/nodejs/.env' })

exports.login = async (event, context) => {
  let returnURICookie
  if (event.queryStringParameters && event.queryStringParameters.returnURI !== undefined) {
    returnURICookie = cookie.serialize('redirect', event.queryStringParameters.returnURI)
  } else {
    returnURICookie = cookie.serialize('redirect', 'https://sustainability.oregonstate.edu')
  }
  let response = new Response()
  if (process.env.AWS_SAM_LOCAL === 'true') {
    // eslint-disable-next-line no-new
    let user = new User({ onid: 'minerb' }, response)
    await user.resolved
    return response.redirect(cookie.parse(returnURICookie)['redirect'])
  } else {
    response.updateCookie(returnURICookie)
    return response.redirect('https://login.oregonstate.edu/idp/profile/cas/login?service=https://api.sustainability.oregonstate.edu/v2/auth/session')
  }
}

exports.checkCookie = async (event, context) => {
  let response = new Response()
  try {
    let user = new User(event, response)
    await user.resolved
    response.body = JSON.stringify(user.data)
  } catch (error) {
    response.statusCode = 403
    response.body = error.message
  }
  return response
}

exports.logout = async (event, context) => {
  let response = new Response()
  response.updateCookie(cookie.serialize('token', 'invalid', {
    expires: new Date(0)
  }))
  return response.redirect('https://login.oregonstate.edu/idp/profile/cas/logout')
}

exports.session = async (event, context) => {
  const validation = await axios('https://login.oregonstate.edu/idp/profile/cas/serviceValidate?ticket=' + event.queryStringParameters.ticket + '&service=https://api.sustainability.oregonstate.edu/v2/auth/session')
  let response = new Response()
  if (validation.status === 200) {
    if (validation.data.includes('Success')) {
      const parser = new DomParser()
      const body = parser.parseFromString(validation.data)
      // let JSONRep = {
      //   onid: body.getElementsByTagName('cas:cas')[0].childNodes[0].textContent,
      //   firstName: body.getElementsByTagName('cas:firstname')[0].childNodes[0].textContent,
      //   primaryAfiliation: body.getElementsByTagName('cas:eduPersonPrimaryAffiliation')[0].childNodes[0].textContent
      // }
      // eslint-disable-next-line no-new
      // let user = new User(JSONRep, response)
      // await user.resolved
      response.body = 'test'
      // response.updateCookie(cookie.serialize('token', jwt.sign(user.data, process.env.JWT_KEY), { httpOnly: false, secure: false }))
    }
    response.body = validation.data
    return response
    // return response.redirect(cookie.parse(event.headers.Cookie).redirect)
  }
  return response
}
