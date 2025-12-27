
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAklmsuYWvws9GiMuKLRRG9NrW8wKgryeA",
  authDomain: "happyhome-bc5e7.firebaseapp.com",
  databaseURL: "https://happyhome-bc5e7-default-rtdb.firebaseio.com",
  projectId: "happyhome-bc5e7",
  storageBucket: "happyhome-bc5e7.firebasestorage.app",
  messagingSenderId: "1057692254640",
  appId: "1:1057692254640:web:529edffc6161fee4025675",
  measurementId: "G-8SQ0EGSFN1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, push, onValue, update, remove, get };
