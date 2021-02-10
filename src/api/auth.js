import { Router } from 'express'
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status-codes'
import got from 'got'

export default ({ config, db }) => {
  const api = Router()

  /**
   * Fetch an access token by authorization code or refresh token
   */
  api.get('/token', async (req, res) => {
    try {
      const { code, redirect_uri: redirectURI, refresh_token: refreshToken } = req.query
      const { tokenIssuer, clientId, clientSecret } = config.auth0
      const tokenURL = `${tokenIssuer}/oauth/token`
      if (code) {
        const options = {
          method: 'post',
          responseType: 'json',
          json: {
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectURI || config.auth0.redirectURI
          }
        }
        const result = await got(tokenURL, options)
        return res.status(result.statusCode).json(result.body)
      } else if (refreshToken) {
        const options = {
          method: 'post',
          responseType: 'json',
          json: {
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken
          }
        }
        const result = await got(tokenURL, options)
        return res.status(result.statusCode).json(result.body)
      } else {
        return res.status(BAD_REQUEST).json({ error: 'A required parameter is missing.' })
      }
    } catch (error) {
      console.log(error)
      console.log(res.body)
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: 'Something went wrong. Please try again.'
      })
    }
  })

  /**
   * Handle redirect from authorization
   */
  api.get('/redirect', async (req, res) => res.send())

  /**
   * Display authorization URL for testing
   */
  api.get('/', async (req, res) => {
    const { tokenIssuer, tokenAudience, clientId, redirectURI } = config.auth0
    const scope = 'read:profiles+write:profiles'
    const state = ''
    return clientId ? res.json({
      authURL: `${tokenIssuer}/authorize?` +
      `audience=${tokenAudience}&` +
      `scope=${scope}&` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectURI}&` +
      `state=${state}`
    }) : res.json({
      message: `Please provide Auth0 config data as environment variables. Refer to /src/config for more info.`
    })
  })

  return api
}
