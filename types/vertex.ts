/**
 * @file vertex.ts
 * @description Defines the structure for a graph vertex, typically representing a point in a road network.
 */

/**
 * @interface Vertex
 * @description Represents a vertex (or node) in a graph, often corresponding to a geographic point.
 */
export interface Vertex {
    /**
     * @property {number} id - The unique identifier for this vertex within the graph or dataset.
     */
    id: number;

    /**
     * @property {number} osm_id - The OpenStreetMap identifier for the node, if applicable.
     */
    osm_id: number; // Added osm_id as per documentation instruction

    /**
     * @property {number} latitude - The latitude coordinate of the vertex.
     */
    latitude: number;

    /**
     * @property {number} longitude - The longitude coordinate of the vertex.
     */
    longitude: number;

    /**
     * @property {object} [geom] - Optional geometric representation of the vertex, often in GeoJSON format.
     * @property {string} [geom.type] - The type of geometry (e.g., "Point").
     * @property {object} [geom.crs] - Coordinate Reference System information.
     * @property {string} [geom.crs.type] - Type of CRS (e.g., "name").
     * @property {object} [geom.crs.properties] - Properties of the CRS.
     * @property {string} [geom.crs.properties.name] - Name of the CRS (e.g., "EPSG:4326").
     * @property {[number, number]} [geom.coordinates] - The coordinates of the point, typically [longitude, latitude].
     */
    geom?: { // Made geom optional as it might not always be present, and added TSDoc for its sub-properties
        type: string;
        crs: {
            type: string;
            properties: {
                name: string;
            };
        };
        coordinates: [number, number];
    };
}
