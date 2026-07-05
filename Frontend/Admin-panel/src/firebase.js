import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCc5tvnO4lqhLZaEh0tuJh0DLkwkP4LXF0",
  authDomain: "med-vault-b69a6.firebaseapp.com",
  projectId: "med-vault-b69a6",
  storageBucket: "med-vault-b69a6.firebasestorage.app",
  messagingSenderId: "696322298012",
  appId: "1:696322298012:web:dc6a88cfa75e712eb3dd59",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };