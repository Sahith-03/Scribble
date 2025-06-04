// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZwtnA3R6G9Hf_jwWB6CC4-Q5NRzeGk5I",
  authDomain: "scribble-73f23.firebaseapp.com",
  projectId: "scribble-73f23",
  storageBucket: "scribble-73f23.firebasestorage.app",
  messagingSenderId: "619837947194",
  appId: "1:619837947194:web:d6c4ef6d37bb1e77216403",
  measurementId: "G-0WQ5B9D59C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);