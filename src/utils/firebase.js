import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // 把 Firebase 给您的配置粘贴在这里
  apiKey: "AIzaSyAxohOjX_5GS9goiwOh1iHepny2wUZtcpk",
  authDomain: "art-studio-checkin.firebaseapp.com",
  projectId: "art-studio-checkin",
  storageBucket: "art-studio-checkin.firebasestorage.app",
  messagingSenderId: "158891845635",
  appId: "1:158891845635:web:94bc2b0711897c9f008636"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 