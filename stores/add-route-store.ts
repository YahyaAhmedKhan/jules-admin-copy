import { getRoutesMapbox } from '@/app/services/mapbox-service';
import { BusRouteTypeModel } from '@/types/bus-route-type';
import { Vertex } from '@/types/vertex';
import Waypoint from '@/types/waypoint';
import { LngLat } from 'react-map-gl/mapbox';
import { create } from 'zustand';

interface AddRouteStore {
    newRouteBusStops: Waypoint[];
    addBusStop: (waypoint: Waypoint) => void;
    // removeBusStop: (index: number) => void; // Old action removed
    deleteBusStop: (stopId: string) => Promise<void>; // New action added
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
    newRouteBusStops: [],
    vertices: [],
    addVertex: (newVertex) => { set({ vertices: [...get().vertices, newVertex] }); },
    addBusStop: (waypoint) => {
        const waypointWithId = {
            ...waypoint,
            id: waypoint.id || Date.now().toString(), 
        };

        set(state => ({ newRouteBusStops: [...state.newRouteBusStops, waypointWithId] }));

        const newWaypoints = get().newRouteBusStops;
        if (newWaypoints.length > 1) {
            const lastTwo = newWaypoints.slice(-2);
            const wayPointCoordinatesForMapbox = lastTwo.map(wp => ({
                coordinates: [wp.location[0], wp.location[1]] 
            }));

            getRoutesMapbox(wayPointCoordinatesForMapbox).then((data) => {
                const route = data.routes[0];
                const intermediateRoute: intermediateRouteInfo = {
                    weight: route.weight,
                    geometry: {
                        type: 'LineString',
                        coordinates: route.geometry.coordinates
                    }
                };
                const updatedIntermediateRoutes = [...get().intermediateRoutes, intermediateRoute];
                set({ intermediateRoutes: updatedIntermediateRoutes });

                const concatenatedCoordinates = updatedIntermediateRoutes.flatMap(route => route.geometry.coordinates);
                const fullRoute = {
                    type: 'LineString',
                    coordinates: concatenatedCoordinates
                };
                set({ waypointRoute: fullRoute });

            }).catch((error) => {
                console.error("Error fetching route from Mapbox:", error);
            });
        }
    },
    // removeBusStop: (index) => set({ newRouteBusStops: get().newRouteBusStops.filter((_, i) => i !== index) }), // Old implementation removed

    deleteBusStop: async (stopId: string) => {
        const currentStops = get().newRouteBusStops;
        const stopIndexToRemove = currentStops.findIndex(stop => stop.id === stopId);

        if (stopIndexToRemove === -1) {
            console.warn("Bus stop not found for deletion:", stopId);
            return;
        }

        // 1. Filter out the stop and its corresponding vertex
        const updatedBusStops = currentStops.filter(stop => stop.id !== stopId);
        
        // Assuming vertices are in the same order as newRouteBusStops
        const updatedVertices = get().vertices.filter((vertex, index) => index !== stopIndexToRemove);

        set({
            newRouteBusStops: updatedBusStops,
            vertices: updatedVertices,
            intermediateRoutes: [], // Clear old segments
            waypointRoute: null,   // Clear old full route
        });

        // 3. Recalculate intermediate routes if more than 1 stop remains
        if (updatedBusStops.length > 1) {
            const newIntermediateRoutes: intermediateRouteInfo[] = [];
            for (let i = 0; i < updatedBusStops.length - 1; i++) {
                const pair = [updatedBusStops[i], updatedBusStops[i + 1]];
                const wayPointCoordinatesForMapbox = pair.map(wp => ({
                    coordinates: [wp.location[0], wp.location[1]]
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
                        console.warn("No route found for segment:", pair);
                    }
                } catch (error) {
                    console.error("Error fetching route for segment:", pair, error);
                }
            }
            set({ intermediateRoutes: newIntermediateRoutes });

            // 4. Rebuild full waypointRoute
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
        newRouteBusStops: [],
        waypointRoute: null,
        intermediateRoutes: [],
        vertices: [], // This is already cleared
        editState: 'idle',
        newRouteTypeSelectionId: null
    }),

}));

export default useAddRouteStore;