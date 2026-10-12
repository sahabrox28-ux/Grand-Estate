import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export function subscribeToCollection(collName: string, callback: (data: any[]) => void) {
  const q = query(collection(db, collName), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  }, (err) => {
    console.error(`Error fetching ${collName}:`, err);
  });
}
