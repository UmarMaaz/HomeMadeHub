// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpPLa8zclJVENgKWXhaitv2vMhS0cmsLg",
  authDomain: "homemadehub-66ae1.firebaseapp.com",
  projectId: "homemadehub-66ae1",
  storageBucket: "homemadehub-66ae1.firebasestorage.app",
  messagingSenderId: "80228001524",
  appId: "1:80228001524:web:d5a2538ff9626ec432a0a1",
  measurementId: "G-98C05PQ69N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services conditionally to avoid SSR issues
let auth, db, storage;

if (typeof window !== 'undefined') {
  // Client-side initialization
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Only initialize analytics on the client side
  // import { getAnalytics } from "firebase/analytics";  // Moved inside conditional
  // const analytics = getAnalytics(app);  // Moved inside conditional
} else {
  // Server-side initialization with mock objects to avoid errors
  auth = null;
  db = null;
  storage = null;
}

export { app, auth, db, storage };