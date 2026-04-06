// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "interviewiq-f2f1a.firebaseapp.com",
  projectId: "interviewiq-f2f1a",
  storageBucket: "interviewiq-f2f1a.firebasestorage.app",
  messagingSenderId: "551118106412",
  appId: "1:551118106412:web:7f5e49c37d6723c0d84689"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };