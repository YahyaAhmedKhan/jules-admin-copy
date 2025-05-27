import { dummyBuses } from '@/dummydata/dummy-buses';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // const response = await fetch('https://your-api.com/bus-routes'); // Replace with actual API
        // if (!response.ok) throw new Error('Failed to fetch bus routes');
        // const data = await response.json();
        const data = dummyBuses;
        // add 2 secs wait time
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return NextResponse.json(data, { status: 200 });
    } catch (_error) {
        return NextResponse.json({ error: 'Error fetching bus routes' }, { status: 500 });
    }
}
