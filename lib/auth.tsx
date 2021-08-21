import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

initializeApp({
  apiKey: "AIzaSyAV1kkVvSKEicEa8rLke9o_BxYBu1rb8kw",
  authDomain: "mystic-addaf.firebaseapp.com",
  projectId: "mystic-addaf",
  storageBucket: "mystic-addaf.appspot.com",
  messagingSenderId: "26787182745",
  appId: "1:26787182745:web:e4fbd9439b9279fe966008",
  measurementId: "G-JHKRSK1PR6",
});

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in!", user);
  } else {
    console.log("User is signed out.");
  }
});

export async function loginViaGithub() {
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);
  console.log("HELLO", result.user);
}

export async function logoutViaGithub() {
  await signOut(auth);
  console.log("Done signing out.");
}
