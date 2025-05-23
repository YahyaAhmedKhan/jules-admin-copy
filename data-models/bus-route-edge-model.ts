export interface BusRouteEdgeModel {
    route_id: number;
    route_description: string;
    bus_type_id: number;
    bus_type_description: string;
    edge_id: number;
    source: number;
    source_lat: number;
    source_lon: number;
    target: number;
    target_lat: number;
    target_lon: number;
    cost: number;
    reverse_cost: number;
    geom: {
        type: string;
        crs: {
            type: string;
            properties: {
                name: string;
            };
        };
        coordinates: [number, number][];
    };
}