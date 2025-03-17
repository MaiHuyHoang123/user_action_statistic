import cassandra from "cassandra-driver"
import dotenv from "dotenv"
dotenv.config();

const db = new cassandra.Client({
  contactPoints: [process.env.DB_HOST],
  localDataCenter: process.env.DATACENTER,
  keyspace: process.env.KEYSPACE,
  authProvider: new cassandra.auth.PlainTextAuthProvider(process.env.ACCOUNT, process.env.PASSWORD)
});
db.connect()
  .then(() => console.log('🔗 Connected to Cassandra'))
  .catch(err => console.error('❌ Cassandra connection error:', err));

export default db;