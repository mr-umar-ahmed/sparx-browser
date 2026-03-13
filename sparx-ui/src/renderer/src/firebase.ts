import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <-- MUST HAVE THIS

const firebaseConfig = {
  apiKey: "AIzaSyDsosImn95KWIFuW23aGbXKEtd75gn6CCQ",
  authDomain: "sparx-cloud-c4ba8.firebaseapp.com",
  projectId: "sparx-cloud-c4ba8",
  storageBucket: "sparx-cloud-c4ba8.firebasestorage.app",
  messagingSenderId: "36689379548",
  appId: "1:36689379548:web:f251d2edf68e2b67697419"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // <-- MUST HAVE THIS