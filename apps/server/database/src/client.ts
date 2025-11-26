import { MongoClient, Db, Collection, Document, ObjectId } from 'mongodb'

const DEFAULT_DB_NAME = process.env.MONGODB_DB ?? 'promptia_db'
const DEFAULT_URI =
  process.env.MONGODB_URI ??
  `mongodb://admin:admin123@127.0.0.1:27017/${DEFAULT_DB_NAME}?authSource=admin`

type GlobalMongo = {
  mongoClient?: MongoClient
  mongoClientPromise?: Promise<MongoClient>
}

const globalForMongo = globalThis as unknown as GlobalMongo

export const getMongoUri = () => DEFAULT_URI
export const getMongoDbName = () => DEFAULT_DB_NAME

export async function getMongoClient(): Promise<MongoClient> {
  if (globalForMongo.mongoClient) {
    return globalForMongo.mongoClient
  }

  if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(DEFAULT_URI)
    globalForMongo.mongoClientPromise = client.connect().then((connectedClient) => {
      globalForMongo.mongoClient = connectedClient
      return connectedClient
    })
  }

  return globalForMongo.mongoClientPromise
}

export async function getDatabase(dbName = DEFAULT_DB_NAME): Promise<Db> {
  const client = await getMongoClient()
  return client.db(dbName)
}

export async function getCollection<TSchema extends Document = Document>(
  collectionName: string,
  dbName = DEFAULT_DB_NAME
): Promise<Collection<TSchema>> {
  const db = await getDatabase(dbName)
  return db.collection<TSchema>(collectionName)
}

export async function disconnectMongo(): Promise<void> {
  if (globalForMongo.mongoClient) {
    await globalForMongo.mongoClient.close()
    globalForMongo.mongoClient = undefined
    globalForMongo.mongoClientPromise = undefined
  }
}

export { ObjectId }
