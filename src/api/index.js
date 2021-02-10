import { displayName as name, version } from '../../package.json'
import { Router } from 'express'
import profiles from './profiles'
import auth from './auth'

export default ({ config, db }) => {
  const api = Router()

  api.use('/auth', auth({ config, db }))
  api.use('/profiles', profiles({ config, db }))

  api.get('/', (req, res) => res.json({ name, version }))

  return api
}
