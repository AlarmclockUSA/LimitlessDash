// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeX2bSm-4DcPyUtY3oKnvkWHTVjZUxMEc",
  authDomain: "limitless-caa32.firebaseapp.com",
  projectId: "limitless-caa32",
  storageBucket: "limitless-caa32.appspot.com",
  messagingSenderId: "735419408528",
  appId: "1:735419408528:web:ee07b6a04d8f8489453815",
  measurementId: "G-FRJC26LEYQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics may not work in SSR, so we need to check if window is defined
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);

// Enable offline persistence if in browser
if (typeof window !== 'undefined') {
  // Use a flag to track if we've already tried to enable persistence
  let persistenceEnabled = false;
  
  const enablePersistence = async () => {
    if (persistenceEnabled) return;
    
    try {
      await enableIndexedDbPersistence(db);
      persistenceEnabled = true;
      console.log('Firestore persistence enabled');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not available in this browser');
      } else {
        console.error('Firestore persistence error:', err);
      }
    }
  };
  
  // Try to enable persistence
  enablePersistence();
  
  // Connect to emulator if in development
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firestore emulator');
    } catch (err) {
      console.error('Failed to connect to Firestore emulator:', err);
    }
  }
}

export { app, analytics, db }; 