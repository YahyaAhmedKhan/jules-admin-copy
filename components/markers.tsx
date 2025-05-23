import { Marker } from "react-map-gl/mapbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Bus } from "@/types/bus";
import { Bus as BusLucide, BusFront, MapPinPlusIcon } from "lucide-react";
import Waypoint from "@/types/waypoint";
import { BusStop } from "@/types/bus-stop";
import useBusRouteStore from "@/stores/bus-routes-store";


export const busMarker = (busLocation: Bus) => {
    return (
        <Marker
            key={`bus-${busLocation.id}`}
            latitude={busLocation.location.coordinates[0]}
            longitude={busLocation.location.coordinates[1]}
        >
            <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger className="relative">
                    <div className="bg-black rounded-lg p-1">
                        <BusLucide className="text-white" />
                        {/* <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">1</div> */}
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-fit h-fit py-2 z-50">
                    <div className="text-center text-xs space-y-1">
                        <div>
                            <span className="font-bold">Bus ID:</span> {busLocation.id}
                        </div>
                        <div>
                            {/* <span className="font-bold">Name:</span> {busLocation.name} */}
                        </div>
                        <div>
                            <span className="font-bold">Lat:</span> {busLocation.location.coordinates[0].toFixed(3)},
                            <span className="font-bold ml-1">Lng:</span> {busLocation.location.coordinates[1].toFixed(3)}
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </Marker>
    );
}

export const busStopMarker = (busStop: BusStop, color?: string) => {
    // Default color with fallback
    const markerColor = color || '#FF5733';

    return (
        <Marker
            key={`bus-stop-${busStop.location.latitude}`}
            longitude={busStop.location.longitude}
            latitude={busStop.location.latitude}
            color={markerColor}
        >
            <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger className="relative">
                    <div
                        className="rounded-lg p-1"
                        style={{ backgroundColor: markerColor }}
                    >
                        <BusFront color="white" />
                        {busStop.index && (
                            <div className="absolute -top-1 -right-1 bg-gray-50 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full outline-dotted">{busStop.index}</div>
                        )}
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-fit h-fit py-2 z-50">
                    <div className="text-center text-xs space-y-1">
                        <div>
                            <span className="font-bold">Lat:</span> {busStop.location.latitude.toFixed(3)},
                            <span className="font-bold ml-1">Lng:</span> {busStop.location.longitude.toFixed(3)}
                        </div>
                        <div>
                            <span className="font-bold">Route ID:</span> {busStop.routeId}
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </Marker>
    );
}

export const newWaypointMarker = (waypoint: Waypoint) => {
    return (
        <Marker
            key={`waypoint-${Math.random()}`}
            longitude={waypoint.location[0]}
            latitude={waypoint.location[1]}
        >
            <div className="relative bg-green-500 rounded-lg p-1">
                <MapPinPlusIcon className="text-white" />
                <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">1</div>
            </div>
        </Marker>
    );
}