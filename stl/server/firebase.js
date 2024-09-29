import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
// import { ref, set } from "firebase/database";

// api keys
const app1 = initializeApp({
  apiKey: "AIzaSyBQc5hQL37AK1Q94M9-a6nCgq5aBWRYvJo",
  authDomain: "street-light-99395.firebaseapp.com",
  projectId: "street-light-99395",
  storageBucket: "street-light-99395.appspot.com",
  messagingSenderId: "44781099306",
  appId: "1:44781099306:web:a50e18da3cca6f47422653"
});

// init
console.log("reloaded");

export const db = getFirestore();
// get collection
export const colRef = collection(db, "pins");

// fetch data from database
export const fetchData = async () => {
  pins = [];
  try {
    const snapshot = await getDocs(colRef);
    snapshot.docs.forEach((doc) => {
      pins.push({ ...doc.data(), id: doc.id });
    });
    console.log("test", pins);
    return pins;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};

// post rating data from frontend
export const postData = (number) => {
  addDoc(colRef, {
    rating: number,
  });
};

export default app1;
