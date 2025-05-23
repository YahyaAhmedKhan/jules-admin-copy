import { busCollectionPath } from '@/constants/firestore-paths';
import { Bus } from '@/types/bus';
import { create } from 'zustand';
import { onValue, ref } from 'firebase/database';
import { realtime_db } from '@/utils/realtime_db';

interface BusStore {
    buses: Bus[];
    loading: boolean;
    busVisibility: boolean[] | null;
    unsubscribe: (() => void) | null;

    fetchBuses: () => Promise<void>;
    getBuses: () => Bus[];
    toggleBusVisibility: (index: number) => void;
    cleanup: () => void;
}

export const useBusStore = create<BusStore>((set, get) => ({
    buses: [],
    loading: true,
    busVisibility: null,
    unsubscribe: null,

    fetchBuses: async () => {
        set({ loading: true });
        try {
            // Clean up any existing listener
            if (get().unsubscribe) {
                get().unsubscribe!();
            }

            // Reference to the bus collection
            const collectionRef = ref(realtime_db, busCollectionPath);

            // Set up the real-time listener
            const unsubscribe = onValue(collectionRef, (snapshot) => {
                const busData: Bus[] = [];

                snapshot.forEach((doc) => {
                    // const data = doc.data() as { location: GeoPoint };
                    const data = doc.val() as { id: string, latitude: number, longitude: number };
                    console.log("Data from realtime:", doc.val());


                    busData.push({
                        id: data.id,
                        location: { coordinates: [data.latitude, data.longitude] },
                    });
                });

                // Update the store with all buses
                set({
                    buses: busData,
                    loading: false,
                });
                if (!get().busVisibility) {
                    set({ busVisibility: Array(busData.length).fill(true) });
                }

                // console.log("buses: ", get().buses);

                // console.log("Updated buses from Firestore:", busData.length);
            }, (error) => {
                console.error("Error listening to bus collection:", error);
                set({ loading: false });
            });

            // Store the unsubscribe function
            set({ unsubscribe });

        } catch (error) {
            console.error("Error setting up bus listener:", error);
            set({ loading: false });
        }
    },

    getBuses: () => {
        if (get().buses.length === 0 && !get().loading) {
            get().fetchBuses(); // Fetch only if buses are empty and not already loading
        }
        return get().buses;
    },

    toggleBusVisibility: (index: number) => {
        const newVisibility = [...get().busVisibility];
        newVisibility[index] = !newVisibility[index];
        set({ busVisibility: newVisibility });
    },

    cleanup: () => {
        // Clean up the listener when no longer needed
        if (get().unsubscribe) {
            get().unsubscribe!();
            set({ unsubscribe: null });
        }
    }
}));