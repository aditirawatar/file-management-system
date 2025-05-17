import { getDatabase, ref, push } from 'firebase/database';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

/**
 * Creates a folder in Realtime Database and logs the creation in Firestore
 * @param {string} userId - Firebase Auth User ID
 * @param {string} folderName - Name of the folder
 * @param {string|null} parentId - ID of the parent folder (null for root)
 */
const createFolder = async (userId, folderName, parentId = null) => {
  try {
    const dbRT = getDatabase();

    // Push to Realtime Database
    const folderRef = ref(dbRT, `users/${userId}/folders`);
    const folderSnapshot = await push(folderRef, {
      name: folderName,
      createdAt: Date.now(),
      parentId: parentId || null
    });

    // Log in Firestore
    await addDoc(collection(db, 'folders'), {
      userId,
      type: 'folder',
      name: folderName,
      action: 'created',
      timestamp: new Date(),
      folderId: folderSnapshot.key,
      parentId: parentId || null
    });

  } catch (err) {
    console.error('Error creating folder or logging activity:', err);
  }
};

export default createFolder;
