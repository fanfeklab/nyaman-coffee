import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB19wOto4Y-8VRNgkWkFQF8H4MdCD5txxg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "naraevents.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "naraevents",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "naraevents.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "856549715804",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:856549715804:web:4616a819993f9eaf911b99",
  measurementId: "G-P5V9VRKST7"
};

// Initialize Firebase only if config is present and not already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;
