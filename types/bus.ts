export interface Bus {
    id?: string;
    name?: string;
    route?: string;
    location: {
        type?: string;
        coordinates: [number, number];
    };
    lastUpdated?: string;
}
