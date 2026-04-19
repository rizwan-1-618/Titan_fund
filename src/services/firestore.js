import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── User Operations ────────────────────────────────────────────

/**
 * Fetch a single user document by UID
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export async function getUserDoc(uid) {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Create a new user document in Firestore on signup
 * @param {string} uid
 * @param {Object} data - { email, name, role }
 */
export async function createUserDoc(uid, data) {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, {
      email: data.email,
      name: data.name,
      role: data.role || 'investor',
      totalApprovedCapital: 0,
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
}

/**
 * Subscribe to ALL user documents (admin — for global AUM calculation)
 * @param {Function} callback - receives array of user objects
 * @returns {Function} unsubscribe function
 */
export function subscribeToAllUsers(callback) {
  const q = collection(db, 'users');

  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(users);
    },
    (error) => {
      console.error('Error subscribing to all users:', error);
      callback([]);
    }
  );
}

// ─── Transaction Operations ─────────────────────────────────────

/**
 * Subscribe to a specific user's transactions (realtime)
 * @param {string} userId
 * @param {Function} callback - receives array of transactions
 * @returns {Function} unsubscribe function
 */
export function subscribeToUserTransactions(userId, callback) {
  // Note: Using only where() without orderBy() to avoid requiring a
  // Firestore composite index. Results are sorted client-side instead.
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        // Sort client-side by date descending (newest first)
        .sort((a, b) => {
          const dateA = a.date?.toMillis?.() || 0;
          const dateB = b.date?.toMillis?.() || 0;
          return dateB - dateA;
        });
      callback(transactions);
    },
    (error) => {
      console.error('Error subscribing to user transactions:', error);
      callback([]);
    }
  );
}

/**
 * Subscribe to ALL transactions across all users (admin realtime)
 * @param {Function} callback - receives array of transactions
 * @returns {Function} unsubscribe function
 */
export function subscribeToAllTransactions(callback) {
  const q = query(
    collection(db, 'transactions'),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(transactions);
    },
    (error) => {
      console.error('Error subscribing to all transactions:', error);
      callback([]);
    }
  );
}

/**
 * Create a new transaction request (deposit or withdrawal)
 * @param {Object} data - { userId, userName, amount, type, note }
 * @returns {Promise<string>} the new document ID
 */
export async function createTransaction(data) {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      userId: data.userId,
      userName: data.userName,
      amount: Number(data.amount),
      type: data.type || 'Deposit',
      note: data.note || '',
      status: 'PENDING',
      date: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Approve a pending transaction (batch: update status + adjust user capital)
 * For deposits: increments totalApprovedCapital
 * For withdrawals: decrements totalApprovedCapital (negative increment)
 * @param {string} transactionId
 * @param {string} userId
 * @param {number} amount
 * @param {string} type - 'Deposit' or 'Withdrawal'
 */
export async function approveTransaction(transactionId, userId, amount, type = 'Deposit') {
  try {
    const batch = writeBatch(db);

    // Update transaction status
    const txRef = doc(db, 'transactions', transactionId);
    batch.update(txRef, { status: 'APPROVED' });

    // Adjust user's total approved capital
    const userRef = doc(db, 'users', userId);
    const capitalChange = type === 'Withdrawal' ? -Math.abs(amount) : Math.abs(amount);
    batch.update(userRef, {
      totalApprovedCapital: increment(capitalChange),
    });

    await batch.commit();
  } catch (error) {
    console.error('Error approving transaction:', error);
    throw error;
  }
}

/**
 * Reject/decline a pending transaction (preserves audit trail)
 * @param {string} transactionId
 */
export async function rejectTransaction(transactionId) {
  try {
    const txRef = doc(db, 'transactions', transactionId);
    await updateDoc(txRef, { status: 'REJECTED' });
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    throw error;
  }
}
