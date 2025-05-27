/**
 * @file busRoutesService.ts
 * @description Service for fetching bus route data.
 */

// Define a basic structure for the expected route data for type safety, if known.
// If the exact structure is complex or varies, 'any' can be used,
// but a more specific type is preferred for better TypeScript support.
import { BusRouteEdgeModel } from "@/data-models/bus-route-edge-model";

// For now, using 'any' as per the plan, to be refined in cleanup.
type BusRouteData = BusRouteEdgeModel; 

/**
 * @class BusRoutesService
 * @description Handles operations related to fetching bus routes.
 */
export class BusRoutesService {
    /**
     * @async
     * @method getAllBusRoutes
     * @description Fetches all bus routes from the backend.
     * @returns {Promise<BusRouteData[]>} A promise that resolves to an array of bus route data.
     * @throws {Error} If the network response is not ok or if fetching fails.
     */
    public async getAllBusRoutes(): Promise<BusRouteData[]> {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-all-bus-routes`);
            
            if (!response.ok) {
                // Log more details for server-side errors if possible
                const errorBody = await response.text();
                console.error(`Error fetching bus routes: ${response.status} ${response.statusText}`, errorBody);
                throw new Error(`Failed to fetch bus routes. Status: ${response.status}`);
            }

            const data = await response.json();
            return data.routes; // Assuming the backend returns an object like { routes: [...] } based on bus-routes-store.ts
        } catch (error) {
            console.error('Error in getAllBusRoutes:', error);
            // Re-throw the error or handle it as per application's error handling strategy
            // For now, re-throwing to let the caller handle it.
            throw error;
        }
    }
}

// Optional: Export an instance if you prefer singleton usage,
// though instantiating in the store is also fine.
// export const busRoutesService = new BusRoutesService();
