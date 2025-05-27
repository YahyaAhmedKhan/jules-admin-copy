'use client';
import Navbar from "@/components/navbar";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';
import CoreMapView from '@/components/core-map-view';
import { Button } from "@/components/ui/button";
import useAddRouteStore from "@/stores/add-route-store";
import { CheckCircle } from "lucide-react";
import { RouteService } from "../services/route-service";
import useBusRouteStore from "@/stores/bus-routes-store";
import { AlertDialog, AlertDialogHeader, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogFooter, AlertDialogTrigger, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { BusRouteTypeModel } from "@/types/bus-route-type";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useBusTypeStore } from "@/stores/bus-types-store";
import useSidebarStore from "@/stores/sidebar-store";
import { TablesView } from "@/components/tables-view";

export default function Home() {
  const addRouteStore = useAddRouteStore();
  const busRoutesStore = useBusRouteStore();
  const busTypesStore = useBusTypeStore();
  const sideBarStore = useSidebarStore();

  const { setActiveMenu, activeMenu } = sideBarStore;
  // Destructure clearAll from addRouteStore here, as it's used in handleAddRoute
  const { intermediateRoutes, clearAll, setNewRouteTypeSelection, clearNewRouteTypeSelection } = addRouteStore; 
  const { fetchRoutes } = busRoutesStore;
  const { getBusRouteTypes, busRouteTypes } = busTypesStore;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  getBusRouteTypes();


  const Icons = {
    spinner: Loader2,
  };


  const handleAddRoute = async () => {
    try {
      // Retrieve all necessary state directly from the store for this specific transaction
      const { 
        newRouteBusStops, // This is BusStop[]
        vertices: currentVertices, 
        newRouteTypeSelectionId: currentNewRouteTypeSelectionId,
        intermediateRoutes: currentIntermediateRoutes // Sourced from store for API call
      } = useAddRouteStore.getState();

      // Updated console.log message
      console.log("Collected Bus Stops for New Route (BusStop format):", JSON.stringify(newRouteBusStops, null, 2));
      
      const routeService = new RouteService();
      
      // Use currentIntermediateRoutes from the store for weights and geometry
      const weights = currentIntermediateRoutes.map((data) => data.weight / 10); 
      const geometry = currentIntermediateRoutes.map((data) => lineStringToWKT(data.geometry));

      if (!currentNewRouteTypeSelectionId) { 
        throw new Error("Bus Route Type not selected");
      }

      // Log what's being sent to the API for easier debugging
      console.log("Data being sent to addNewBusRoute API:");
      console.log("Vertices:", JSON.stringify(currentVertices, null, 2));
      console.log("Weights:", JSON.stringify(weights, null, 2));
      console.log("Geometry (WKT):", JSON.stringify(geometry, null, 2));
      console.log("Route Type ID:", currentNewRouteTypeSelectionId);

      const response = await routeService.addNewBusRoute(
        currentVertices, // Changed to use variable from store
        weights,
        geometry,
        "Test Route for Bilal", // This description might need to be dynamic in the future
        currentNewRouteTypeSelectionId // Changed to use variable from store
      );

      console.log("API Response:", response);
      console.log("Route added successfully");
      
      // Existing cleanup and UI updates
      fetchRoutes(); 
      clearAll();    // This is from addRouteStore, already destructured above
      setActiveMenu("home"); 

      toast({
        title: "Route Added Successfully!",
        description: `New route belonging to type ${currentNewRouteTypeSelectionId} has been registered.`,
      });

    } catch (error) {
      console.error("Failed to add route:", error);

      toast({
        title: "Error adding new Bus Route",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };


  const mapView = <div className="flex-grow w-full h-full bg-gray-200 map-area">
    <div className="absolute inset-0">
      <CoreMapView />
      {activeMenu.addRoute && intermediateRoutes.length > 0 &&
        <div className="absolute bottom-6 right-6 z-10">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button onClick={() => { }} variant="default" className="px-8 py-6 font-bold flex items-center gap-2">

                {isLoading ? <div className="flex gap-3 items-center">
                  <>Adding new route...</>
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                </div> :
                  <div className="flex gap-2 items-center">
                    <CheckCircle />
                    Confirm New Route

                  </div>}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Which Bus Route Type is this for?</AlertDialogTitle>
                <AlertDialogDescription>
                  Choose the Bus Route Type the new route should belong to from the dropdown below.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Select
                onValueChange={(value) => {
                  setNewRouteTypeSelection(Number(value)); // from addRouteStore
                  console.log('value', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Bus Route Type" />
                </SelectTrigger>
                <SelectContent>
                  {busRouteTypes ?
                    busRouteTypeSelectOptions(busRouteTypes) :
                    "Loading"}

                </SelectContent>
              </Select>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="outline" onClick={() => {
                    clearNewRouteTypeSelection(); // from addRouteStore
                  }}>
                    Cancel
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    onClick={
                      async () => {
                        // Get newRouteTypeSelectionId directly from store for the check
                        if (!useAddRouteStore.getState().newRouteTypeSelectionId) { 
                          toast({
                            title: "Select a Bus Route Type!",
                            description: `You must select the Bus Route Type the new route should belong to.`,
                          });
                          return;
                        }

                        setIsLoading(true);
                        // Consider if a shorter delay is acceptable for UX, or keep as is.
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Shortened delay for testing
                        await handleAddRoute();
                        setIsLoading(false);

                      }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Continue"}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>}

    </div>
  </div>;
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="relative flex flex-1 overflow-hidden admin-home-body">
          <AdminSidebar />


          {useSidebarStore().activeMenu.busRouteTypes ? <TablesView /> : mapView}        </div>
      </div>
    </SidebarProvider >
  );
}



const busRouteTypeSelectOptions = (busTypes: BusRouteTypeModel[]) => {

  return busTypes.map((routeType: BusRouteTypeModel, index: number) =>
    <SelectItem key={index} value={String(routeType.id)}>
      {routeType.description}
    </SelectItem>)
}


function lineStringToWKT(geometry: { type: string; coordinates: number[][] }) {
  if (geometry.type !== "LineString") throw new Error("Only LineString supported");

  const coordStr = geometry.coordinates
    .map(coord => coord.join(" ")) // lng lat -> "lng lat"
    .join(", ");                   // separate pairs by comma

  return `LINESTRING(${coordStr})`;
}