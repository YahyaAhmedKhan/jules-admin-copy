import { BusRouteEdgeModel } from '@/data-models/bus-route-edge-model';
import { create } from 'zustand';
import { Location } from '@/types/location';
import { BusStop } from '@/types/bus-stop';

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
    toggleRouteVisibility: (index: number) => void; // Toggle visibility for a specific route
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
        const visibilityState = get().busRoutesVisibility;
        visibilityState[routeId] = visibility;
        set({ busRoutesVisibility: visibilityState });
    },
    fetchRoutes: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('/api/busRoutes'); // Use your API

            if (!response.ok) throw new Error('Failed to fetch bus routes');

            const data = await response.json();

            set({
                busRoutes: data.routes,
                busRoutesVisibility: Object.fromEntries(data.routes.map((route: BusRouteEdgeModel) => [route.route_id, true])),
                loading: false
            });

            const groupedById: { [key: number]: BusRouteEdgeModel[] } = {};
            data.routes.forEach((route: BusRouteEdgeModel) => {
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
            if (data.routes && Array.isArray(data.routes)) {
                data.routes.forEach((route: BusRouteEdgeModel) => {
                    if (route && typeof route.bus_type_id !== 'undefined') {
                        groupVisibilityInit[route.bus_type_id] = true; // Default to true (expanded)
                    }
                });
            }
            set({ busRouteGroupVisibility: groupVisibilityInit });

            const tempStopsById: { [key: number]: Set<string> } = {};

            data.routes.forEach((route: BusRouteEdgeModel) => {
                const id = route.route_id;

                if (!tempStopsById[id]) {
                    tempStopsById[id] = new Set<string>();
                }

                tempStopsById[id].add(JSON.stringify({
                    latitude: route.source_lat,
                    longitude: route.source_lon
                }));

                tempStopsById[id].add(JSON.stringify({
                    latitude: route.target_lat,
                    longitude: route.target_lon
                }));
            });

            const stopsById: { [key: number]: BusStop[] } = {};

            Object.entries(tempStopsById).forEach(([id, locSet]) => {
                stopsById[Number(id)] = Array.from(locSet).map((locStr, index) => {
                    const loc: Location = JSON.parse(locStr);
                    const busStop: BusStop = {
                        routeId: Number(id),
                        location: loc,
                        index: index + 1
                    };
                    return busStop;
                });
            });

            set({
                busStopsByID: stopsById,
            });

        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    getBusRoutes: () => {
        if (get().busRoutes.length === 0 && !get().loading) {
            get().fetchRoutes(); // Fetch only if routes are empty and not already loading
        }
        return get().busRoutes;
    },

    // Get color for a specific route index, with cycling for when there are more routes than colors
    getRouteColor: (index: number) => {
        const colors = get().routeColors;
        return colors[index % colors.length];
    },

    toggleRouteVisibility: (index: number) => {
        const visibility = get().busRoutesVisibility;
        visibility[index] = !visibility[index];
        set({ busRoutesVisibility: visibility });
    },

    // Added toggleGroupVisibility function
    toggleGroupVisibility: (busTypeId: number) => {
        const { busRoutes, busRouteGroupVisibility, busRoutesVisibility } = get();
        
        const newGroupVisibility = { ...busRouteGroupVisibility };
        newGroupVisibility[busTypeId] = !newGroupVisibility[busTypeId];
        const currentGroupState = newGroupVisibility[busTypeId];

        const newRoutesVisibility = { ...busRoutesVisibility };
        busRoutes.forEach(route => {
            if (route.bus_type_id === busTypeId) {
                newRoutesVisibility[route.route_id] = currentGroupState;
            }
        });

        set({ 
            busRouteGroupVisibility: newGroupVisibility, 
            busRoutesVisibility: newRoutesVisibility 
        });
    },
}));

export default useBusRouteStore;