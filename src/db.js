const MongoClient = require('mongodb').MongoClient

export default async (config) => {
  const { dbURI, dbName, dbPoolSize } = config
  const mongoClientOptions = {
    useUnifiedTopology: true,
    poolSize: dbPoolSize
  }
  const client = await new MongoClient(dbURI, mongoClientOptions).connect()
  return client.db(dbName)
}
