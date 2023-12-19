
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore"
import {getStorage} from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9X2iHL9DYyiWIoqS7fM-9c3T4fVmC90o",
  authDomain: "fir-c4b64.firebaseapp.com",
  databaseURL: "https://fir-c4b64-default-rtdb.firebaseio.com",
  projectId: "fir-c4b64",
  storageBucket: "fir-c4b64.appspot.com",
  messagingSenderId: "684192829207",
  appId: "1:684192829207:web:141215d8c1dc449ea6f152"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
