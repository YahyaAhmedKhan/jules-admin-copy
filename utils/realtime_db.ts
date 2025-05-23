import { firebaseApp } from "./firebase"
import { getDatabase } from "firebase/database";

export const realtime_db = getDatabase(firebaseApp);
