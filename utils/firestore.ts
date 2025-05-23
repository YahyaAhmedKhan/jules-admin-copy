import { firebaseApp } from "./firebase"
import { getFirestore } from "firebase/firestore";

const firestore_db = getFirestore(firebaseApp);

export default firestore_db;