const { MongoClient } = require('mongodb')
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME
const collectionName = process.env.MONGODB_COLLECTION_NAME;

let dbConnection

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(uri)
      .then(client => {
        dbConnection = client.db(dbName).collection(collectionName);
        return cb()
      })
      .catch(err => {
        console.log(err)
        return cb(err)
      })
  },
  getDb: () => dbConnection
}
