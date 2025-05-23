export interface Vertex {
    id: number;
    latitude: number;
    longitude: number;
    geom: {
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
