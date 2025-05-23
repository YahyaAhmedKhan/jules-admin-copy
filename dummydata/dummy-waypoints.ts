export const waypoints = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [67.053328, 24.798438] // [longitude, latitude]
            },
            properties: {
                id: 1,
                title: 'Point 1',
                description: 'Description for Point 1'
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [67.053912, 24.806981]
            },
            properties: {
                id: 2,
                title: 'Point 2',
                description: 'Description for Point 2'
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [67.071627, 24.811506]
            },
            properties: {
                id: 3,
                title: 'Point 3',
                description: 'Description for Point 3'
            }
        },
        // Add more points as needed
    ]
};