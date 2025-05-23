// lib/mapRef.ts
import { Location } from '@/types/location';
import { Map } from 'mapbox-gl';

let mapInstance: Map | null = null;
let mapCoordinates: Location = { latitude: 24.8004, longitude: 67.0599 };
let mapZoom: { zoom: number } = { zoom: 13 };

export function getMapInstance(): Map | null {
    return mapInstance;
}

export function setMapInstance(map: Map): void {
    mapInstance = map;
}

export function clearMapInstance(): void {
    mapInstance = null;
}
export function getMapCoordinates() {
    return mapCoordinates;
}

export function setMapCoordinates(location: Location) {
    mapCoordinates = location;
}

export function setMapZoom(zoom: { zoom: number }) {
    mapZoom = zoom;
}

export function getMapZoom() {
    return mapZoom;
}