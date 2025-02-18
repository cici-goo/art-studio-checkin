import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "art-studio-checkin.firebaseapp.com",
  projectId: "art-studio-checkin",
  storageBucket: "art-studio-checkin.firebasestorage.app",
  messagingSenderId: "158891845635",
  appId: "1:158891845635:web:94bc2b0711897c9f008636"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 