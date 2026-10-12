import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    for (const coll of ['contacts', 'news', 'members']) {
      const snap = await getDocs(collection(db, coll));
      console.log(`=== Collection: ${coll} ===`);
      snap.forEach(doc => {
        console.log(doc.id, "=>", doc.data());
      });
    }
  } catch (err: any) {
    console.error("Error reading: ", err.message);
  } finally {
    process.exit(0);
  }
}

run();
