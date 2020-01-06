/*
 * @Author: Brogan
 * @Date:   Monday May 13th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Monday May 13th 2019
 * @Copyright:  (c) Oregon State University 2019
 */
const ddb = require('/opt/nodejs/dynamo-access.js')
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: '/opt/nodejs/.env' })

class User {
  constructor (event, response = null) {
    ddb.initialize()

    this.onid = ''
    this.appData = {}
    this.firstName = ''
    this.primaryAffiliation = ''
    this.privilege = 0

    if (event['onid']) {
      // User was declared explicitly
      // Return the existing user in the DDB
      // Or create one

      this.resolved = ddb.query('lambda-users').select({
        'Select': 'ALL_ATTRIBUTES',
        'Limit': 1,
        'ConsistentRead': true,
        'KeyConditionExpression': 'onid = :onid',
        'ExpressionAttributeValues': {
          ':onid': event['onid']
        }
      }).then(value => {
        this.onid = event['onid']
        this.privilege = value.data.Items[0].privilege
        this.appData = value.data.Items[0].data
        this.firstName = value.data.Items[0].firstName
        this.primaryAffiliation = value.data.Items[0].primaryAffiliation
      }).catch(() => {
        this.resolved = ddb.query('lambda-users').put({
          Item: {
            onid: event['onid'],
            firstName: event['firstName'],
            primaryAffiliation: event['primaryAffiliation'],
            appData: {},
            privilege: 0
          }
        }).catch(() => {
          throw new Error('Could not create user')
        })
      })
    } else {
      // Implicit Decleration of user
      // Parse cookie and create data
      // Wrapped into a promise to mimic the other side
      this.resolved = new Promise((resolve, reject) => {
        let user = null
        try {
          user = jwt.verify(cookie.parse(event.headers.Cookie).token, process.env.JWT_KEY)
        } catch (error) {
          reject(new Error('Could not parse request cookie'))
        }
        if (user) {
          this.onid = user.onid
          this.primaryAffiliation = user.primaryAffiliation
          this.firstName = user.firstName
          this.appData = user.appData
          this.privilege = user.privilege
          resolve()
        } else {
          reject(new Error('Could not parse request cookie'))
        }
      })
    }
    if (response) {
      this.response = response
      this.resolved.then(() => {
        this.response.updateCookie(cookie.serialize('token', jwt.sign(this.data, process.env.JWT_KEY), { httpOnly: false, secure: false }))
      })
    }
  }

  async get (appName, key = '') {
    await this.resolved
    if (appName === 'firstName' || appName === 'primaryAffiliation') return this[appName]
    return this.appData[appName][key]
  }

  async set (appName, data) {
    await this.resolved
    if (appName === 'firstName' || appName === 'primaryAffiliation') {
      this[appName] = data
    } else {
      this.appData[appName] = data
    }
    if (this.response) {
      this.response.updateCookie(cookie.serialize('token', jwt.sign(this.data, process.env.JWT_KEY)), { httpOnly: false, secure: false })
    }
    await ddb.query('lambda-users').put({ Item: this.data })
  }

  async delete (appName, data) {
    await this.resolved
    // This stub does nothing 'til I can find an adequate use case
  }

  get
  data () {
    return {
      onid: this.onid,
      test: 'this should show up',
      primaryAffiliation: this.primaryAffiliation,
      firstName: this.firstName,
      data: this.appData
    }
  }
}

module.exports = User
