import { Router } from 'express'
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, FORBIDDEN } from 'http-status-codes'
import got from 'got'

export default ({ config }) => {
  const api = Router()

  if (!config.clerkAuth.isEnabled) {
    api.use((req, res, next) => {
      res.status(FORBIDDEN).json({ error: 'Clerk authentication is not enabled.' })
    })

    return api
  }

  /**
   * Fetch active session token for the signed in user
   */
  api.get('/token', async (req, res) => {
    const { backendApi, secretKey } = config.clerkAuth
    if (!backendApi || !secretKey) {
      return res.status(BAD_REQUEST).json({
        message: 'Please provide Clerk config data as environment variables. Refer to /src/config for more info.'
      })
    }
    // get user email from req params
    const { email } = req.query
    if (!email) {
      return res.status(BAD_REQUEST).json({ error: 'Email is required' })
    }
    // fetch userId from email, then use it to fetch active session and create token using basic_info jwt template
    try {
      const { body: users } = await got(`${backendApi}/users?email=${email}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`
        },
        responseType: 'json'
      })
      if (users.length === 0) {
        return res.status(BAD_REQUEST).json({ error: 'User not found' })
      }
      const userId = users[0].id
      const { body: sessions } = await got(`${backendApi}/sessions?user_id=${userId}&status=active`, {
        headers: {
          Authorization: `Bearer ${secretKey}`
        },
        responseType: 'json'
      })
      if (sessions.length === 0) {
        return res.status(BAD_REQUEST).json({ error: 'No active session found' })
      }
      const sessionId = sessions[0].id
      const { body } = await got.post(`${backendApi}/sessions/${sessionId}/tokens/basic_info`, {
        headers: {
          Authorization: `Bearer ${secretKey}`
        },
        responseType: 'json'
      })
      if (!body.jwt) {
        return res.status(INTERNAL_SERVER_ERROR).json({ error: 'Error creating token' })
      }
      res.json({ token: body.jwt })
    } catch (error) {
      console.error('Error fetching user data', error)
      return res.status(INTERNAL_SERVER_ERROR).json({ error: 'Error fetching user data' })
    }
  })

  /**
   * Start testing
   */
  api.get('/', async (req, res) => {
    const { accountPortal, backendApi, redirectURI, secretKey } = config.clerkAuth
    if (!accountPortal || !backendApi || !redirectURI || !secretKey) {
      return res.status(BAD_REQUEST).json({
        message: 'Please provide Clerk config data as environment variables. Refer to /src/config for more info.'
      })
    }
    // check if jwt template "basic_info" exists, if not create it using clerk backend api
    try {
      const { body: jwtTemplates } = await got(`${backendApi}/jwt_templates`, {
        headers: {
          Authorization: `Bearer ${config.clerkAuth.secretKey}`
        },
        responseType: 'json'
      })

      const basicInfoTemplate = jwtTemplates.find(template => template.name === 'basic_info')

      if (!basicInfoTemplate) {
        await got.post(`${backendApi}/jwt_templates`, {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'basic_info',
            claims: [
              {
                name: 'email',
                type: 'string'
              },
              {
                name: 'first_name',
                type: 'string'
              },
              {
                name: 'last_name',
                type: 'string'
              }
            ]
          })
        })
      }
      return res.send(`
          <ul>
              <li>
                  <h3>Make sure you are signed in by visiting the <a href="${accountPortal}/sign-in">sign-in page</a></h3>
              </li>
              <li>
                  <h3>Fetch active session token for the signed in user by visiting <a href="http://localhost:${config.port}/v1/clerkAuth/token?email=USER_EMAIL">this link</a></h3>
              </li>
              <li>
                  <h3>Use the token to test the protected endpoint [<code>http://localhost:${config.port}/v1/clerk-protected</code>] using a POST request with the token in the Authorization header.</h3>
              </li>
          </ul>`
      )
    } catch (error) {
      console.error('Error initiating test protocol', error)
      return res.status(INTERNAL_SERVER_ERROR).json({ error: 'Error initiating test protocol' })
    }
  })

  return api
}
