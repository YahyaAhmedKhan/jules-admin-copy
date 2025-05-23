import { Vertex } from "@/types/vertex";

export class OSMGraphService {
    async getNearestNode(lat: number, lon: number): Promise<Vertex> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/nearest?lat=${lat}&lon=${lon}`;
        // const url = `https://desired-albacore-commonly.ngrok-free.app/nearest?lat=${lat}&lon=${lon}`;

        // const response = await fetch(url);
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors",
        });
        const data: Vertex = await response.json();
        return data;
    }

    // findNearestNode(lat: number, lon: number, data: VertexData[]): VertexData | null {
    //     if (data.length === 0) return null;

    //     let nearest = data[0];
    //     let minDiff = Math.sqrt(
    //         Math.pow(lat - nearest.latitude, 2) + Math.pow(lon - nearest.longitude, 2)
    //     );

    //     for (let i = 1; i < data.length; i++) {
    //         const diff = Math.sqrt(
    //             Math.pow(lat - data[i].latitude, 2) + Math.pow(lon - data[i].longitude, 2)
    //         );

    //         if (diff < minDiff) {
    //             minDiff = diff;
    //             nearest = data[i];
    //         }
    //     }

    //     return nearest;
    // }
}

export interface VertexData {
    id: number;
    latitude: number;
    longitude: number;
    data: {
        street_count: number;
    };
}
