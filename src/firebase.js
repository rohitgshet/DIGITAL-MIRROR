import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBoya3ubIoUHsS_-SfnuoRuacxd97ffcp8",
  authDomain: "digital-mirror-db5e9.firebaseapp.com",
  projectId: "digital-mirror-db5e9",
  storageBucket: "digital-mirror-db5e9.firebasestorage.app",
  messagingSenderId: "113753738857",
  appId: "1:113753738857:web:7f133aaf5f1038f54e1cf8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);