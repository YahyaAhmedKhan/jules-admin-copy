import { BusTypesService } from "@/app/services/bus-types-service";
import { BusRouteTypeModel } from "@/types/bus-route-type";
import { create } from "zustand";

interface BusTypeStore {
    busRouteTypes: BusRouteTypeModel[] | null;
    isLoading: boolean;
    clearBusRouteTypes: () => void;
    getBusRouteTypes: () => Promise<BusRouteTypeModel[] | null>;
    fetchBusRouteTypes: () => Promise<void>;
}


export const useBusTypeStore = create<BusTypeStore>((set, get) => ({
    busRouteTypes: null,
    isLoading: false,
    clearBusRouteTypes: () => set({ busRouteTypes: [] }),
    fetchBusRouteTypes: async () => {
        if (get().isLoading) return;
        set({ isLoading: true });
        try {
            const busTypesService = new BusTypesService();
            const data = await busTypesService.getAllBusTypes();
            const newBusRouteTypes: BusRouteTypeModel[] = data.busTypes.map((busType: BusRouteTypeModel) => ({
                id: busType.id,
                description: busType.description
            }));
            set({ busRouteTypes: newBusRouteTypes });
        } catch (error) {
            console.error('Error fetching bus route types:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    getBusRouteTypes: async () => {
        if (get().busRouteTypes === null && !get().isLoading) {

            await get().fetchBusRouteTypes(); // Fetch only if routes are empty and not already loading
        }
        return get().busRouteTypes;
    }


}));
