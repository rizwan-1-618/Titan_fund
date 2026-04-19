import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';

/**
 * useFirestoreDoc — subscribe to a single Firestore document in realtime.
 * Demonstrates: useEffect with cleanup (Firestore onSnapshot listener).
 *
 * @param {string} collectionName
 * @param {string} docId
 * @returns {{ data: Object|null, loading: boolean, error: string|null }}
 */
export function useFirestoreDoc(collectionName, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || !docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, collectionName, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error listening to ${collectionName}/${docId}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe on unmount or dependency change
    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
}

/**
 * useFirestoreCollection — subscribe to a Firestore collection query in realtime.
 * Demonstrates: useEffect with cleanup.
 *
 * @param {string} collectionName
 * @param {Array} constraints - array of Firestore query constraints
 * @returns {{ data: Array, loading: boolean, error: string|null }}
 */
export function useFirestoreCollection(collectionName, constraints = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error(`Error listening to ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { data, loading, error };
}
