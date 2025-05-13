// src/utils/loadUserData.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const loadUserData = async (userId) => {
  const foldersSnap = await getDocs(collection(db, "users", userId, "folders"));
  const filesSnap = await getDocs(collection(db, "users", userId, "files"));

  const folders = foldersSnap.docs.map(doc => doc.data());
  const files = filesSnap.docs.map(doc => doc.data());

  return { folders, files };
};

export default loadUserData;
