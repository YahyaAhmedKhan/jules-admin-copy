/**
 * @file bus.ts
 * @description Defines the structure for bus information.
 */

/**
 * @interface Bus
 * @description Represents a bus, including its identification, location, and operational details.
 */
export interface Bus {
    /**
     * @property {string} [id] - Optional unique identifier for the bus.
     */
    id?: string;

    /**
     * @property {string} [name] - Optional user-friendly name or designation for the bus.
     */
    name?: string;

    /**
     * @property {string} [route] - Optional identifier of the route the bus is currently associated with.
     */
    route?: string;

    /**
     * @property {object} location - The geographic location of the bus.
     * @property {string} [location.type] - Optional type of the location data structure (e.g., "Point").
     * @property {[number, number]} location.coordinates - An array containing longitude and latitude (or latitude and longitude, depending on convention, typically [longitude, latitude] for GeoJSON-like structures).
     */
    location: {
        type?: string;
        coordinates: [number, number]; // Convention needs to be specified, e.g., [longitude, latitude]
    };

    /**
     * @property {string} [lastUpdated] - Optional timestamp indicating when the bus's information was last updated.
     * Should be in a standard date-time format, e.g., ISO 8601.
     */
    lastUpdated?: string;
}
