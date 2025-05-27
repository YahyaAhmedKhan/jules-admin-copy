import { BusTypesService } from "@/app/services/bus-types-service";
import { BusRouteTypeModel } from "@/types/bus-route-type";
import { create } from "zustand";

interface BusTypeStore {
    busRouteTypes: BusRouteTypeModel[] | null;
    loading: boolean;
    error: string | null;
    clearBusRouteTypes: () => void;
    getBusRouteTypes: () => Promise<BusRouteTypeModel[] | null>;
    fetchBusRouteTypes: () => Promise<void>;
}


export const useBusTypeStore = create<BusTypeStore>((set, get) => ({
    busRouteTypes: null,
    error: null,
    loading: false,
    clearBusRouteTypes: () => set({ busRouteTypes: [] }),
    fetchBusRouteTypes: async () => {
        if (get().loading) return;
        set({ loading: true });
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
            set({ loading: false });
        }
    },

    getBusRouteTypes: async () => {
        if (get().busRouteTypes === null && !get().loading) {

            await get().fetchBusRouteTypes(); // Fetch only if routes are empty and not already loading
        }
        return get().busRouteTypes;
    }


}));
