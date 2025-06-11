import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsMe8FMCJe603jorbmFctF_Fof-yM5_O8",
  authDomain: "flykrt-e6c71.firebaseapp.com",
  projectId: "flykrt-e6c71",
  storageBucket: "flykrt-e6c71.firebasestorage.app",
  messagingSenderId: "1049576704827",
  appId: "1:1049576704827:web:2656c835e70f8208a0851e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };