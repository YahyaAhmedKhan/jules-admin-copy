import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-all-bus-routes`);
        if (!response.ok) throw new Error('Failed to fetch bus routes');

        const data = await response.json();

        // Optional: simulate delay
        // await new Promise((resolve) => setTimeout(resolve, 2000));

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching bus routes' }, { status: 500 });
    }
}