import { Vertex } from "@/types/vertex";

export class BusTypesService {
    async addNewBusRoute(vertices: Vertex[], weights: number[], geometry: string[], description: string, busTypeId: number) {

        const payload = {
            vertices,
            weights,
            geometry,
            description,
            busTypeId
        };
        console.log('Sending payload to backend:', payload);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/create-bus-route`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        console.log('response', response)
        if (!response.ok) {
            throw new Error("could not create bus route");
        }

        return response.json();


    }

    async getAllBusTypes() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-all-bus-types`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error("could not fetch bus types");
        }

        return response.json();
    }

    async addBusType(description: string) {
        // post request to backend
        const payload = {
            description
        };
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/create-bus-type`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error("could not add bus type");
        }
        return response.json();
    }

    async deleteBusType(busTypeId: number) {
        // delete request to backend, query param busTypeId

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/delete-bus-type?busTypeId=${busTypeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error("could not delete bus type");
        }
        return response.json();
    }
}

