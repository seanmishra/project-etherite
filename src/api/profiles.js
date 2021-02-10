import { Router } from 'express'
import { OK, CREATED, INTERNAL_SERVER_ERROR } from 'http-status-codes'
import { validateToken, validateScope } from '../middleware/authenticate'
import { ObjectId } from 'mongodb'

export default ({ config, db }) => {
  const api = Router()

  /**
   * Fetch all user profiles
   */
  api.get('/',
    validateToken(config),
    validateScope(['read:profiles']),
    async (req, res) => {
      try {
        const profilesColl = db.collection('profiles')
        const profiles = await (await profilesColl.find({})).toArray()
        res.status(OK).json(profiles)
      } catch (error) {
        res.sendStatus(INTERNAL_SERVER_ERROR)
      }
    }
  )

  /**
   * Create a new user profile
   */
  api.post('/',
    validateToken(config),
    validateScope(['write:profiles']),
    async (req, res) => {
      try {
        const profilesColl = db.collection('profiles')
        const profileId = ObjectId.createFromHexString(req.body.id)
        const today = new Date()
        await profilesColl.insertOne({
          _id: profileId,
          email: req.body.email,
          createdOn: today,
          updatedOn: today
        })
        res.sendStatus(CREATED)
      } catch (error) {
        res.sendStatus(INTERNAL_SERVER_ERROR)
      }
    }
  )

  return api
}
