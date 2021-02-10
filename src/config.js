require('dotenv').config()

const fetchEnv = (variable, defaultValue) => {
  if (variable in process.env) return process.env[variable]
  if (defaultValue) return defaultValue
  throw new Error(`${variable} not found in the environment`)
}

export default {
  port: fetchEnv('PORT', 11002),
  bodyLimit: '100kb',
  dbURI: fetchEnv('DB_URI'),
  dbName: fetchEnv('DB_NAME'),
  auth0: {
    tokenIssuer: fetchEnv('TOKEN_ISSUER'),
    tokenAudience: fetchEnv('TOKEN_AUDIENCE'),
    clientId: fetchEnv('CLIENT_ID'),
    clientSecret: fetchEnv('CLIENT_SECRET'),
    redirectURI: fetchEnv('REDIRECT_URI')
  }
}
