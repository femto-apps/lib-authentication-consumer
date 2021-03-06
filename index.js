const express = require('express')
const fetch = require('node-fetch')

module.exports = function (options) {
    // options should have
    // {
    //   tokenService: { endpoint },
    //   authenticationProvider: { endpoint, consumerId },
    //   authenticationConsumer: { endpoint }
    //   redirect: <boolean>
    // }

    const router = express.Router()
    const getLogin = (url) => {
        return `${options.authenticationProvider.endpoint}/api/auth?id=${options.authenticationProvider.consumerId}&redirect=${options.authenticationConsumer.endpoint}/login_callback%3Fto%3D${encodeURIComponent(url)}`
    }

    const getLogout = (url) => {
        return `${options.authenticationProvider.endpoint}/logout?to=${options.authenticationConsumer.endpoint}/logout%3Fto%3D${encodeURIComponent(url)}`
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
        if (req.session && req.session.user) {
            req.users = req.session.user.users
        }

        if (req.users) {
            req.user = req.users[0]
        }

        next()
    })

    router.get('/login_callback', (req, res) => {
        const { token, to } = req.query
        //console.log("Login callback")
        req.session.token = token
        if (options.redirect && to) {
            //console.log(`Redirecting to ${decodeURIComponent(to)}`)
            res.redirect(decodeURIComponent(to))
        }
        else {
            //console.log('Redirecting to the home page')
            res.redirect('/')
        }
    })

    router.get('/logout', (req, res) => {
        req.session.token = undefined
        req.session.user = undefined
        if (options.redirect && to) {
            //console.log(`Redirecting to ${decodeURIComponent(to)}`)
            res.redirect(decodeURIComponent(to))
        }
        else {
            //console.log('Redirecting to the home page')
            res.redirect('/')
        }
    })

    return router
}
