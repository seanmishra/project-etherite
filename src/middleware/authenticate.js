import { ObjectId } from 'mongodb'
const jwt = require('express-jwt')
const jwtAuthz = require('express-jwt-authz')
const jwksRsa = require('jwks-rsa')

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
export const validateToken = (config) => jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${config.auth0.tokenIssuer}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: config.auth0.tokenAudience,
  issuer: `${config.auth0.tokenIssuer}/`,
  algorithms: ['RS256']
})

export const validateScope = (scope) => jwtAuthz(scope, {
  checkAllScopes: true,
  failWithError: true
})

export const setProfileId = (req, res, next) => {
  try {
    req.user.profileId = ObjectId.createFromHexString(req.user.sub.split('|').pop())
    next()
  } catch (error) {
    next(error)
  }
}
