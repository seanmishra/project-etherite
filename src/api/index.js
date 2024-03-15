import { displayName as name } from '../../package.json'
import { Router } from 'express'
import profiles from './profiles'
import auth from './auth'

export default ({ config, db }) => {
  const api = Router()
  const { version } = config

  api.use('/auth', auth({ config }))
  api.use('/profiles', profiles({ config, db }))

  api.get('/', (req, res) => res.json({ name, version }))

  return api
}
