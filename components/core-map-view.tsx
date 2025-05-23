import useAddRouteStore from "@/stores/add-route-store";
import useBusRouteStore from "@/stores/bus-routes-store";
import { useBusStore } from "@/stores/bus-store";
import { MapPinPlusIcon } from "lucide-react";
import { useEffect } from "react";
import Map, { GeolocateControl, Layer, MapMouseEvent, Marker, Source } from "react-map-gl/mapbox";
import { busMarker, busStopMarker, newWaypointMarker } from "./markers";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import useSidebarStore from "@/stores/sidebar-store";
import { OSMGraphService, VertexData } from "@/app/services/osm-graph-service";
import { Vertex } from "@/types/vertex";
import { getMapCoordinates, getMapInstance, getMapZoom, setMapInstance } from "@/map/mapbox-map";


export default function CoreMapView() {
    const { busRoutesVisibility, busRoutes, loading, error, busRoutesByID, fetchRoutes, getBusRoutes: getRoutes, getRouteColor, busStopsByID } = useBusRouteStore(); // Access Zustand store with getRouteColor
    const { waypointRoute, newRouteBusStops: newWaypoints, vertices, addVertex, addBusStop: addWaypoint, addWaypointRoute, intermediateRoutes } = useAddRouteStore();
    const { fetchBuses, buses, getBuses, busVisibility } = useBusStore();
    const { activeMenu, setActiveMenu: setActive } = useSidebarStore();

    const osmGraphService: OSMGraphService = new OSMGraphService()

    useEffect(() => {
        fetchRoutes(); // Fetch routes when component mounts
        fetchBuses(); // Fetch buses when component mounts
    }, [fetchRoutes, fetchBuses]);

    async function onAddRouteClick(e: MapMouseEvent) {
        const { lngLat } = e;
        const { lng, lat } = lngLat;
        console.log(lngLat)

        const nearestVertex: Vertex = await osmGraphService.getNearestNode(lat, lng)
        console.log('response', nearestVertex)

        addWaypoint({ location: [nearestVertex.longitude, nearestVertex.latitude] });
        addVertex(nearestVertex);

        console.log('steps in bw', intermediateRoutes)
        console.log('vertices', vertices)
    }



    return <Map
        onLoad={(e) => {
            const map = e.target;
            setMapInstance(map); // set globally
            console.log('set global map', getMapInstance())
        }}

        onClick={(e) => {
            if (activeMenu.addRoute) {
                onAddRouteClick(e);
            }

        }}

        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={{
            ...getMapCoordinates(),
            ...getMapZoom(),
            // latitude: 24.8004,
            // longitude: 67.0599,
            // zoom: 13,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
    >
        {activeMenu.addRoute && (

            <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-2 w-[90%] w-fit z-50">
                <Alert variant="default" className="relative flex items-center">
                    <div className="p-1 bg-green-500 rounded-lg">
                        <MapPinPlusIcon className="text-white" />
                    </div>
                    <div className="ml-3">
                        <AlertTitle className=''>Adding new Bus Route</AlertTitle>
                        <AlertDescription>Add Bus stops to the new Bus Route by placing markers on the map.</AlertDescription>
                    </div>
                </Alert>
            </div>

        )}
        {
            Object.entries(busRoutesByID).map(([routeId, routeSegments], colorIndex) => {
                const routeIdNumber: number = Number(routeId)
                if (!busRoutesVisibility[routeIdNumber]) return null;

                const routeColor = getRouteColor(Number(routeIdNumber));

                return routeSegments.map((segment, index) => (
                    <Source
                        key={`route-${routeIdNumber}-${index}`}
                        id={`route-${routeIdNumber}-${index}`}
                        type="geojson"
                        data={{
                            type: "Feature",
                            geometry: {
                                type: "LineString",
                                coordinates: segment.geom.coordinates || []
                            },
                            properties: {}
                        }}
                    >
                        {/* Border Layer */}
                        <Layer
                            id={`route-border-${routeIdNumber}-${index}`}
                            type="line"
                            layout={{ "line-join": "round", "line-cap": "round" }}
                            paint={{
                                "line-color": "#000000",
                                "line-width": 8,
                                "line-opacity": 0.3
                            }}
                        />
                        {/* Main Colored Route */}
                        <Layer
                            id={`route-line-${routeIdNumber}-${index}`}
                            type="line"
                            layout={{ "line-join": "round", "line-cap": "round" }}
                            paint={{
                                "line-color": routeColor,
                                "line-width": 5
                            }}
                        />
                    </Source>
                ));
            })
        }

        {/* drawing bus stops */}
        {
            Object.entries(busStopsByID).map(([routeId, locations], routeIndex) => {
                const routeIdNumber: number = Number(routeId)
                if (!busRoutesVisibility[routeIdNumber]) return null;

                return locations.map((busStop, index) => {
                    return busStopMarker(busStop, getRouteColor(busStop.routeId));
                });
            })
        }

        {
            newWaypoints?.length > 0 && activeMenu.addRoute &&
            newWaypoints.map((waypoint, index) => {
                return (
                    newWaypointMarker(waypoint, index + 1) // Pass index + 1 as orderNumber
                );
            })
        }

        {
            waypointRoute && activeMenu.addRoute &&
            <Source

                id="waypoint-route"
                type="geojson"
                data={
                    {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: waypointRoute.coordinates || []
                        },
                        properties: {}
                    }
                }
            >
                <Layer
                    id="waypoint-route-line"
                    type="line"
                    layout={{ "line-join": "round", "line-cap": "round" }}
                    paint={{
                        "line-color": "#4dc44d",
                        "line-width": 5
                    }} />
            </Source>
        }

        {
            buses?.length > 0 &&
            buses.map((bus, index) => {
                if (!busVisibility![index]) return null; // Skip hidden buses
                // console.log('bus', bus);
                return busMarker(bus);
            })
        }
        <GeolocateControl onError={(e) => console.log(e)} onTrackUserLocationStart={(e) => console.log(e)} onTrackUserLocationEnd={(e) => console.log(e)} onGeolocate={(e) => console.log(e)}></GeolocateControl>

    </Map >;
}