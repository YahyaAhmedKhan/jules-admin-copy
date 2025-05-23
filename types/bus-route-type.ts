/**
 * @file bus-route-type.ts
 * @description Defines the structure for a bus route type.
 */

/**
 * @interface BusRouteTypeModel
 * @description Represents a type or category of a bus route (e.g., "Regular", "Express", "Feeder").
 */
export interface BusRouteTypeModel {
    /**
     * @property {number} id - The unique identifier for the bus route type.
     */
    id: number;

    /**
     * @property {string} description - A human-readable description of the bus route type.
     */
    description: string;
}