import { collection, onSnapshot } from "firebase/firestore";
import firestore_db from "./firestore";
import { busCollectionPath } from "@/constants/firestore-paths";
import { realtime_db } from "./realtime_db";
import { onValue, ref } from "firebase/database";

export const busCollection = collection(firestore_db, busCollectionPath);

export function listenToCollection(collectionPath: string) {
    const collectionRef = collection(firestore_db, collectionPath);
    console.log("Listening to collection:", collectionPath);

    // Set up the listener
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
        // This callback runs every time there's a change to any document in the collection

        snapshot.docChanges().forEach((change) => {
            const docData = change.doc.data();
            const docId = change.doc.id;

            if (change.type === 'added') {
                console.log(`Document added: ${docId}`, docData);
            } else if (change.type === 'modified') {
                console.log(`Document modified: ${docId}`, docData);
            } else if (change.type === 'removed') {
                console.log(`Document removed: ${docId}`);
            }
        });
    }, (error) => {
        console.error("Error listening to collection:", error);
    });

    // Return the unsubscribe function so you can stop listening when needed
    return unsubscribe;
}


export function listenToRealtimeDB(collectionPath: string) {
    const collectionRef = ref(realtime_db, collectionPath);
    console.log("Listening to collection:", collectionPath);

    // Set up the listener
    const unsubscribe = onValue(collectionRef, (snapshot) => {
        const data = snapshot.val();

    }

    );

    // Return the unsubscribe function so you can stop listening when needed
    return unsubscribe;

}
