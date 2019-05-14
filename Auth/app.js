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

exports.login = async (event, context) => {
  let returnURICookie
  if (event.queryStringParameters && event.queryStringParameters.returnURI !== undefined) {
    returnURICookie = cookie.serialize('redirect', event.queryStringParameters.returnURI)
  } else {
    returnURICookie = cookie.serialize('redirect', 'https://sustainability.oregonstate.edu')
  }
  let response = new Response()
  if (process.env.AWS_SAM_LOCAL === 'true') {
    User({ onid: 'minerb' }, response)
    return response.redirect(cookie.parse(returnURICookie)['redirect'])
  } else {
    response.updateCookie(returnURICookie)
    return response.redirect('https://login.oregonstate.edu/cas/login?service=https://api.oregonstate.edu/auth/session')
  }
}

exports.checkCookie = async (event, context) => {
  let json = JSON.stringify(User(event))
  return {
    body: json
  }
}

exports.logout = async (event, context) => {
  let response = new Response()
  response.updateCookie(cookie.serialize('token', 'invalid', {
    expires: new Date(0)
  }))
  return response.redirect('https://login.oregonstate.edu/idp/profile/cas/logout')
}

exports.session = async (event, context) => {
  const validation = await axios('https://login.oregonstate.edu/idp/profile/cas/serviceValidate?ticket=' + event.queryStringParameters.ticket + '&service=https://api.oregonstate.edu/auth/session')
  let response = new Response()
  if (validation.status === 200) {
    const parser = new DomParser()
    const body = parser.parseFromString(validation.data)

    let JSONRep = {
      onid: body.getElementsByTagName('cas:cas')[0].childNodes[0].textContent,
      firstName: body.getElementsByTagName('cas:firstname')[0].childNodes[0].textContent,
      primaryAfiliation: body.getElementsByTagName('cas:eduPersonPrimaryAffiliation')[0].childNodes[0].textContent
    }
    User(JSONRep, response)
    return response.redirect(cookie.parse(event.headers.Cookie).redirect)
  }
}
