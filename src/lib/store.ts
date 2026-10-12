import { useState, useEffect } from 'react';
import { subscribeToCollection } from './firebase';

export function useCollection(collectionName: string) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(collectionName, setData);
    return () => unsubscribe();
  }, [collectionName]);

  return data;
}

// Simple context helper if needed, but the hook directly is fine.
