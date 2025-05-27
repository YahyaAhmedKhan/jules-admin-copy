import mbxDirectionsClient from '@mapbox/mapbox-sdk/services/directions';

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
if (!accessToken) {
    throw new Error('Mapbox access token is not defined');
}

const directionsClient = mbxDirectionsClient({ accessToken: accessToken });

// Define the structure for a waypoint as expected by the Mapbox Directions API
export interface MapboxWaypoint {
    coordinates: [number, number]; // [longitude, latitude]
    // Add other optional properties if needed, e.g.:
    // approach?: 'curb' | 'unrestricted';
    // bearing?: [number, number];
    // waypointName?: string;
}
/**
    * Fetches directions from Mapbox Directions API using the provided waypoints.
    * 
    * @param waypoints - An array of waypoints, each with coordinates in [longitude, latitude] format.
    * @returns A promise that resolves to the response body containing route information.
    * 
    * @throws Will throw an error if the Mapbox access token is not defined or if the request fails.
    * 
    * @example
    * const waypoints = [
    *     { coordinates: [-122.42, 37.78] },
    *     { coordinates: [-122.45, 37.81] }
    * ];
    * const route = await getRoutesMapbox(waypoints);
    * console.log(route);
    * 
    */
export async function getRoutesMapbox(waypoints: MapboxWaypoint[]) {

    const request = directionsClient.getDirections({
        profile: 'driving-traffic',
        geometries: 'geojson',
        waypoints: waypoints, // SDK expects an array of objects with a 'coordinates' property
    })
    const response = await request.send();
    return response.body;

}