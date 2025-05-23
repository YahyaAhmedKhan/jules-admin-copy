import mbxDirectionsClient from '@mapbox/mapbox-sdk/services/directions';

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
if (!accessToken) {
    throw new Error('Mapbox access token is not defined');
}

const directionsClient = mbxDirectionsClient({ accessToken: accessToken });

export async function getRoutesMapbox(waypoints: any[]) {
    // console.log("waypoints to api: ", waypoints);

    // const coordinates = waypoints.map((waypoint: any) => {
    //     coordinates: waypoint.coordinates
    // }
    // );

    const request = directionsClient.getDirections({
        profile: 'driving-traffic',
        geometries: 'geojson',
        waypoints: waypoints,
    })
    const response = await request.send();
    return response.body;

}