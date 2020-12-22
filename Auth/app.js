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
  let response = new Response(event)
  response.updateCookie(returnURICookie)
  return response.redirect('https://login.oregonstate.edu/idp/profile/cas/login?service=https://api.sustainability.oregonstate.edu/v2/auth/session')
}

exports.checkCookie = async (event, context) => {
  let response = new Response(event)
  try {
    let user = new User(event, response)
    await user.resolved
    response.body = JSON.stringify(user.data)
  } catch (error) {
    response.statusCode = 200
    response.body = JSON.stringify({
      onid: '',
      privilege: 0,
      primaryAffiliation: '',
      firstName: '',
      appData: {}
    })
  }
  return response
}

exports.logout = async (event, context) => {
  let response = new Response(event)
  response.updateCookie(cookie.serialize('token', 'invalid', {
    expires: new Date(0)
  }))
  return response.redirect('https://login.oregonstate.edu/idp/profile/cas/logout')
}

exports.session = async (event, context) => {
  const validation = await axios('https://login.oregonstate.edu/idp/profile/cas/serviceValidate?ticket=' + event.queryStringParameters.ticket + '&service=https://api.sustainability.oregonstate.edu/v2/auth/session')
  let response = new Response(event)
  if (validation.status === 200) {
    if (validation.data.includes('Success')) {
      const parser = new DomParser()
      const body = parser.parseFromString(validation.data)
      let JSONRep = {
        onid: body.getElementsByTagName('cas:uid')[0].childNodes[0].textContent,
        firstName: body.getElementsByTagName('cas:firstname')[0].childNodes[0].textContent,
        primaryAffiliation: body.getElementsByTagName('cas:eduPersonPrimaryAffiliation')[0].childNodes[0].textContent
      }
      // eslint-disable-next-line no-new
      let user = new User(JSONRep, response)
      await user.resolved
    }

    return response.redirect(cookie.parse(event.headers.Cookie).redirect)
  }
  return response
}
