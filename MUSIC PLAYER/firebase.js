import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyBLHSL_4Iph01JLamcWfnvF-UJv90EalOM",
    authDomain: "sorona-c5d24.firebaseapp.com",
    projectId: "sorona-c5d24",
    storageBucket: "sorona-c5d24.firebasestorage.app",
    messagingSenderId: "263632606691",
    appId: "1:263632606691:web:12a6d18542257ba2657cd6"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
};
