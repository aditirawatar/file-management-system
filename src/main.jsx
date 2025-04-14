import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeApp } from "firebase/app";
import { BrowserRouter } from 'react-router-dom' 
const firebaseConfig = {
  apiKey: "AIzaSyCoLA1IN0Al9hKK8b49OpYoNI7FXSGclAM",
  authDomain: "authentication-954ef.firebaseapp.com",
  projectId: "authentication-954ef",
  storageBucket: "authentication-954ef.firebasestorage.app",
  messagingSenderId: "136348902508",
  appId: "1:136348902508:web:da62f35a635943aff6a449"
};

 initializeApp(firebaseConfig);
 
 createRoot(document.getElementById('root')).render(
   <BrowserRouter>
     <StrictMode>
     <App />
   </StrictMode>
   </BrowserRouter>
 )
