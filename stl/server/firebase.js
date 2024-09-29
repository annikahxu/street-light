import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const app1 = initializeApp({
  apiKey: "AIzaSyBQc5hQL37AK1Q94M9-a6nCgq5aBWRYvJo",
  authDomain: "street-light-99395.firebaseapp.com",
  projectId: "street-light-99395",
  storageBucket: "street-light-99395.appspot.com",
  messagingSenderId: "44781099306",
  appId: "1:44781099306:web:a50e18da3cca6f47422653",
});

console.log("Firebase config reloaded");

export const db = getFirestore();
export const colRef = collection(db, "pins");

export const fetchData = async () => {
  let pins = [];
  try {
    const snapshot = await getDocs(colRef);
    snapshot.docs.forEach((doc) => {
      pins.push({ ...doc.data(), id: doc.id });
    });
    console.log("Fetched pins:", pins);
    return pins;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};

export const addPin = async (latitude, longitude, rating) => {
  try {
    const docRef = await addDoc(colRef, {
      latitude,
      longitude,
      rating,
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export default app1;