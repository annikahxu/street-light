import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const app1 = initializeApp({
  // CHANGEME
  // apiKey: API_KEY,
  // authDomain: AUTH_DOMAIN,
  // projectId: PROJECT_ID,
  // storageBucket: STORAGE_BUCKET,
  // messagingSenderId: MESSAGING_SENDER_ID,
  // appId: APP_ID,
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