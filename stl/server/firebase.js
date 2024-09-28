import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
// import { ref, set } from "firebase/database";

// api keys
const app = initializeApp({
  apiKey: "AIzaSyB7LRwvWgcV5qUTgAGErBLVIG2xhJb_CME",
  authDomain: "streetlight-9901d.firebaseapp.com",
  projectId: "streetlight-9901d",
  storageBucket: "streetlight-9901d.appspot.com",
  messagingSenderId: "956208399158",
  appId: "1:956208399158:web:ed6f33ee7f9142ed5ca997",
});

// init
console.log("reloaded");

export const db = getFirestore();
// get collection
export const colRef = collection(db, "test");

// fetch data from database
export const fetchData = async () => {
  test = [];
  try {
    const snapshot = await getDocs(colRef);
    snapshot.docs.forEach((doc) => {
      test.push({ ...doc.data(), id: doc.id });
    });
    console.log("test", test);
    return test;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [{ rating: 2 }];
  }
};

// post rating data from frontend
export const postData = (number) => {
  addDoc(colRef, {
    rating: number,
  });
};

export default app;
