import { initializeApp } from "firebase/app";
// import firebase from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({
  // put firebase details
});

// init
console.log("hi");
export const db = getFirestore();

// get collection
export const colRef = collection(db, "test");

getDocs(colRef).then((snapshot) => {
  console.log("blabla");
});

export const fetchData = async () => {
  try {
    const snapshot = await getDocs(colRef);
    let test = [];
    snapshot.docs.forEach((doc) => {
      test.push({ ...doc.data(), id: doc.id });
      console.log("Documents in collection:", test);
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
};

export default app;
