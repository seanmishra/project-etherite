require('dotenv').config()

const fetchEnv = (variable, defaultValue, varType = 'string') => {
  if (variable in process.env) {
    if (varType === 'number') return parseInt(process.env[variable], 10)
    if (varType === 'boolean') return process.env[variable] === 'true'
    return process.env[variable]
  }
  if (defaultValue) return defaultValue
  if (variable.startsWith('OAUTH2_')) {
    if (process.env.OAUTH2_ENABLED === 'true') {
      throw new Error(`OAuth 2.0 is enabled but the required variable ${variable} was not found in the environment`)
    } else {
      return null
    }
  }
  throw new Error(`The required variable ${variable} was not found in the environment`)
}

export default {
  port: fetchEnv('PORT', 7575, 'number'),
  apiVersion: fetchEnv('API_VERSION', 'v1'),
  bodyLimit: fetchEnv('BODY_LIMIT', '100kb'),
  dbURI: fetchEnv('DB_URI'),
  dbName: fetchEnv('DB_NAME'),
  dbPoolSize: fetchEnv('DB_POOL_SIZE', 10, 'number'),
  oauth2: {
    isEnabled: fetchEnv('OAUTH2_ENABLED', false, 'boolean'),
    tokenIssuer: fetchEnv('OAUTH2_TOKEN_ISSUER'),
    tokenAudience: fetchEnv('OAUTH2_TOKEN_AUDIENCE'),
    clientId: fetchEnv('OAUTH2_CLIENT_ID'),
    clientSecret: fetchEnv('OAUTH2_CLIENT_SECRET'),
    redirectURI: fetchEnv('OAUTH2_REDIRECT_URI')
  }
}
