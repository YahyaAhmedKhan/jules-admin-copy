import { Bus } from '@/types/bus';
import { create } from 'zustand';
import { BusesService } from '@/services/busesService'; // Added import

// Instantiate the service
const busesService = new BusesService();

interface BusStore {
    buses: Bus[];
    loading: boolean;
    error: string | null; // Added for error handling
    busVisibility: boolean[] | null; // Or { [busId: string]: boolean } if IDs are stable strings

    fetchBuses: () => Promise<void>;
    getBuses: () => Bus[];
    toggleBusVisibility: (index: number) => void; // Or (busId: string)
    setBusVisibility: (visibility: boolean[]) => void; // Example setter
}

export const useBusStore = create<BusStore>((set, get) => ({
    buses: [],
    loading: false, // Initialize loading to false or true as preferred
    error: null,    // Initialize error state
    busVisibility: null,
    // unsubscribe: null, // Firebase specific, removed

    fetchBuses: async () => {
        set({ loading: true, error: null }); // Reset error on new fetch
        try {
            // Old Firebase logic removed
            
            const fetchedBuses = await busesService.getAllBuses(); // New way using the service

            set({
                buses: fetchedBuses,
                // Initialize busVisibility based on the number of buses fetched
                // Assuming default visibility is true for all buses initially
                busVisibility: fetchedBuses.map(() => true), 
                loading: false,
            });
        } catch (error) {
            console.error('Error fetching buses:', error); // Robust error logging
            set({ error: (error as Error).message, loading: false });
        }
    },

    getBuses: () => {
        // Auto-fetch if buses array is empty and not currently loading.
        if (get().buses.length === 0 && !get().loading) {
            get().fetchBuses();
        }
        return get().buses;
    },

    toggleBusVisibility: (index: number) => { // Assuming index-based visibility
        const currentVisibility = get().busVisibility;
        if (currentVisibility && typeof currentVisibility[index] !== 'undefined') {
            const newVisibility = [...currentVisibility]; // Create a new array
            newVisibility[index] = !newVisibility[index];
            set({ busVisibility: newVisibility });
        } else {
            // This warning is useful for debugging issues with visibility state
            console.warn(`Cannot toggle visibility for bus at index ${index}: visibility not initialized or index out of bounds.`);
        }
    },

    setBusVisibility: (visibility: boolean[]) => { // Example setter
        set({ busVisibility: visibility });
    }
    // Removed cleanup method as Firebase listener is gone
}));

// Ensure this is the correct export name used elsewhere (it is as per previous context)
// export { useBusStore }; // This is equivalent to the above export const useBusStore = ...