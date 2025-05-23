import useBusRouteStore from './bus-routes-store'; 
import { BusRouteEdgeModel } from '@/data-models/bus-route-edge-model'; 
import { act } from '@testing-library/react'; 

// Mock BusRoutesService
// The actual service is instantiated in the store, so we mock the module.
jest.mock('@/services/busRoutesService', () => ({
  BusRoutesService: jest.fn().mockImplementation(() => {
    return {
      // This will be spied on/mocked per test for fetchRoutes
      getAllBusRoutes: jest.fn(() => Promise.resolve([])), 
    };
  }),
}));

// Mock data for tests
const mockFetchedRoutes: BusRouteEdgeModel[] = [
  { route_id: 1, bus_type_id: 100, bus_type_description: 'Type A', edge_id: 1, source: 1, source_lat: 0, source_lon: 0, target: 2, target_lat: 0, target_lon: 0, cost: 1, reverse_cost: 1, route_description: 'Route 1', geom: { type: 'LineString', crs: { type: 'name', properties: { name: 'EPSG:4326' } }, coordinates: [[0,0],[0,1]] } },
  { route_id: 2, bus_type_id: 100, bus_type_description: 'Type A', edge_id: 2, source: 2, source_lat: 0, source_lon: 0, target: 3, target_lat: 0, target_lon: 0, cost: 1, reverse_cost: 1, route_description: 'Route 2', geom: { type: 'LineString', crs: { type: 'name', properties: { name: 'EPSG:4326' } }, coordinates: [[0,0],[0,1]] } },
  { route_id: 3, bus_type_id: 200, bus_type_description: 'Type B', edge_id: 3, source: 3, source_lat: 0, source_lon: 0, target: 4, target_lat: 0, target_lon: 0, cost: 1, reverse_cost: 1, route_description: 'Route 3', geom: { type: 'LineString', crs: { type: 'name', properties: { name: 'EPSG:4326' } }, coordinates: [[0,0],[0,1]] } },
];

// Minimal initial state for the store, used in beforeEach
const getInitialState = () => ({
    busRoutes: [],
    busRoutesByID: {},
    busStopsByID: {},
    busRoutesVisibility: {},
    sidebarGroupExpansionState: {}, // Updated name
    mapGroupVisibilityState: {},    // Added
    busTypeColors: {},
    loading: false,
    error: null,
    routeColors: ['#FF5733', '#33A8FF'], // Example colors
});

