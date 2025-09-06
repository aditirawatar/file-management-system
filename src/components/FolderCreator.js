// src/utils/folderCreator.js
import { getDatabase, ref, push, set } from 'firebase/database';
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

    // Create folder object
    const folderData = {
      id: Date.now().toString(),
      name: folderName,
      type: "folder",
      parent: parentId,
      size: "0 KB",
      date: new Date().toLocaleDateString(),
      createdAt: Date.now()
    };

    // Push to Realtime Database
    const folderRef = ref(dbRT, `users/${userId}/folders/${folderData.id}`);
    await set(folderRef, folderData);

    // Log in Firestore
    await addDoc(collection(db, 'folders'), {
      userId,
      type: 'folder',
      name: folderName,
      action: 'created',
      timestamp: new Date(),
      folderId: folderData.id,
      parentId: parentId || null
    });

    return { success: true, folderId: folderData.id };
  } catch (err) {
    console.error('Error creating folder or logging activity:', err);
    return { success: false };
  }
};

export default createFolder;