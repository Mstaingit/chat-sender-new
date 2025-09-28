import { initializeApp } from "firebase/app"; 
import { getFirestore } from "firebase/firestore"; 
import { getDatabase } from "firebase/database"; 
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAi5DRebI89ueTnut7kB8kAb01BFDJiQu0",
  authDomain: "brrtube-e4fb7.firebaseapp.com",
  databaseURL: "https://brrtube-e4fb7-default-rtdb.firebaseio.com",
  projectId: "brrtube-e4fb7",
  storageBucket: "brrtube-e4fb7.appspot.com",
  messagingSenderId: "750701946039",
  appId: "1:750701946039:web:2fa264fefff8ae21921932",
};

const app = initializeApp(firebaseConfig); 
const db = getFirestore(app); 
const database = getDatabase(app); 
const storage = getStorage(app); 

export { db, database, storage };
