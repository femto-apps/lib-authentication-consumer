const express = require('express')
const fetch = require('node-fetch')

module.exports = function(options) {
  // options should have
  // {
  //   tokenService: { endpoint },
  //   authenticationProvider: { endpoint, consumerId },
  //   authenticationConsumer: { endpoint }
  // }

  const router = express.Router()
  const getLogin = (url) => {
    return `${options.authenticationProvider.endpoint}/api/auth?id=${options.authenticationProvider.consumerId}&redirect=${options.authenticationConsumer.endpoint}/login_callback%3Fto=%3D${encodeURIComponent(url)}`
  }

  const getLogout = (url) => {
    return `${options.authenticationProvider.endpoint}/logout?to=${encodeURIComponent(url)}`
  }

  router.use((req, res, next) => {
    res.locals.auth = { getLogin, getLogout }
    res.locals.location = { url: req.protocol + '://' + req.get('host') + req.originalUrl }
    if (req.session.token) {
      fetch(`${options.tokenService.endpoint}?token=${req.session.token}`)
      .then(resp => resp.json())
      .then(resp => {
        if ('err' in resp) {
          if (resp.err === 'Token not found') {
            req.session.token = undefined
            req.session.user = undefined
            return next()
          }
        }
        req.session.user = resp
        next()
      })
    } else {
      next()
    }
  })

  router.use((req, res, next) => {
    req.user = req.session.user
    next()
  })

  router.get('/login_callback', (req, res) => {
    const { token, to } = req.query
    //console.log(decodeURIComponent(to))
    req.session.token = token
    res.redirect('/')
  })

  return router
}
