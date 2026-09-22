import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBLLXXyJSOeBDnrN6DiLY_1pvqt1ywrSes",
  authDomain: "hotel-fad04.firebaseapp.com",
  projectId: "hotel-fad04",
  storageBucket: "hotel-fad04.firebasestorage.app",
  messagingSenderId: "703712384128",
  appId: "1:703712384128:web:5cd0cc6d1670d555fb4265",
  measurementId: "G-YSX2C2HZTW"
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
