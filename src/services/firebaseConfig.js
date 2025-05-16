// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAd54LilCzHhR0_89zx1jzNPPFbcDQOBH4",
  authDomain: "file-management-system-67d18.firebaseapp.com",
  databaseURL: "https://file-management-system-67d18-default-rtdb.firebaseio.com",
  projectId: "file-management-system-67d18",
  storageBucket: "file-management-system-67d18.firebasestorage.app",
  messagingSenderId: "1066453930881",
  appId: "1:1066453930881:web:6e8353d66418633b210e80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();