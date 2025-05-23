import useAddRouteStore from './add-route-store'; 
import { BusStop } from '@/types/bus-stop'; // Changed from Waypoint
import { Vertex } from '@/types/vertex'; 
import { act } from '@testing-library/react'; 

jest.mock('@/app/services/mapbox-service', () => ({
  getRoutesMapbox: jest.fn(() => Promise.resolve({
    routes: [{
      weight: 100,
      geometry: {
        type: 'LineString',
        coordinates: [[1,1], [2,2]] // Mock coordinates
      }
    }]
  }))
}));

const getInitialStoreState = () => ({
  newRouteBusStops: [] as BusStop[], // Ensure this is typed as BusStop[]
  vertices: [] as Vertex[],
  waypointRoute: null,
  intermediateRoutes: [],
  editState: 'idle',
  newRouteTypeSelectionId: null,
});


describe('useAddRouteStore', () => {
  beforeEach(() => {
    act(() => {
      useAddRouteStore.setState(getInitialStoreState());
    });
    (require('@/app/services/mapbox-service').getRoutesMapbox as jest.Mock).mockClear();
  });

  describe('addBusStop', () => {
    it('should add a bus stop with a unique ID, correct location, and 1-based index', () => {
      const locationCoords: [number, number] = [10, 20]; // [longitude, latitude]
      act(() => {
        useAddRouteStore.getState().addBusStop(locationCoords);
      });
      const { newRouteBusStops } = useAddRouteStore.getState();
      expect(newRouteBusStops.length).toBe(1);
      expect(newRouteBusStops[0].id).toBeDefined();
      expect(newRouteBusStops[0].location).toEqual({ longitude: 10, latitude: 20 });
      expect(newRouteBusStops[0].index).toBe(1); // First stop should have index 1
      expect(newRouteBusStops[0].name).toBeUndefined(); // Or initial name if store assigns one
    });

    it('should correctly assign sequential indices to added bus stops', () => {
      act(() => {
        useAddRouteStore.getState().addBusStop([10, 20]);
        useAddRouteStore.getState().addBusStop([30, 40]);
      });
      const { newRouteBusStops } = useAddRouteStore.getState();
      expect(newRouteBusStops.length).toBe(2);
      expect(newRouteBusStops[0].index).toBe(1);
      expect(newRouteBusStops[1].index).toBe(2);
      expect(newRouteBusStops[0].id).not.toBe(newRouteBusStops[1].id);
    });

    it('should call getRoutesMapbox with correct coordinates when more than one bus stop is added', () => {
      const location1: [number, number] = [10, 20];
      const location2: [number, number] = [30, 40];
      act(() => {
        useAddRouteStore.getState().addBusStop(location1);
      });
      expect(require('@/app/services/mapbox-service').getRoutesMapbox).not.toHaveBeenCalled();
      
      act(() => {
        useAddRouteStore.getState().addBusStop(location2);
      });
      expect(require('@/app/services/mapbox-service').getRoutesMapbox).toHaveBeenCalledTimes(1);
      expect(require('@/app/services/mapbox-service').getRoutesMapbox).toHaveBeenCalledWith([
        { coordinates: [10, 20] }, // From first stop
        { coordinates: [30, 40] }  // From second stop
      ]);
    });
  });

  describe('updateBusStopName', () => {
    it('should update the name of the specified bus stop', () => {
      const initialStops: BusStop[] = [
        { id: '1', location: { longitude: 0, latitude: 0 }, name: 'Old Name 1', index: 1 },
        { id: '2', location: { longitude: 1, latitude: 1 }, name: 'Old Name 2', index: 2 },
      ];
      act(() => {
        useAddRouteStore.setState({ newRouteBusStops: initialStops });
      });
      act(() => {
        useAddRouteStore.getState().updateBusStopName('1', 'New Name 1');
      });
      const { newRouteBusStops } = useAddRouteStore.getState();
      expect(newRouteBusStops.find(s => s.id === '1')?.name).toBe('New Name 1');
      expect(newRouteBusStops.find(s => s.id === '2')?.name).toBe('Old Name 2');
    });

    it('should not change other bus stops when one is updated', () => {
        const initialStops: BusStop[] = [
            { id: '1', location: { longitude: 0, latitude: 0 }, name: 'Stop 1', index: 1 },
            { id: '2', location: { longitude: 1, latitude: 1 }, name: 'Stop 2', index: 2 },
            { id: '3', location: { longitude: 2, latitude: 2 }, name: 'Stop 3', index: 3 },
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
    
    it('should do nothing if the bus stop ID does not exist for name update', () => {
        const initialStops: BusStop[] = [
            { id: '1', location: { longitude: 0, latitude: 0 }, name: 'Stop 1', index: 1 },
        ];
        act(() => {
            useAddRouteStore.setState({ newRouteBusStops: initialStops });
        });
        act(() => {
            useAddRouteStore.getState().updateBusStopName('nonexistent-id', 'Attempted Name');
        });
        const { newRouteBusStops } = useAddRouteStore.getState();
        expect(newRouteBusStops).toEqual(initialStops);
    });
  });

  describe('deleteBusStop', () => {
    const mockInitialVertices: Vertex[] = [
        { id: 101, latitude: 0, longitude: 0, osm_id:0 }, 
        { id: 102, latitude: 1, longitude: 1, osm_id:0 }, 
        { id: 103, latitude: 2, longitude: 2, osm_id:0 }, 
    ];
    const mockInitialBusStops: BusStop[] = [
        { id: 's1', location: { longitude: 0, latitude: 0 }, name: 'Stop 1', index: 1 },
        { id: 's2', location: { longitude: 1, latitude: 1 }, name: 'Stop 2', index: 2 },
        { id: 's3', location: { longitude: 2, latitude: 2 }, name: 'Stop 3', index: 3 },
    ];

    it('should remove the bus stop, its vertex, and re-index remaining stops', async () => {
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
        
        const stop1 = newRouteBusStops.find(s => s.id === 's1');
        const stop3 = newRouteBusStops.find(s => s.id === 's3');
        expect(stop1).toBeDefined();
        expect(stop3).toBeDefined();
        expect(stop1?.index).toBe(1); // s1 is now the first stop, index 1
        expect(stop3?.index).toBe(2); // s3 is now the second stop, index 2

        expect(vertices[0].id).toBe(101); // Vertex for s1
        expect(vertices[1].id).toBe(103); // Vertex for s3
    });

    it('should clear and recalculate routes with correct coordinates and re-indexing', async () => {
        const mockMapboxAPI = require('@/app/services/mapbox-service').getRoutesMapbox as jest.Mock;
        // Specific mock response for this test if needed, or rely on global
        mockMapboxAPI.mockResolvedValue({ 
            routes: [{
                weight: 50,
                geometry: { type: 'LineString', coordinates: [[0,0], [2,2]] } // s1 to s3
            }]
        });

        act(() => {
            useAddRouteStore.setState({
                newRouteBusStops: [...mockInitialBusStops],
                vertices: [...mockInitialVertices],
                intermediateRoutes: [ 
                    { weight: 10, geometry: { type: 'LineString', coordinates: [[0,0],[1,1]]}}, // s1-s2
                    { weight: 20, geometry: { type: 'LineString', coordinates: [[1,1],[2,2]]}}  // s2-s3
                ],
                waypointRoute: { type: 'LineString', coordinates: [[0,0],[1,1],[2,2]] }
            });
        });
        
        await act(async () => {
            await useAddRouteStore.getState().deleteBusStop('s2'); 
        });

        const { newRouteBusStops, intermediateRoutes, waypointRoute } = useAddRouteStore.getState();
        
        expect(newRouteBusStops.length).toBe(2); 
        expect(newRouteBusStops[0].id).toBe('s1');
        expect(newRouteBusStops[0].index).toBe(1);
        expect(newRouteBusStops[1].id).toBe('s3');
        expect(newRouteBusStops[1].index).toBe(2);

        expect(mockMapboxAPI).toHaveBeenCalledTimes(1); 
        expect(mockMapboxAPI).toHaveBeenCalledWith([
            // Coordinates from remaining stops s1 and s3
            { coordinates: [mockInitialBusStops[0].location.longitude, mockInitialBusStops[0].location.latitude] }, 
            { coordinates: [mockInitialBusStops[2].location.longitude, mockInitialBusStops[2].location.latitude] }  
        ]);

        expect(intermediateRoutes.length).toBe(1);
        expect(intermediateRoutes[0].geometry.coordinates).toEqual([[0,0], [2,2]]); // s1 to s3
        
        expect(waypointRoute).toBeDefined();
        expect(waypointRoute.coordinates).toEqual([[0,0], [2,2]]); // s1 to s3
    });

    it('should not call getRoutesMapbox if less than 2 stops remain after deletion', async () => {
        const singleStopSetup: BusStop[] = [{ id: 's1', location: {longitude: 0, latitude: 0}, name: 'Stop 1', index: 1 }];
        const singleVertexSetup: Vertex[] = [{ id: 101, latitude: 0, longitude: 0, osm_id: 0 }];
        act(() => {
            useAddRouteStore.setState({ 
                newRouteBusStops: singleStopSetup, 
                vertices: singleVertexSetup 
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

    it('should correctly re-index when deleting the first stop from three', async () => {
        act(() => {
            useAddRouteStore.setState({ 
                newRouteBusStops: [...mockInitialBusStops], 
                vertices: [...mockInitialVertices] 
            });
        });
    
        await act(async () => {
            await useAddRouteStore.getState().deleteBusStop('s1'); // Delete the first stop
        });
    
        const { newRouteBusStops } = useAddRouteStore.getState();
        expect(newRouteBusStops.length).toBe(2);
        const stop2 = newRouteBusStops.find(s => s.id === 's2');
        const stop3 = newRouteBusStops.find(s => s.id === 's3');
    
        expect(stop2).toBeDefined();
        expect(stop3).toBeDefined();
        expect(stop2?.index).toBe(1); // s2 is now the first stop
        expect(stop3?.index).toBe(2); // s3 is now the second stop
    });    
  });
});
