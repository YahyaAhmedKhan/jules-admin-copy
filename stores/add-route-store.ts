import { getRoutesMapbox } from '@/app/services/mapbox-service';
import { BusRouteTypeModel } from '@/types/bus-route-type';
import { Vertex } from '@/types/vertex';
import { BusStop } from '@/types/bus-stop'; // Changed from Waypoint
// LngLat might not be used anymore directly in this file if addBusStop takes [number, number]
// import { LngLat } from 'react-map-gl/mapbox'; 
import { create } from 'zustand';

interface AddRouteStore {
    newRouteBusStops: BusStop[]; // Changed from Waypoint[]
    addBusStop: (locationCoords: [number, number]) => void; // Changed signature
    deleteBusStop: (stopId: string) => Promise<void>; 
    clearNewRouteBusStops: () => void;
    updateBusStopName: (id: string, name: string) => void;

    waypointRoute: any;
    intermediateRoutes: intermediateRouteInfo[];
    vertices: Vertex[]
    addVertex: (newVertex: Vertex) => void;
    addWaypointRoute: (route: any) => void;
    clearWaypointRoute: () => void;
    clearVertices: () => void;
    clearIntermediateRoutes: () => void;

    setAddRouteState: (state: string) => void;
    editState: string;

    newRouteTypeSelectionId: number | null
    setNewRouteTypeSelection: (newRouteTypeId: number) => void;
    clearNewRouteTypeSelection: () => void;

    clearAll: () => void;
}

export interface intermediateRouteInfo {
    weight: number,
    geometry: any
}

const useAddRouteStore = create<AddRouteStore>((set, get) => ({
    newRouteBusStops: [], // Initial state type is BusStop[]
    vertices: [],
    addVertex: (newVertex) => { set({ vertices: [...get().vertices, newVertex] }); },
    
    addBusStop: (locationCoords: [number, number]) => {
        const newStop: BusStop = {
            id: Date.now().toString(), // Simple unique ID
            location: {
                longitude: locationCoords[0],
                latitude: locationCoords[1],
            },
            index: get().newRouteBusStops.length + 1, // 1-based index
            name: undefined, // Or an initial name like `Stop ${get().newRouteBusStops.length + 1}`
            routeId: undefined,
        };

        set(state => ({ newRouteBusStops: [...state.newRouteBusStops, newStop] }));

        const currentStops = get().newRouteBusStops;
        if (currentStops.length > 1) {
            const lastTwoStops = currentStops.slice(-2);
            const wayPointCoordinatesForMapbox = lastTwoStops.map(stop => ({
                coordinates: [stop.location.longitude, stop.location.latitude]
            }));

            getRoutesMapbox(wayPointCoordinatesForMapbox).then((data) => {
                if (data && data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const segment: intermediateRouteInfo = {
                        weight: route.weight,
                        geometry: {
                            type: 'LineString',
                            coordinates: route.geometry.coordinates
                        }
                    };
                    set(state => ({ intermediateRoutes: [...state.intermediateRoutes, segment] }));

                    // Rebuild full waypointRoute after adding a segment
                    const allSegments = get().intermediateRoutes;
                    if (allSegments.length > 0) {
                        const concatenatedCoordinates = allSegments.flatMap(r => r.geometry.coordinates);
                        const fullRoute = {
                            type: 'LineString',
                            coordinates: concatenatedCoordinates
                        };
                        set({ waypointRoute: fullRoute });
                    }
                } else {
                    console.warn("No route found for segment after adding stop:", newStop);
                }
            }).catch((error) => {
                console.error("Error fetching route from Mapbox in addBusStop:", error);
            });
        }
    },

    deleteBusStop: async (stopId: string) => {
        const currentStops = get().newRouteBusStops;
        const stopIndexInArray = currentStops.findIndex(stop => stop.id === stopId);

        if (stopIndexInArray === -1) {
            console.warn("Bus stop not found for deletion:", stopId);
            return;
        }

        // Filter out the stop and its corresponding vertex
        let updatedBusStops = currentStops.filter(stop => stop.id !== stopId);
        
        // Re-assign indices to be contiguous
        updatedBusStops = updatedBusStops.map((stop, arrayIndex) => ({
            ...stop,
            index: arrayIndex + 1, // Update index to be 1-based
        }));
        
        const updatedVertices = get().vertices.filter((vertex, index) => index !== stopIndexInArray); // Assuming vertex correspondence by array index

        set({
            newRouteBusStops: updatedBusStops,
            vertices: updatedVertices,
            intermediateRoutes: [], 
            waypointRoute: null,   
        });

        if (updatedBusStops.length > 1) {
            const newIntermediateRoutes: intermediateRouteInfo[] = [];
            for (let i = 0; i < updatedBusStops.length - 1; i++) {
                const pair = [updatedBusStops[i], updatedBusStops[i + 1]];
                const wayPointCoordinatesForMapbox = pair.map(stop => ({
                    coordinates: [stop.location.longitude, stop.location.latitude]
                }));
                
                try {
                    const data = await getRoutesMapbox(wayPointCoordinatesForMapbox);
                    if (data && data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        const segment: intermediateRouteInfo = {
                            weight: route.weight,
                            geometry: {
                                type: 'LineString',
                                coordinates: route.geometry.coordinates
                            }
                        };
                        newIntermediateRoutes.push(segment);
                    } else {
                        console.warn("No route found for segment during delete recalc:", pair);
                    }
                } catch (error) {
                    console.error("Error fetching route for segment during delete recalc:", pair, error);
                }
            }
            set({ intermediateRoutes: newIntermediateRoutes });

            if (newIntermediateRoutes.length > 0) {
                const concatenatedCoordinates = newIntermediateRoutes.flatMap(route => route.geometry.coordinates);
                const fullRoute = {
                    type: 'LineString',
                    coordinates: concatenatedCoordinates
                };
                set({ waypointRoute: fullRoute });
            }
        }
    },

    clearNewRouteBusStops: () => set({ newRouteBusStops: [] }),
    clearIntermediateRoutes: () => set({ intermediateRoutes: [] }),

    updateBusStopName: (id: string, name: string) => {
        set(state => ({
            newRouteBusStops: state.newRouteBusStops.map(stop =>
                stop.id === id ? { ...stop, name: name } : stop
            ),
        }));
    },

    waypointRoute: null,
    intermediateRoutes: [],
    addWaypointRoute: (route) => { set({ waypointRoute: route }) },

    clearWaypointRoute: () => set({ waypointRoute: null }),
    clearVertices: () => set({ vertices: [] }),

    setAddRouteState: (state) => set({ editState: state }),
    editState: 'idle',
    newRouteTypeSelectionId: null,
    setNewRouteTypeSelection: (newBusRouteType) => set({ newRouteTypeSelectionId: newBusRouteType }),

    clearNewRouteTypeSelection: () => set({ newRouteTypeSelectionId: null }),

    clearAll: () => set({
        newRouteBusStops: [], // Consistent with new BusStop[] type
        waypointRoute: null,
        intermediateRoutes: [],
        vertices: [], 
        editState: 'idle',
        newRouteTypeSelectionId: null
    }),

}));

export default useAddRouteStore;