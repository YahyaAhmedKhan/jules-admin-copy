import { getDocs, query } from "firebase/firestore";
import { busCollection } from "./firestore-utils";
import { Bus } from "@/types/bus";

export async function runTestMain() {
    const querySnapshot = await getDocs(busCollection);
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
        const jsonData = doc.data() as Bus;
        console.log(jsonData.lastUpdated);

    });
}
