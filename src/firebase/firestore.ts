import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  getDoc
} from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

export { 
  db, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  getDoc
};
