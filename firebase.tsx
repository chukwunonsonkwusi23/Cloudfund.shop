// Import the functions you need from the SDKs you need
import { getDatabase } from "firebase/database";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFtdZrBNaXtNLn3U68XfXXS0Z7w14Glkw",
  authDomain: "facebook-e57ee.firebaseapp.com",
  databaseURL: "https://facebook-e57ee-default-rtdb.firebaseio.com",
  projectId: "facebook-e57ee",
  storageBucket: "facebook-e57ee.appspot.com",
  messagingSenderId: "435224843536",
  appId: "1:435224843536:web:213da43d615c8b1b870195",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
