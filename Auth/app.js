/*
 * @Author: Brogan.Miner@oregonstate.edu
 * @Date: 2019-05-09 21:21:36
 * @Last Modified by: Brogan.Miner@oregonstate.edu
 * @Last Modified time: 2019-05-09 23:29:42
 * @Copyright: 2018 Oregon State University
*/
const ddb = require('/opt/nodejs/dynamo-access.js')
const axios = require('axios')
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const DomParser = require('dom-parser')

exports.login = async (event, context) => {
  let returnURICookie
  if (event.queryStringParameters.returnURI) {
    returnURICookie = cookie.serialize('returnURI', event.queryStringParameters.returnURI)
  } else {
    returnURICookie = cookie.serialize('returnURI', 'https://sustainability.oregonstate.edu')
  }
  if (event.headers.host === '127.0.0.1:3000') {
    const token = jwt.sign({
      onid: 'minerb',
      data: JSON.stringify({
        energyDashboard: {
          access: 5
        }
      })
    }, '0xDEADBEEF')
    return {
      headers: {
        'Set-Cookie': cookie.serialize('TOKEN', token, { httpOnly: true, secure: false })
      },
      statuscode: 301,
      Location: cookie.parse(returnURICookie).returnURI
    }
  } else {
    return {
      headers: {
        'Set-Cookie': returnURICookie
      },
      statuscode: 301,
      Location: 'https://login.oregonstate.edu/cas/login?service=https://api.oregonstate.edu/auth/session'
    }
  }
}

exports.logout = async (event, context) => {
  return JSON.stringify(event)
}

exports.session = async (event, context) => {
  ddb.initialize()
  const validation = await axios('https://login.oregonstate.edu/idp/profile/cas/serviceValidate?ticket=' + event.queryStringParameters.ticket + '&service=https://api.oregonstate.edu/auth/session')
  if (validation.status === 200) {
    const parser = new DomParser()
    const body = parser.parseFromString(validation.data)

    let JSONRep = {
      onid: body.getElementsByTagName('cas:cas')[0].childNodes[0].textContent,
      firstName: body.getElementsByTagName('cas:firstname')[0].childNodes[0].textContent,
      primaryAfiliation: body.getElementsByTagName('cas:eduPersonPrimaryAffiliation')[0].childNodes[0].textContent
    }
    try {
      let user = await ddb.query('users').select({
        'Select': 'ALL_ATTRIBUTES',
        'Limit': 1,
        'ConsistentRead': true,
        'KeyConditionExpression': 'onid = :onid',
        'ExpressionAttributeValues': {
          ':onid': JSONRep.onid
        }
      })
      JSONRep['data'] = user.data.Items[0].dataAck
    } catch (error) {
      try {
        await ddb.query('users').put({ Item: JSONRep })
      } catch (bigError) {
        return {
          statuscode: 500,
          body: 'Oops'
        }
      }
    }
    return {
      headers: {
        'Set-Cookie': cookie.serialize('TOKEN', jwt.sign(JSONRep, '0xDEADBEEF'), { secure: true, httpOnly: true })
      },
      statuscode: 301,
      Location: cookie.parse(event.headers.cookie).returnURI
    }
  }
}
