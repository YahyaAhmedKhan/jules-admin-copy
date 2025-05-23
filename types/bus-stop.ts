import { Location } from "./location";

export interface BusStop {
    routeId: number;
    name?: string;
    location: Location;
    index?: number;
}