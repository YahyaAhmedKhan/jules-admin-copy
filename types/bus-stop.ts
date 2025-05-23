import { Location } from './location'; // Assuming location.ts is in the same directory

export interface BusStop {
    id?: string;                 // Added: Unique identifier for the stop instance
    name?: string;               // Added: User-defined name for the stop
    location: Location;          // Existing: Geographic location
    index: number;               // Existing: Order/sequence number of the stop
    routeId?: number;            // Changed: Associated route ID, now optional
    // Add any other properties that might already be in BusStop,
    // but ensure the above are present and correctly typed.
}