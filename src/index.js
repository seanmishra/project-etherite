import config from './config.js'
import http from 'http'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { NOT_FOUND, UNAUTHORIZED, FORBIDDEN } from 'http-status-codes'
import 'regenerator-runtime/runtime'
import initializeDb from './db'
import api from './api'

const app = express()
app.server = http.createServer(app)

// logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// 3rd party middleware
app.use(cors())

app.use(
  express.json({
    limit: config.bodyLimit
  })
)

// connect to db
initializeDb(config)
  .then((db) => {
    // api router
    app.use(config.apiVersion, api({ config, db }))

    app.use((req, res, next) => {
      res.status(NOT_FOUND).json({
        error: 'Route not found.'
      })
    })

    app.use((err, req, res, next) => {
      console.log(err)
      if (err.name === 'UnauthorizedError') {
        res.status(UNAUTHORIZED).json({
          error: 'Token or scope is invalid'
        })
      }
      if (err.statusCode === 403) {
        res.status(FORBIDDEN).json({
          error: 'Request is forbidden due to insufficient scope'
        })
      }
    })

    app.server.listen(process.env.PORT || config.port, () => {
      console.log(`Started on port ${app.server.address().port}`)
    })
  })
  .catch((err) => {
    console.log(err)
    process.exit(1)
  })
