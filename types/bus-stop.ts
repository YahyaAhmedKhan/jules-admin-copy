/**
 * @file bus-stop.ts
 * @description Defines the structure for a bus stop.
 */

import { Location } from './location';

/**
 * @interface BusStop
 * @description Represents a physical or logical stop along a bus route.
 */
export interface BusStop {
    /**
     * @property {string} [id] - Optional unique identifier for the bus stop instance.
     * Often generated dynamically.
     */
    id?: string;

    /**
     * @property {string} [name] - Optional user-defined name for the bus stop.
     */
    name?: string;

    /**
     * @property {Location} location - The geographic location of the bus stop.
     */
    location: Location;

    /**
     * @property {number} index - The 1-based order or sequence number of this stop on a specific route or during route creation.
     */
    index: number;

    /**
     * @property {number} [routeId] - Optional identifier of the bus route this stop is associated with.
     */
    routeId?: number;
}