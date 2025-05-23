import useAddRouteStore from './add-route-store'; // Adjust path as necessary
import Waypoint from '@/types/waypoint'; // Adjust path as necessary
import { Vertex } from '@/types/vertex'; // Added Vertex import
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

  describe('deleteBusStop', () => {
    const mockInitialVertices: Vertex[] = [
        { id: 101, latitude: 0, longitude: 0,osm_id:0 }, // Corresponds to stop 's1'
        { id: 102, latitude: 1, longitude: 1 ,osm_id:0}, // Corresponds to stop 's2'
        { id: 103, latitude: 2, longitude: 2 ,osm_id:0}, // Corresponds to stop 's3'
    ];
    const mockInitialBusStops: Waypoint[] = [
        { id: 's1', location: [0, 0], name: 'Stop 1' },
        { id: 's2', location: [1, 1], name: 'Stop 2' },
        { id: 's3', location: [2, 2], name: 'Stop 3' },
    ];

    // Note: The top-level beforeEach in 'useAddRouteStore' already resets 
    // newRouteBusStops and vertices, and clears mocks.
    // This specific beforeEach for 'deleteBusStop' might be redundant if the general one is sufficient.
    // However, if more specific setup for deleteBusStop tests is needed later, it can be useful.
    // For now, we rely on the main beforeEach.
    // If these tests needed specific initial intermediateRoutes or waypointRoute, this beforeEach would set them.
    /*
    beforeEach(() => {
        act(() => {
            useAddRouteStore.setState({
                newRouteBusStops: [], // Or mockInitialBusStops if a test starts with data
                vertices: [],       // Or mockInitialVertices
                waypointRoute: null,
                intermediateRoutes: [],
                // editState and newRouteTypeSelectionId are already reset by the main beforeEach
            });
        });
        (require('@/app/services/mapbox-service').getRoutesMapbox as jest.Mock).mockClear();
    });
    */

    it('should remove the bus stop and its corresponding vertex', async () => {
        act(() => {
            useAddRouteStore.setState({ 
                newRouteBusStops: [...mockInitialBusStops], 
                vertices: [...mockInitialVertices] 
            });
        });

        await act(async () => {
            await useAddRouteStore.getState().deleteBusStop('s2');
        });

        const { newRouteBusStops, vertices } = useAddRouteStore.getState();
        expect(newRouteBusStops.length).toBe(2);
        expect(newRouteBusStops.find(s => s.id === 's2')).toBeUndefined();
        expect(vertices.length).toBe(2);
        expect(vertices.find(v => v.id === 102)).toBeUndefined(); 
        expect(vertices[0].id).toBe(101);
        expect(vertices[1].id).toBe(103);
    });

    it('should clear and recalculate intermediateRoutes and waypointRoute', async () => {
        const mockMapboxAPI = require('@/app/services/mapbox-service').getRoutesMapbox as jest.Mock;
        mockMapboxAPI.mockResolvedValue({ 
            routes: [{
                weight: 50,
                geometry: { type: 'LineString', coordinates: [[0,0], [2,2]] }
            }]
        });

        act(() => {
            useAddRouteStore.setState({
                newRouteBusStops: [...mockInitialBusStops],
                vertices: [...mockInitialVertices],
                intermediateRoutes: [ { weight: 10, geometry: { type: 'LineString', coordinates: [[0,0],[1,1]]}}, { weight: 20, geometry: { type: 'LineString', coordinates: [[1,1],[2,2]]}} ],
                waypointRoute: { type: 'LineString', coordinates: [[0,0],[1,1],[2,2]] }
            });
        });
        
        await act(async () => {
            await useAddRouteStore.getState().deleteBusStop('s2'); 
        });

        const { newRouteBusStops, intermediateRoutes, waypointRoute } = useAddRouteStore.getState();
        
        expect(newRouteBusStops.length).toBe(2); 
        expect(mockMapboxAPI).toHaveBeenCalledTimes(1); 
        expect(mockMapboxAPI).toHaveBeenCalledWith([
            { coordinates: [0,0] }, 
            { coordinates: [2,2] }  
        ]);

        expect(intermediateRoutes.length).toBe(1);
        expect(intermediateRoutes[0].geometry.coordinates).toEqual([[0,0], [2,2]]);
        
        expect(waypointRoute).toBeDefined();
        expect(waypointRoute.coordinates).toEqual([[0,0], [2,2]]);
    });

    it('should not call getRoutesMapbox if less than 2 stops remain', async () => {
        const singleStop: Waypoint[] = [{ id: 's1', location: [0,0], name: 'Stop 1' }];
        const singleVertex: Vertex[] = [{ id: 101, latitude: 0, longitude: 0, osm_id: 0 }];
        act(() => {
            useAddRouteStore.setState({ 
                newRouteBusStops: singleStop, 
                vertices: singleVertex 
            });
        });
        const mockMapboxAPI = require('@/app/services/mapbox-service').getRoutesMapbox as jest.Mock;

        await act(async () => {
            await useAddRouteStore.getState().deleteBusStop('s1');
        });
        
        const { newRouteBusStops, intermediateRoutes, waypointRoute } = useAddRouteStore.getState();
        expect(newRouteBusStops.length).toBe(0);
        expect(mockMapboxAPI).not.toHaveBeenCalled();
        expect(intermediateRoutes.length).toBe(0);
        expect(waypointRoute).toBeNull();
    });

    it('should handle deletion when only two stops exist, resulting in one stop', async () => {
        const twoStops: Waypoint[] = [
            { id: 's1', location: [0,0], name: 'Stop 1'},
            { id: 's2', location: [1,1], name: 'Stop 2'}
        ];
        const twoVertices: Vertex[] = [
            { id: 101, latitude: 0, longitude: 0, osm_id: 0 },
            { id: 102, latitude: 1, longitude: 1, osm_id: 0 }
        ];
         act(() => {
            useAddRouteStore.setState({ 
                newRouteBusStops: twoStops, 
                vertices: twoVertices,
                intermediateRoutes: [{ weight: 10, geometry: { type: 'LineString', coordinates: [[0,0],[1,1]]}}],
                waypointRoute: { type: 'LineString', coordinates: [[0,0],[1,1]]}
            });
        });
        const mockMapboxAPI = require('@/app/services/mapbox-service').getRoutesMapbox as jest.Mock;

        await act(async () => {
            await useAddRouteStore.getState().deleteBusStop('s2');
        });

        const { newRouteBusStops, intermediateRoutes, waypointRoute, vertices } = useAddRouteStore.getState();
        expect(newRouteBusStops.length).toBe(1);
        expect(newRouteBusStops[0].id).toBe('s1');
        expect(vertices.length).toBe(1);
        expect(vertices[0].id).toBe(101);
        expect(mockMapboxAPI).not.toHaveBeenCalled();
        expect(intermediateRoutes.length).toBe(0);
        expect(waypointRoute).toBeNull();
    });
  });
  
});
