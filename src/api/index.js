import { displayName as name } from '../../package.json'
import { Router } from 'express'
import profiles from './profiles'
import oAuth from './oAuth'
import clerkAuth from './clerkAuth'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'

export default ({ config, db }) => {
  const api = Router()
  const { version } = config

  api.use('/oauth', oAuth({ config }))
  api.use('/clerkauth', clerkAuth({ config }))
  api.use('/profiles', profiles({ config, db }))

  api.get('/', (req, res) => res.json({ name, version }))
  api.get('/clerk-protected', ClerkExpressRequireAuth(), (req, res) => res.json({ name, version, auth: req.auth }))

  return api
}
