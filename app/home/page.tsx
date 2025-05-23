'use client';
import Navbar from "@/components/navbar";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';
import CoreMapView from '@/components/core-map-view';
import { Button } from "@/components/ui/button";
import useAddRouteStore from "@/stores/add-route-store";
import { CheckCircle, Sidebar } from "lucide-react";
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
import { table } from "console";
import { BusRoutesTable } from "@/components/bus-routes-table";
import { TablesView } from "@/components/tables-view";

export default function Home() {
  const addRouteStore = useAddRouteStore()
  const busRoutesStore = useBusRouteStore()
  const busTypesStore = useBusTypeStore()
  const sideBarStore = useSidebarStore()

  const { setActiveMenu, activeMenu } = sideBarStore
  const { intermediateRoutes, clearAll, vertices, newRouteTypeSelectionId, setNewRouteTypeSelection, clearNewRouteTypeSelection } = addRouteStore
  const { fetchRoutes } = busRoutesStore
  const { getBusRouteTypes, busRouteTypes } = busTypesStore
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false);

  getBusRouteTypes()


  const Icons = {
    spinner: Loader2,
  };


  const handleAddRoute = async () => {
    try {
      // throw new Error("Test Error")


      const routeService = new RouteService();

      const weights = intermediateRoutes.map((data) => data.weight / 10);
      const geometry = intermediateRoutes.map((data) => lineStringToWKT(data.geometry));

      if (!newRouteTypeSelectionId) {
        throw new Error("Bus Route Type not selected");
      }

      const response = await routeService.addNewBusRoute(
        vertices,
        weights,
        geometry,
        "Test Route for Bilal",
        newRouteTypeSelectionId
      );

      console.log(response);
      console.log("Route added successfully");
      fetchRoutes()
      clearAll();
      setActiveMenu("home");

      toast({
        title: "Route Added Successfully!",
        description: `New route belonging to ${newRouteTypeSelectionId} has been registered.`,
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
                  setNewRouteTypeSelection(Number(value));
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
                    clearNewRouteTypeSelection();
                  }}>
                    Cancel
                  </Button>
                </AlertDialogCancel>
                {/* <AlertDialogAction onClick={handleAddRoute} */}
                <AlertDialogAction asChild>
                  <Button
                    onClick={
                      async () => {
                        if (!newRouteTypeSelectionId) {
                          toast({
                            title: "Select a Bus Route Type!",
                            description: `You must select the Bus Route Type the new route should belong to.`,
                          });
                          return;
                        }

                        setIsLoading(true);
                        await new Promise(resolve => setTimeout(resolve, 3000));
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

      {/* {CoreMap(busRoutes, getRouteColor, busRoutesVisibility)} */}
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