import { ObjectId } from 'mongodb'
const jwt = require('express-jwt')
const jwtAuthz = require('express-jwt-authz')
const jwksRsa = require('jwks-rsa')

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the OAuth2 JSON Web Key Set
export const validateToken = (config) =>
  config.oauth2.isEnabled
    ? jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the signing keys provided by the JWKS endpoint.
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${config.oauth2.tokenIssuer}/.well-known/jwks.json`
      }),

      // Validate the audience and the issuer.
      audience: config.oauth2.tokenAudience,
      issuer: `${config.oauth2.tokenIssuer}/`,
      algorithms: ['RS256']
    })
    : (req, res, next) => next()

// Authorization middleware. When used, the
// Access Token must contain the required scope
// to be authorized
export const validateScope = (config, scope) =>
  config.oauth2.isEnabled
    ? jwtAuthz(scope, {
      checkAllScopes: true,
      failWithError: true
    })
    : (req, res, next) => next()

// Set the profileId from the sub claim
export const setProfileId = (config) =>
  config.oauth2.isEnabled
    ? (req, res, next) => {
        try {
          req.user.profileId = ObjectId.createFromHexString(
            req.user.sub.split('|').pop()
          )
          next()
        } catch (error) {
          next(error)
        }
      }
    : (req, res, next) => next()
