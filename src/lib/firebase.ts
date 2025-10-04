import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBp9__Horbs7sCGGzyl4TakbZphNFo5-UQ",
  authDomain: "expense-management-e9a34.firebaseapp.com",
  projectId: "expense-management-e9a34",
  storageBucket: "expense-management-e9a34.firebasestorage.app",
  messagingSenderId: "777063626013",
  appId: "1:777063626013:web:ed1cf4015b568269b21df4",
  measurementId: "G-XZDKV93KE7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
