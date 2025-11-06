import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017';

async function main() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI;
  console.log(`Connecting to: ${uri}`);
  await mongoose.connect(uri, {});

  try {
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    if (!databases || databases.length === 0) {
      console.log('No databases found.');
      return;
    }

    for (const dbInfo of databases) {
      const dbName = dbInfo.name;
      const db = mongoose.connection.client.db(dbName);
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      console.log(`\n>>> DB: ${dbName}`);
      console.log(`Collections: ${collectionNames.length ? collectionNames.join(', ') : '(none)'}`);

      for (const { name } of collections) {
        const count = await db.collection(name).countDocuments();
        const docs = await db.collection(name).find({}).limit(5).toArray();
        console.log(`\n== ${dbName}.${name} (count: ${count}) ==`);
        console.log(JSON.stringify(docs, null, 2));
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(err => {
  console.error('ERROR:', err?.message || err);
  process.exit(1);
});


