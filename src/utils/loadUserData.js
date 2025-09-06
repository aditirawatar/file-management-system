// src/utils/loadUserData.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

const loadUserData = async (userId) => {
  try {
    const foldersSnap = await getDocs(collection(db, "users", userId, "folders"));
    const filesSnap = await getDocs(collection(db, "users", userId, "files"));

    const folders = foldersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const files = filesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { folders, files };
  } catch (error) {
    console.error("Error loading user data:", error);
    return { folders: [], files: [] };
  }
};

export default loadUserData;