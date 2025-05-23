/**
 * @file busesService.ts
 * @description Service for fetching bus data.
 */

import { dummyBuses } from '@/dummydata/dummy-buses'; // Import dummy data
import { Bus } from '@/types/bus'; // Assuming Bus type is defined here

// For now, using 'Bus[]' as the return type, assuming dummyBuses conforms to this.
// This can be refined in the cleanup phase if Bus type needs adjustment.

/**
 * @class BusesService
 * @description Handles operations related to fetching bus information.
 */
export class BusesService {
    /**
     * @async
     * @method getAllBuses
     * @description Fetches all bus data. Currently returns dummy data.
     * @returns {Promise<Bus[]>} A promise that resolves to an array of bus data.
     * @throws {Error} If fetching fails (though less likely with dummy data).
     */
    public async getAllBuses(): Promise<Bus[]> {
        try {
            // Simulate an asynchronous operation, similar to a real API call
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate 0.5 second delay

            // Return a deep copy of the dummy data to prevent accidental modification
            // of the source if the consumer modifies the array/objects.
            const dataToReturn = JSON.parse(JSON.stringify(dummyBuses));
            
            return dataToReturn;
        } catch (error) {
            console.error('Error in getAllBuses (dummy data):', error);
            // Re-throw or handle as per application's strategy
            throw error;
        }
    }
}

// Optional: Export an instance for singleton usage
// export const busesService = new BusesService();
