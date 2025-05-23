import { BusRouteEdgeModel } from '@/data-models/bus-route-edge-model';
import { create } from 'zustand';
import { Location } from '@/types/location';
import { BusStop } from '@/types/bus-stop';
import { BusRoutesService } from '@/services/busRoutesService'; // Added import

// Instantiate the service
const busRoutesService = new BusRoutesService();

// Define route colors - vibrant colors that are visually distinct
const ROUTE_COLORS = [
    '#FF5733', // Coral red
    '#33A8FF', // Sky blue
    '#4CAF50', // Green
    '#9C27B0', // Purple
    '#FFC107', // Amber
    '#E91E63', // Pink
    '#3F51B5', // Indigo
    '#00BCD4', // Cyan
    '#FF9800', // Orange
    '#8BC34A', // Light green
    '#673AB7', // Deep purple
    '#2196F3', // Blue
];



interface BusRoutesStore {
    busRoutes: BusRouteEdgeModel[];
    busRoutesByID: { [key: number]: BusRouteEdgeModel[] };
    clearBusRoutesByIds: () => void;
    busStopsByID: { [key: number]: BusStop[] };
    clearBusStopsByIds: () => void;
    busRoutesVisibility: { [routeId: number]: boolean };
    setBusRoutesVisibility: (routeId: number, visibility: boolean) => void;
    loading: boolean;
    error: string | null;
    routeColors: string[];
    fetchRoutes: () => Promise<void>;
    getBusRoutes: () => any[]; // Auto-fetch if empty
    getRouteColor: (index: number) => string; // Get color for a specific route
    toggleRouteVisibility: (routeId: number) => void; // Changed index to routeId
    busRouteGroupVisibility: { [busTypeId: number]: boolean };
    toggleGroupVisibility: (busTypeId: number) => void;


}

const useBusRouteStore = create<BusRoutesStore>((set, get) => ({
    busRoutes: [],
    busRoutesVisibility: {},
    busRouteGroupVisibility: {}, // Added busRouteGroupVisibility to initial state
    loading: true,
    error: null,
    busRoutesByID: {},
    clearBusRoutesByIds: () => {
        set({ busRoutesByID: {} });
    },
    busStopsByID: {},
    clearBusStopsByIds: () => {
        set({ busStopsByID: {} });
    },
    routeColors: ROUTE_COLORS,
    setBusRoutesVisibility: (routeId: number, visibility: boolean) => {
        set(state => ({ 
            busRoutesVisibility: { 
                ...state.busRoutesVisibility, 
                [routeId]: visibility 
            } 
        }));
    },

    toggleGroupVisibility: (busTypeId: number) => { 
        const { busRoutes, busRouteGroupVisibility, busRoutesVisibility } = get();
        
        const newGroupVisibilityState = { ...busRouteGroupVisibility };
        newGroupVisibilityState[busTypeId] = !newGroupVisibilityState[busTypeId];
        const currentGroupIsVisible = newGroupVisibilityState[busTypeId];

        const newRoutesVisibilityState = { ...busRoutesVisibility };
        busRoutes.forEach(route => {
            if (route.bus_type_id === busTypeId) {
                newRoutesVisibilityState[route.route_id] = currentGroupIsVisible;
            }
        });

        set({ 
            busRouteGroupVisibility: newGroupVisibilityState, 
            busRoutesVisibility: newRoutesVisibilityState 
        });
    },

    fetchRoutes: async () => {
        set({ loading: true, error: null });
        try {
            const fetchedRoutes = await busRoutesService.getAllBusRoutes(); 
            
            set({
                busRoutes: fetchedRoutes, 
                busRoutesVisibility: Object.fromEntries(fetchedRoutes.map((route: BusRouteEdgeModel) => [route.route_id, true])),
                loading: false
            });

            const groupedById: { [key: number]: BusRouteEdgeModel[] } = {};
            fetchedRoutes.forEach((route: BusRouteEdgeModel) => {
                const id = route.route_id; // Adjust if route ID is stored under a different key
                if (!groupedById[id]) {
                    groupedById[id] = [];
                }
                groupedById[id].push(route);
            });

            set({
                busRoutesByID: groupedById,
            });

            // Initialize busRouteGroupVisibility
            const groupVisibilityInit: { [busTypeId: number]: boolean } = {};
            fetchedRoutes.forEach((route: BusRouteEdgeModel) => {
                if (typeof route.bus_type_id !== 'undefined') {
                    groupVisibilityInit[route.bus_type_id] = true; 
                }
            });
            set({ busRouteGroupVisibility: groupVisibilityInit });


            const tempStopsById: { [key: number]: Set<string> } = {};
            fetchedRoutes.forEach((route: BusRouteEdgeModel) => {
                const id = route.route_id;

                if (!tempStopsById[id]) {
                    tempStopsById[id] = new Set<string>();
                }

                // Ensure Location objects are stringified correctly
                tempStopsById[id].add(JSON.stringify({ latitude: route.source_lat, longitude: route.source_lon } as Location));
                tempStopsById[id].add(JSON.stringify({ latitude: route.target_lat, longitude: route.target_lon } as Location));
            });

            const stopsByIdProcessed: { [key: number]: BusStop[] } = {};
            Object.entries(tempStopsById).forEach(([idString, locSet]) => {
                const currentRouteId = Number(idString);
                stopsByIdProcessed[currentRouteId] = Array.from(locSet).map((locStr, index) => {
                    const loc: Location = JSON.parse(locStr);
                    // Ensure BusStop creation aligns with its definition
                    const busStop: BusStop = {
                        id: `stop-${currentRouteId}-${index + 1}`, // Example unique ID
                        location: loc,
                        index: index + 1, // 1-based index
                        routeId: currentRouteId, 
                        name: `Stop ${index + 1} for Route ${currentRouteId}` // Example name, can be undefined
                    };
                    return busStop;
                });
            });
            set({ busStopsByID: stopsByIdProcessed });

        } catch (error) {
            console.error("Error fetching bus routes in store:", error);
            set({ error: (error as Error).message, loading: false });
        }
    },

    getBusRoutes: () => { 
        if (get().busRoutes.length === 0 && !get().loading) {
            get().fetchRoutes(); 
        }
        return get().busRoutes;
    },

    getRouteColor: (routeId: number) => { 
        const colors = get().routeColors;
        return colors[routeId % colors.length]; // Assuming routeId can be used for cycling colors
    },

    toggleRouteVisibility: (routeId: number) => { 
        set(state => ({
            busRoutesVisibility: {
                ...state.busRoutesVisibility,
                [routeId]: !state.busRoutesVisibility[routeId]
            }
        }));
    }
}));

export default useBusRouteStore;