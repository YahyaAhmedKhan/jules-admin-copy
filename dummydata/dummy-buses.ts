import { Bus } from "@/types/bus";

export const dummyBuses: Bus[] = [
    {
        id: "1",
        name: 'Bus 1',
        route: 'Route 1',
        location: {
            type: 'Point',
            coordinates: [67.04973748986745, 24.80730468912499] // [longitude, latitude]67.053328, 24.798438
        },
        lastUpdated: new Date().toISOString()
    },
    {
        id: "2",
        name: 'Bus 2',
        route: 'Route 2',
        location: {
            type: 'Point',
            coordinates: [67.053912, 24.806981]
        },
        lastUpdated: new Date().toISOString()
    },
    {
        id: "3",
        name: 'Bus 3',
        route: 'Route 3',
        location: {
            type: 'Point',
            coordinates: [67.071627, 24.811506]
        },
        lastUpdated: new Date().toISOString()
    },
    // Add more buses as needed
];


