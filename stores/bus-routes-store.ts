import { BusRouteEdgeModel } from '@/data-models/bus-route-edge-model';
import { create } from 'zustand';
import { Location } from '@/types/location';
import { BusStop } from '@/types/bus-stop';
import { BusRoutesService } from '@/services/busRoutesService'; 

const busRoutesService = new BusRoutesService();

const ROUTE_COLORS = [
    '#FF5733', '#33A8FF', '#4CAF50', '#9C27B0', '#FFC107', 
    '#E91E63', '#3F51B5', '#00BCD4', '#FF9800', '#8BC34A', 
    '#673AB7', '#2196F3'
];

interface BusRoutesStore {
    busRoutes: BusRouteEdgeModel[];
    busRoutesByID: { [key: number]: BusRouteEdgeModel[] };
    clearBusRoutesByIds: () => void;
    busStopsByID: { [key: number]: BusStop[] }; 
    clearBusStopsByIds: () => void;
    busRoutesVisibility: { [routeId: number]: boolean };
    sidebarGroupExpansionState: { [busTypeId: number]: boolean }; 
    mapGroupVisibilityState: { [busTypeId: number]: boolean };    
    busTypeColors: { [busTypeId: number]: string }; 
    setBusRoutesVisibility: (routeId: number, visibility: boolean) => void;
    toggleSidebarGroupExpansion: (busTypeId: number) => void; // Renamed
    toggleMapGroupVisibility: (busTypeId: number) => void;    // Added
    loading: boolean;
    error: string | null;
    routeColors: string[]; 
    fetchRoutes: () => Promise<void>;
    getBusRoutes: () => any[]; 
    getRouteColor: (busTypeId: number) => string; 
    toggleRouteVisibility: (routeId: number) => void; 
}

const useBusRouteStore = create<BusRoutesStore>((set, get) => ({
    busRoutes: [],
    busRoutesVisibility: {},
    sidebarGroupExpansionState: {}, 
    mapGroupVisibilityState: {},    
    busTypeColors: {}, 
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

    toggleSidebarGroupExpansion: (busTypeId: number) => { // Renamed
        set(state => {
            const newExpansionState = { ...state.sidebarGroupExpansionState };
            newExpansionState[busTypeId] = !newExpansionState[busTypeId];
            return { sidebarGroupExpansionState: newExpansionState };
        });
    },

    toggleMapGroupVisibility: (busTypeId: number) => { // Added
        set(state => {
            const newMapVisibility = { ...state.mapGroupVisibilityState };
            newMapVisibility[busTypeId] = !newMapVisibility[busTypeId];
            return { mapGroupVisibilityState: newMapVisibility };
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
                const id = route.route_id; 
                if (!groupedById[id]) {
                    groupedById[id] = [];
                }
                groupedById[id].push(route);
            });
            set({ busRoutesByID: groupedById });

            const uniqueBusTypes: Map<number, string> = new Map();
            fetchedRoutes.forEach((route: BusRouteEdgeModel) => {
                if (route.bus_type_id !== undefined && route.bus_type_description) {
                    if (!uniqueBusTypes.has(route.bus_type_id)) {
                        uniqueBusTypes.set(route.bus_type_id, route.bus_type_description);
                    }
                }
            });

            const newBusTypeColors: { [busTypeId: number]: string } = {};
            const availableColors = get().routeColors; 
            let colorIndex = 0;
            uniqueBusTypes.forEach((description, busTypeId) => {
                newBusTypeColors[busTypeId] = availableColors[colorIndex % availableColors.length];
                colorIndex++;
            });
            set({ busTypeColors: newBusTypeColors });

            const groupExpansionInit: { [busTypeId: number]: boolean } = {};
            const mapVisibilityInit: { [busTypeId: number]: boolean } = {};

            fetchedRoutes.forEach((route: BusRouteEdgeModel) => {
                if (typeof route.bus_type_id !== 'undefined') {
                    groupExpansionInit[route.bus_type_id] = true; 
                    mapVisibilityInit[route.bus_type_id] = true;  
                }
            });
            set({ 
                sidebarGroupExpansionState: groupExpansionInit,
                mapGroupVisibilityState: mapVisibilityInit 
            });


            const tempStopsById: { [key: number]: Set<string> } = {};
            fetchedRoutes.forEach((route: BusRouteEdgeModel) => {
                const id = route.route_id;
                if (!tempStopsById[id]) {
                    tempStopsById[id] = new Set<string>();
                }
                tempStopsById[id].add(JSON.stringify({ latitude: route.source_lat, longitude: route.source_lon } as Location));
                tempStopsById[id].add(JSON.stringify({ latitude: route.target_lat, longitude: route.target_lon } as Location));
            });

            const stopsByIdProcessed: { [key: number]: BusStop[] } = {};
            Object.entries(tempStopsById).forEach(([idString, locSet]) => {
                const currentRouteId = Number(idString);
                stopsByIdProcessed[currentRouteId] = Array.from(locSet).map((locStr, index) => {
                    const loc: Location = JSON.parse(locStr);
                    const busStop: BusStop = {
                        id: `stop-${currentRouteId}-${index + 1}`, 
                        location: loc,
                        index: index + 1, 
                        routeId: currentRouteId, 
                        name: `Stop ${index + 1} for Route ${currentRouteId}` 
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

    getRouteColor: (busTypeId: number) => { 
        const colorsMap = get().busTypeColors;
        const defaultColor = '#CCCCCC'; 
        return colorsMap[busTypeId] || defaultColor;
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