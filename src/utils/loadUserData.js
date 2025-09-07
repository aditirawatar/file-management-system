// src/utils/loadUserData.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

const loadUserData = async (userId) => {
  try {
    console.log('Loading user data for:', userId);
    
    const folders = [];
    const files = [];

    // Load folders from subcollection
    const foldersRef = collection(db, 'users', userId, 'folders');
    const foldersSnapshot = await getDocs(foldersRef);
    
    foldersSnapshot.forEach((doc) => {
      const folderData = doc.data();
      folders.push(folderData);
    });

    // Load files from subcollection
    const filesRef = collection(db, 'users', userId, 'files');
    const filesSnapshot = await getDocs(filesRef);
    
    filesSnapshot.forEach((doc) => {
      const fileData = doc.data();
      // Make sure all fields including URL are loaded
      files.push(fileData);
    });

    console.log('Loaded files with URLs:', files.filter(f => f.url));

    return {
      folders: folders,
      files: files
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    throw error;
  }
};

export default loadUserData;