// src/utils/folderCreator.js
import { getDatabase, ref, push, set } from 'firebase/database';
import { db } from '../services/firebaseConfig';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

const createFolder = async (userId, folderName, parentId = null) => {
  try {
    // Generate a unique ID for the folder
    const folderId = Date.now().toString();
    
    // Create folder object
    const folderData = {
      id: folderId,
      name: folderName,
      type: "folder",
      parent: parentId,
      size: "0 KB",
      date: new Date().toLocaleDateString(),
      createdAt: Date.now(),
      userId: userId
    };

    // Store folder data in Firestore subcollection
    const folderRef = doc(db, 'users', userId, 'folders', folderId);
    await setDoc(folderRef, folderData);

    console.log('Folder created successfully:', folderId); // Debug log

    // Optional: Log activity in separate collection
    await addDoc(collection(db, 'activities'), {
      userId,
      type: 'folder',
      name: folderName,
      action: 'created',
      timestamp: new Date(),
      folderId: folderId,
      parentId: parentId || null
    });

    return { success: true, folderId: folderId, folderData: folderData };
  } catch (err) {
    console.error('Error creating folder:', err);
    return { success: false, error: err.message };
  }
};

export default createFolder;