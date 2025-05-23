import useBusRouteStore from './bus-routes-store'; // Adjust path as necessary
import { BusRouteEdgeModel } from '@/data-models/bus-route-edge-model'; // Adjust path
import { act } from '@testing-library/react'; // Or 'react-test-renderer' if not using RTL

// Mock a basic fetch API
global.fetch = jest.fn();

const mockRoutes: BusRouteEdgeModel[] = [
  { route_id: 1, bus_type_id: 100, bus_type_description: 'Type A', edge_id: 1, source: 1, source_lat: 0, source_lon: 0, target: 2, target_lat: 0, target_lon: 0, cost: 1, reverse_cost: 1, route_description: 'Route 1', geom: { type: 'LineString', crs: { type: 'name', properties: { name: 'EPSG:4326' } }, coordinates: [[0,0],[0,1]] } },
  { route_id: 2, bus_type_id: 100, bus_type_description: 'Type A', edge_id: 2, source: 2, source_lat: 0, source_lon: 0, target: 3, target_lat: 0, target_lon: 0, cost: 1, reverse_cost: 1, route_description: 'Route 2', geom: { type: 'LineString', crs: { type: 'name', properties: { name: 'EPSG:4326' } }, coordinates: [[0,0],[0,1]] } },
  { route_id: 3, bus_type_id: 200, bus_type_description: 'Type B', edge_id: 3, source: 3, source_lat: 0, source_lon: 0, target: 4, target_lat: 0, target_lon: 0, cost: 1, reverse_cost: 1, route_description: 'Route 3', geom: { type: 'LineString', crs: { type: 'name', properties: { name: 'EPSG:4326' } }, coordinates: [[0,0],[0,1]] } },
];

describe('useBusRouteStore - Group Visibility', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useBusRouteStore.setState({
      busRoutes: [],
      busRoutesByID: {},
      busStopsByID: {},
      busRoutesVisibility: {},
      busRouteGroupVisibility: {},
      loading: false,
      error: null,
      // Ensure all relevant state properties are reset
      routeColors: [], // Assuming ROUTE_COLORS is part of the store state based on previous files
    });
    (fetch as jest.Mock).mockClear();
  });

  // Helper to simulate fetch and store initialization
  const initializeStoreWithMockData = async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ routes: mockRoutes }),
    });
    await act(async () => {
      await useBusRouteStore.getState().fetchRoutes();
    });
  };

  test('should initialize busRouteGroupVisibility correctly after fetchRoutes', async () => {
    await initializeStoreWithMockData();
    const { busRouteGroupVisibility } = useBusRouteStore.getState();
    expect(busRouteGroupVisibility[100]).toBe(true);
    expect(busRouteGroupVisibility[200]).toBe(true);
  });

  test('toggleGroupVisibility should toggle group visibility state', async () => {
    await initializeStoreWithMockData();
    act(() => {
      useBusRouteStore.getState().toggleGroupVisibility(100);
    });
    const { busRouteGroupVisibility } = useBusRouteStore.getState();
    expect(busRouteGroupVisibility[100]).toBe(false); // Toggled to false
    expect(busRouteGroupVisibility[200]).toBe(true);  // Unchanged
  });

  test('toggleGroupVisibility should update visibility of routes within the group', async () => {
    await initializeStoreWithMockData();
    // Initially, all routes are visible
    expect(useBusRouteStore.getState().busRoutesVisibility[1]).toBe(true);
    expect(useBusRouteStore.getState().busRoutesVisibility[2]).toBe(true);
    expect(useBusRouteStore.getState().busRoutesVisibility[3]).toBe(true);

    // Toggle group 100 to hidden
    act(() => {
      useBusRouteStore.getState().toggleGroupVisibility(100);
    });
    
    const { busRoutesVisibility, busRouteGroupVisibility } = useBusRouteStore.getState();
    expect(busRouteGroupVisibility[100]).toBe(false);
    expect(busRoutesVisibility[1]).toBe(false); // Route 1 in group 100 should be hidden
    expect(busRoutesVisibility[2]).toBe(false); // Route 2 in group 100 should be hidden
    expect(busRoutesVisibility[3]).toBe(true);  // Route 3 in group 200 should remain visible

    // Toggle group 100 back to visible
    act(() => {
      useBusRouteStore.getState().toggleGroupVisibility(100);
    });

    const finalState = useBusRouteStore.getState();
    expect(finalState.busRouteGroupVisibility[100]).toBe(true);
    expect(finalState.busRoutesVisibility[1]).toBe(true); // Route 1 should be visible again
    expect(finalState.busRoutesVisibility[2]).toBe(true); // Route 2 should be visible again
    expect(finalState.busRoutesVisibility[3]).toBe(true); // Route 3 remains visible
  });
  
  test('toggleGroupVisibility should not affect routes in other groups', async () => {
    await initializeStoreWithMockData();
    
    act(() => {
      useBusRouteStore.getState().toggleGroupVisibility(100); // Hide group 100
    });

    const { busRoutesVisibility } = useBusRouteStore.getState();
    expect(busRoutesVisibility[3]).toBe(true); // Route 3 (in group 200) should still be visible

    act(() => {
      useBusRouteStore.getState().toggleGroupVisibility(200); // Hide group 200
    });
    const finalState = useBusRouteStore.getState();
    expect(finalState.busRoutesVisibility[1]).toBe(false); // Route 1 (in group 100) should still be hidden
    expect(finalState.busRoutesVisibility[2]).toBe(false); // Route 2 (in group 100) should still be hidden
    expect(finalState.busRoutesVisibility[3]).toBe(false); // Route 3 (in group 200) should now be hidden
  });

});
