import useAddRouteStore from './add-route-store'; // Adjust path as necessary
import Waypoint from '@/types/waypoint'; // Adjust path as necessary
import { act } from '@testing-library/react'; // Or your project's testing utility for Zustand

// Mock getRoutesMapbox as it's called in addBusStop and involves external calls/promises
jest.mock('@/app/services/mapbox-service', () => ({
  getRoutesMapbox: jest.fn(() => Promise.resolve({
    routes: [{
      weight: 100,
      geometry: {
        type: 'LineString',
        coordinates: [[1,1], [2,2]]
      }
    }]
  }))
}));

// Helper to get the initial state, mimicking what might be in the store
// This is defined outside describe block if it's meant to be a static representation
// or inside beforeEach if it needs to be reset/re-evaluated, though for initial state, static is fine.
const getInitialStoreState = () => ({
  newRouteBusStops: [],
  vertices: [],
  waypointRoute: null,
  intermediateRoutes: [],
  editState: 'idle',
  newRouteTypeSelectionId: null,
  // Include other properties that are part of the store's initial state
  // For example, if these functions are part of the state (which is unusual for Zustand, actions are usually outside state):
  // addBusStop: expect.any(Function), // etc. - but typically actions are not part of resettable state directly.
});


describe('useAddRouteStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    act(() => {
      // If useAddRouteStore had a getInitialState method:
      // useAddRouteStore.setState(useAddRouteStore.getInitialState());
      // Otherwise, manually reset:
      useAddRouteStore.setState(getInitialStoreState());
    });
    // Clear any mock function calls
    (require('@/app/services/mapbox-service').getRoutesMapbox as jest.Mock).mockClear();
  });

  describe('addBusStop', () => {
    it('should add a bus stop with a unique ID if one is not provided', () => {
      const initialStop: Omit<Waypoint, 'id'> = { location: [10, 20], name: 'Stop A' }; // Added name for completeness
      act(() => {
        useAddRouteStore.getState().addBusStop(initialStop as Waypoint);
      });
      const { newRouteBusStops } = useAddRouteStore.getState();
      expect(newRouteBusStops.length).toBe(1);
      expect(newRouteBusStops[0].id).toBeDefined();
      expect(newRouteBusStops[0].location).toEqual([10, 20]);
      expect(newRouteBusStops[0].name).toBe('Stop A');
    });

    it('should keep the provided ID if one exists', () => {
      const initialStop: Waypoint = { id: 'custom-123', location: [10, 20], name: 'Stop B' };
      act(() => {
        useAddRouteStore.getState().addBusStop(initialStop);
      });
      const { newRouteBusStops } = useAddRouteStore.getState();
      expect(newRouteBusStops.length).toBe(1);
      expect(newRouteBusStops[0].id).toBe('custom-123');
    });

    it('should generate different IDs for multiple added stops without provided IDs', () => {
      const stop1: Omit<Waypoint, 'id'> = { location: [10, 20], name: 'Stop C' };
      const stop2: Omit<Waypoint, 'id'> = { location: [30, 40], name: 'Stop D' };
      act(() => {
        useAddRouteStore.getState().addBusStop(stop1 as Waypoint);
        useAddRouteStore.getState().addBusStop(stop2 as Waypoint);
      });
      const { newRouteBusStops } = useAddRouteStore.getState();
      expect(newRouteBusStops.length).toBe(2);
      expect(newRouteBusStops[0].id).toBeDefined();
      expect(newRouteBusStops[1].id).toBeDefined();
      expect(newRouteBusStops[0].id).not.toBe(newRouteBusStops[1].id);
    });

    it('should call getRoutesMapbox when more than one bus stop is added', () => {
        const stop1: Waypoint = { id: '1', location: [10, 20], name: 'Stop E' };
        const stop2: Waypoint = { id: '2', location: [30, 40], name: 'Stop F' };
        act(() => {
            useAddRouteStore.getState().addBusStop(stop1);
        });
        // Mapbox should not be called with only one stop
        expect(require('@/app/services/mapbox-service').getRoutesMapbox).not.toHaveBeenCalled();
        
        act(() => {
            useAddRouteStore.getState().addBusStop(stop2);
        });
        // Mapbox should be called after the second stop is added
        expect(require('@/app/services/mapbox-service').getRoutesMapbox).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateBusStopName', () => {
    it('should update the name of the specified bus stop', () => {
      const initialStops: Waypoint[] = [
        { id: '1', location: [0, 0], name: 'Old Name 1' },
        { id: '2', location: [1, 1], name: 'Old Name 2' },
      ];
      act(() => {
        // Pre-fill the store with some waypoints
        useAddRouteStore.setState({ newRouteBusStops: initialStops });
      });
      act(() => {
        useAddRouteStore.getState().updateBusStopName('1', 'New Name 1');
      });
      const { newRouteBusStops } = useAddRouteStore.getState();
      expect(newRouteBusStops.find(s => s.id === '1')?.name).toBe('New Name 1');
      expect(newRouteBusStops.find(s => s.id === '2')?.name).toBe('Old Name 2'); // Should remain unchanged
    });

    it('should not change other bus stops when one is updated', () => {
      const initialStops: Waypoint[] = [
        { id: '1', location: [0, 0], name: 'Stop 1' },
        { id: '2', location: [1, 1], name: 'Stop 2' },
        { id: '3', location: [2, 2], name: 'Stop 3' },
      ];
       act(() => {
        useAddRouteStore.setState({ newRouteBusStops: initialStops });
      });
      act(() => {
        useAddRouteStore.getState().updateBusStopName('2', 'Updated Stop 2');
      });
      const { newRouteBusStops } = useAddRouteStore.getState();
      expect(newRouteBusStops.find(s => s.id === '1')?.name).toBe('Stop 1');
      expect(newRouteBusStops.find(s => s.id === '3')?.name).toBe('Stop 3');
    });

    it('should do nothing if the bus stop ID does not exist', () => {
      const initialStops: Waypoint[] = [
        { id: '1', location: [0, 0], name: 'Stop 1' },
      ];
      act(() => {
        useAddRouteStore.setState({ newRouteBusStops: initialStops });
      });
      act(() => {
        useAddRouteStore.getState().updateBusStopName('nonexistent-id', 'Attempted Name');
      });
      const { newRouteBusStops } = useAddRouteStore.getState();
      expect(newRouteBusStops).toEqual(initialStops); // State should be unchanged
      expect(newRouteBusStops.find(s => s.id === '1')?.name).toBe('Stop 1');
    });
  });
  
});
