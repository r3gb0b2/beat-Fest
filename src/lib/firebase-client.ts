import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB79O_kVLoEnZecx4sxXhFgApU2MabVujg",
  authDomain: "stingressos-e0a5f.firebaseapp.com",
  projectId: "stingressos-e0a5f",
  storageBucket: "stingressos-e0a5f.firebasestorage.app",
  messagingSenderId: "424186734009",
  appId: "1:424186734009:web:e6e9402cbdf9874e784268",
  measurementId: "G-1YESEMT09Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
