import mbxDirectionsClient from '@mapbox/mapbox-sdk/services/directions';

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
if (!accessToken) {
    throw new Error('Mapbox access token is not defined');
}

const directionsClient = mbxDirectionsClient({ accessToken: accessToken });

// Define the structure for a waypoint as expected by the Mapbox Directions API
interface MapboxWaypoint {
  coordinates: [number, number]; // [longitude, latitude]
  // Add other optional properties if needed, e.g.:
  // approach?: 'curb' | 'unrestricted';
  // bearing?: [number, number];
  // waypointName?: string;
}

export async function getRoutesMapbox(waypoints: MapboxWaypoint[]) {
    // console.log("waypoints to api: ", waypoints);

    // const coordinates = waypoints.map((waypoint: MapboxWaypoint) => {
    //     coordinates: waypoint.coordinates
    // }
    // );

    const request = directionsClient.getDirections({
        profile: 'driving-traffic',
        geometries: 'geojson',
        waypoints: waypoints, // SDK expects an array of objects with a 'coordinates' property
    })
    const response = await request.send();
    return response.body;

}