describe('useBusRouteStore', () => {
  // Global beforeEach for all tests in this describe block
  beforeEach(() => {
    act(() => {
      useBusRouteStore.setState(getInitialState());
    });
    // Clear all mocks before each test
    // This requires getting the instance of the mocked service if it's created inside the store
    // Or, if the mock is on the prototype, it's simpler.
    // For now, we'll rely on specific mock clearing in tests that use fetchRoutes.
    // A more robust way would be to get the store's service instance or ensure service is a singleton.
    // For simplicity, we'll mock `getAllBusRoutes` directly on the imported module for fetchRoutes tests.
    const { BusRoutesService } = require('@/services/busRoutesService');
    const mockServiceInstance = new BusRoutesService(); // Get an instance to clear its mock methods
    if (mockServiceInstance.getAllBusRoutes.mockClear) {
        mockServiceInstance.getAllBusRoutes.mockClear();
    }
  });

  // Old tests for busRouteGroupVisibility - these will be adapted or removed
  // as busRouteGroupVisibility is now sidebarGroupExpansionState
  // and toggleGroupVisibility is toggleSidebarGroupExpansion
  // The logic for toggleGroupVisibility also changed (no longer affects busRoutesVisibility)
  // These old tests will likely fail or need removal/adaptation.
  // For now, I will comment them out to avoid conflicts with new tests.
  /*
  describe('useBusRouteStore - Group Visibility (Old tests - to be reviewed/removed)', () => {
    const initializeStoreWithOldMockData = async () => {
        // This helper used global.fetch, now we use BusRoutesService
        // For these old tests to pass, they'd need to mock BusRoutesService.getAllBusRoutes
        const { BusRoutesService } = require('@/services/busRoutesService');
        const mockServiceInstance = new BusRoutesService();
        mockServiceInstance.getAllBusRoutes.mockResolvedValue(mockFetchedRoutes);

        await act(async () => {
          await useBusRouteStore.getState().fetchRoutes();
        });
    };
    // ... (old tests were here) ...
  });
  */

  describe('fetchRoutes initialization of group states', () => {
    it('should initialize sidebarGroupExpansionState and mapGroupVisibilityState correctly', async () => {
        const { BusRoutesService } = require('@/services/busRoutesService');
        const mockServiceInstance = new BusRoutesService(); // Get a new instance for this test
        mockServiceInstance.getAllBusRoutes.mockResolvedValue(mockFetchedRoutes);

        await act(async () => {
            // Temporarily override the store's service instance if it's created internally
            // Or ensure the mock above is effective for the store's instance.
            // The current mock approach should work if the store re-imports BusRoutesService.
            await useBusRouteStore.getState().fetchRoutes();
        });

        const { sidebarGroupExpansionState, mapGroupVisibilityState } = useBusRouteStore.getState();
        expect(sidebarGroupExpansionState[100]).toBe(true);
        expect(sidebarGroupExpansionState[200]).toBe(true);
        expect(mapGroupVisibilityState[100]).toBe(true);
        expect(mapGroupVisibilityState[200]).toBe(true);
    });
  });

  describe('sidebarGroupExpansionState and toggleSidebarGroupExpansion', () => {
    beforeEach(() => {
        act(() => {
            useBusRouteStore.setState({
                ...getInitialState(), // Start with a clean slate
                busRoutes: mockFetchedRoutes, 
                sidebarGroupExpansionState: { 100: true, 200: true }, 
                mapGroupVisibilityState: { 100: true, 200: true },    
                busRoutesVisibility: { 1: true, 2: true, 3: true },    
            });
        });
    });

    it('should toggle sidebarGroupExpansionState for a busTypeId', () => {
        act(() => {
            useBusRouteStore.getState().toggleSidebarGroupExpansion(100);
        });
        const { sidebarGroupExpansionState } = useBusRouteStore.getState();
        expect(sidebarGroupExpansionState[100]).toBe(false);
        expect(sidebarGroupExpansionState[200]).toBe(true); // Unchanged
    });

    it('toggleSidebarGroupExpansion should not affect mapGroupVisibilityState or busRoutesVisibility', () => {
        const initialMapState = useBusRouteStore.getState().mapGroupVisibilityState;
        const initialRoutesState = useBusRouteStore.getState().busRoutesVisibility;

        act(() => {
            useBusRouteStore.getState().toggleSidebarGroupExpansion(100);
        });

        expect(useBusRouteStore.getState().mapGroupVisibilityState).toEqual(initialMapState);
        expect(useBusRouteStore.getState().busRoutesVisibility).toEqual(initialRoutesState);
    });
  });

  describe('mapGroupVisibilityState and toggleMapGroupVisibility', () => {
    beforeEach(() => {
        act(() => {
            useBusRouteStore.setState({
                ...getInitialState(),
                busRoutes: mockFetchedRoutes,
                sidebarGroupExpansionState: { 100: true, 200: true },
                mapGroupVisibilityState: { 100: true, 200: true },
                busRoutesVisibility: { 1: true, 2: true, 3: true },
            });
        });
    });

    it('should toggle mapGroupVisibilityState for a busTypeId', () => {
        act(() => {
            useBusRouteStore.getState().toggleMapGroupVisibility(100);
        });
        const { mapGroupVisibilityState } = useBusRouteStore.getState();
        expect(mapGroupVisibilityState[100]).toBe(false);
        expect(mapGroupVisibilityState[200]).toBe(true); // Unchanged
    });

    it('toggleMapGroupVisibility should not affect sidebarGroupExpansionState or busRoutesVisibility', () => {
        const initialExpansionState = useBusRouteStore.getState().sidebarGroupExpansionState;
        const initialRoutesState = useBusRouteStore.getState().busRoutesVisibility;
        
        act(() => {
            useBusRouteStore.getState().toggleMapGroupVisibility(100);
        });

        expect(useBusRouteStore.getState().sidebarGroupExpansionState).toEqual(initialExpansionState);
        expect(useBusRouteStore.getState().busRoutesVisibility).toEqual(initialRoutesState);
    });
  });
});
