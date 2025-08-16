import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { app } from "./firebase";
import { db } from './firestore';
import { doc, setDoc, getDoc } from "firebase/firestore";

const auth = getAuth(app);

const createUserWithEmailAndPassword = async (email: string, password: string, organization: string) => {
  const userCredential = await firebaseCreateUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    role: "member",
    organization: organization,
    name: email.split('@')[0],
    avatar: email.substring(0, 2).toUpperCase(),
    skills: [],
    status: 'offline',
    projects: []
  });
  return userCredential;
};

const getUserRole = async (userId: string) => {
  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return userDoc.data().role;
  } else {
    return null;
  }
};

export { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  getUserRole
};
