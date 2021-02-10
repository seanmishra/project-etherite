const MongoClient = require('mongodb').MongoClient

export default async (config) => {
  const { dbURI, dbName } = config
  const mongoClientOptions = {
    useUnifiedTopology: true,
    poolSize: 10
  }
  const client = await (new MongoClient(dbURI, mongoClientOptions)).connect()
  return client.db(dbName)
}
