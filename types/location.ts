/**
 * @file location.ts
 * @description Defines the structure for geographic location coordinates.
 */

/**
 * @interface Location
 * @description Represents a geographic location with latitude and longitude.
 */
export interface Location {
    /**
     * @property {number} latitude - The latitude coordinate.
     */
    latitude: number;

    /**
     * @property {number} longitude - The longitude coordinate.
     */
    longitude: number;
}