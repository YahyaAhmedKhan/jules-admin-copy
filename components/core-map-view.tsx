import useAddRouteStore from "@/stores/add-route-store";
import useBusRouteStore from "@/stores/bus-routes-store";
import { useBusStore } from "@/stores/bus-store";
import { MapPinPlusIcon } from "lucide-react";
import { useEffect } from "react";
import Map, { GeolocateControl, Layer, MapMouseEvent, Source } from "react-map-gl/mapbox";
import { busMarker, busStopMarker, newWaypointMarker } from "./markers";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import useSidebarStore from "@/stores/sidebar-store";
import { OSMGraphService, } from "@/app/services/osm-graph-service";
import { Vertex } from "@/types/vertex";
import { getMapCoordinates, getMapInstance, getMapZoom, setMapInstance } from "@/map/mapbox-map";


export default function CoreMapView() {
    // Ensure mapGroupVisibilityState is destructured
    const { busRoutesVisibility, busRoutesByID, fetchRoutes, getRouteColor, busStopsByID, mapGroupVisibilityState } = useBusRouteStore();
    const { waypointRoute, newRouteBusStops, vertices, addVertex, addBusStop, intermediateRoutes } = useAddRouteStore();
    const { fetchBuses, buses, busVisibility } = useBusStore();
    const { activeMenu } = useSidebarStore();

    const osmGraphService: OSMGraphService = new OSMGraphService()

    useEffect(() => {
        fetchRoutes();
        fetchBuses();
    }, [fetchRoutes, fetchBuses]);

    async function onAddRouteClick(e: MapMouseEvent) {
        const { lngLat } = e;
        const { lng, lat } = lngLat;
        console.log(lngLat)

        const nearestVertex: Vertex = await osmGraphService.getNearestNode(lat, lng)
        console.log('response', nearestVertex)

        addBusStop([nearestVertex.longitude, nearestVertex.latitude]);
        addVertex(nearestVertex);

        console.log('steps in bw', intermediateRoutes)
        console.log('vertices', vertices)
    }



    return <Map
        onLoad={(e) => {
            const map = e.target;
            setMapInstance(map);
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
            Object.entries(busRoutesByID).map(([routeId, routeSegments]) => {
                const routeIdNumber: number = Number(routeId);

                if (!routeSegments || routeSegments.length === 0) {
                    console.warn(`Route ID ${routeId} has no segments. Skipping rendering.`);
                    return null;
                }
                const busTypeIdForGroup = routeSegments[0].bus_type_id;
                if (busTypeIdForGroup === undefined) {
                    console.warn(`Route ID ${routeId} segments miss bus_type_id. Skipping rendering.`);
                    return null;
                }

                // New combined visibility check:
                const isGroupVisibleOnMap = mapGroupVisibilityState[busTypeIdForGroup] !== false;
                const isRouteIndividuallyVisible = busRoutesVisibility[routeIdNumber] !== false;

                if (!isGroupVisibleOnMap || !isRouteIndividuallyVisible) {
                    return null; // Do not render this route or its segments
                }

                const routeColor = getRouteColor(busTypeIdForGroup);

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
            Object.entries(busStopsByID).map(([routeIdStr, locations]) => {
                const routeIdForStops = Number(routeIdStr);

                const routeSegmentsForGroupInfo = busRoutesByID[routeIdForStops];
                if (!routeSegmentsForGroupInfo || routeSegmentsForGroupInfo.length === 0) {
                    // console.warn(`No route segments found for routeId ${routeIdForStops}, cannot determine group visibility for stops.`);
                    return null;
                }
                const busTypeIdForStopsGroup = routeSegmentsForGroupInfo[0].bus_type_id;
                if (busTypeIdForStopsGroup === undefined) {
                    // console.warn(`Bus_type_id undefined for routeId ${routeIdForStops}, cannot determine group visibility for stops.`);
                    return null;
                }

                // New combined visibility check for the entire group of stops for this routeId:
                const isStopGroupVisibleOnMap = mapGroupVisibilityState[busTypeIdForStopsGroup] !== false;
                const isParentRouteIndividuallyVisible = busRoutesVisibility[routeIdForStops] !== false;

                if (!isStopGroupVisibleOnMap || !isParentRouteIndividuallyVisible) {
                    return null; // Do not render any stops for this routeId
                }

                return locations.map((busStop) => {
                    let colorForStopMarker = '#CCCCCC';
                    if (busTypeIdForStopsGroup !== undefined) {
                        colorForStopMarker = getRouteColor(busTypeIdForStopsGroup);
                    }
                    return busStopMarker(busStop, colorForStopMarker);
                });
            })
        }

        {
            newRouteBusStops?.length > 0 && activeMenu.addRoute &&
            newRouteBusStops.map((busStop) => {
                return (
                    newWaypointMarker(busStop, busStop.index)
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
                if (!busVisibility || !busVisibility[index]) return null;
                return busMarker(bus);
            })
        }
        <GeolocateControl onError={(e) => console.log(e)} onTrackUserLocationStart={(e) => console.log(e)} onTrackUserLocationEnd={(e) => console.log(e)} onGeolocate={(e) => console.log(e)}></GeolocateControl>

    </Map >;
}