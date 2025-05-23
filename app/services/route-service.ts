import { Vertex } from "@/types/vertex";

export class RouteService {


    async addNewBusRoute(vertices: Vertex[], weights: number[], geometry: any[], description: string, busTypeId: number) {

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

    deleteBusRoute = async (routeId: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/delete-bus-route?routeId=${routeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                throw new Error("could not delete bus route");
            }

            return response.json();
        }
        catch (error) {
            console.error("Error deleting bus route:", error);
            throw error; // Rethrow the error to be handled by the caller
        }
    }

}

