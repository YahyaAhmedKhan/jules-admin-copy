import { getRoutesMapbox } from '@/app/services/mapbox-service';
import { BusRouteTypeModel } from '@/types/bus-route-type';
import { Vertex } from '@/types/vertex';
import Waypoint from '@/types/waypoint';
import { LngLat } from 'react-map-gl/mapbox';
import { create } from 'zustand';

interface AddRouteStore {
    newRouteBusStops: Waypoint[];
    addBusStop: (waypoint: Waypoint) => void;
    removeBusStop: (index: number) => void;
    clearNewRouteBusStops: () => void;

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
    // geometry: { coordinates: [number, number][], type: "LineString" }
    geometry: any
}

const useAddRouteStore = create<AddRouteStore>((set, get) => ({
    newRouteBusStops: [],
    vertices: [],
    addVertex: (newVertex) => { set({ vertices: [...get().vertices, newVertex] }); },
    addBusStop: (waypoint) => {
        set({ newRouteBusStops: [...get().newRouteBusStops, waypoint] });

        const newWaypoints = get().newRouteBusStops;
        if (newWaypoints.length > 1) {
            const lastTwo = newWaypoints.slice(-2);
            const wayPointCoordinates = lastTwo.map((waypoint) => ({
                coordinates: [waypoint.location[0], waypoint.location[1]]
            }));
            getRoutesMapbox(wayPointCoordinates).then((data) => {
                const route = data.routes[0];
                const intermediateRoute: intermediateRouteInfo = {
                    weight: route.weight,
                    geometry: {
                        type: 'LineString',
                        coordinates: route.geometry.coordinates
                    }
                };
                console.log('inter', intermediateRoute)
                const updatedIntermediateRoutes = [...get().intermediateRoutes, intermediateRoute];
                set({ intermediateRoutes: updatedIntermediateRoutes });

                const concatenatedCoordinates = updatedIntermediateRoutes.flatMap(route => route.geometry.coordinates);
                const fullRoute = {
                    type: 'LineString',
                    coordinates: concatenatedCoordinates
                };
                set({ waypointRoute: fullRoute });
            }).catch((error) => {
                console.error(error);
            });
        }
    },
    removeBusStop: (index) => set({ newRouteBusStops: get().newRouteBusStops.filter((_, i) => i !== index) }),

    clearNewRouteBusStops: () => set({ newRouteBusStops: [] }),
    clearIntermediateRoutes: () => set({ intermediateRoutes: [] }),

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
        vertices: [],
        editState: 'idle',
        newRouteTypeSelectionId: null
    }),

}));

export default useAddRouteStore;