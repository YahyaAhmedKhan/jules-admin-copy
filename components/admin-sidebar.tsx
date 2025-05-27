"use client"

// Updated imports: Added Eye, EyeOff.
import { Bus, ChevronDown, Eye, EyeOff, Home, MapPlus, Pencil, Route, Search, Settings, Table2, Trash, Trash2 } from "lucide-react" 
import { motion } from "framer-motion";
import * as React from "react"; 

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem, 
} from "@/components/ui/sidebar"
import { JSX } from "react/jsx-runtime"
import useBusRouteStore from "@/stores/bus-routes-store"
import useSidebarStore from "@/stores/sidebar-store"

import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible" 
import useAddRouteStore from "@/stores/add-route-store"
import { useBusStore } from "@/stores/bus-store" 
import { AdminMenuKey } from "@/enums/admin-menu-key";
import { BusRouteEdgeModel } from '@/data-models/bus-route-edge-model'; 
import { BusStop } from '@/types/bus-stop'; 

// Imports for AddRouteItems
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface MenuItem {
    title: string;
    key: AdminMenuKey
    url: string;
    icon: React.ElementType;

}
// Menu items.
const sidebarMenuItems: MenuItem[] = [
    {
        title: "Home",
        key: AdminMenuKey.Home,
        url: "#",
        icon: Home,
    },
    {
        title: "Add Route",
        key: AdminMenuKey.AddRoute,
        url: "#",
        icon: MapPlus,
    },
    {
        title: "Bus Routes & Types",
        key: AdminMenuKey.BusRouteTypes,
        url: "#",
        icon: Table2,
    },
    {
        title: "Search",
        key: AdminMenuKey.Search,
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        key: AdminMenuKey.Settings,
        url: "#",
        icon: Settings,
    },
]

const menuSubitems: { [key: string]: () => JSX.Element } = {
    home: HomeItems,
    addRoute: AddRouteItems,

}

function HomeItems() {
    const busRouteStore = useBusRouteStore();
    const {
        busRoutesByID, 
        busRoutesVisibility,
        toggleRouteVisibility,
        // Updated state and actions:
        sidebarGroupExpansionState, // Renamed from busRouteGroupVisibility
        mapGroupVisibilityState,    // New state for map visibility
        toggleSidebarGroupExpansion, // Renamed from toggleGroupVisibility
        toggleMapGroupVisibility,   // New action
        loading: routesLoading, 
    } = busRouteStore;

    const busStore = useBusStore();
    const { buses, busVisibility, toggleBusVisibility, loading: busesLoading } = busStore; 

    const groupedRoutesByBusType = React.useMemo(() => {
        const groups: Map<number, { description: string, route_ids: Set<number> }> = new Map();
        if (busRoutesByID && Object.keys(busRoutesByID).length > 0) {
            for (const routeIdStr in busRoutesByID) {
                const routeId = parseInt(routeIdStr, 10);
                const routeEdges = busRoutesByID[routeId];
                if (routeEdges && routeEdges.length > 0) {
                    const firstEdge = routeEdges[0]; 
                    const { bus_type_id, bus_type_description } = firstEdge;

                    if (!groups.has(bus_type_id)) {
                        groups.set(bus_type_id, {
                            description: bus_type_description,
                            route_ids: new Set(),
                        });
                    }
                    groups.get(bus_type_id)!.route_ids.add(routeId);
                }
            }
        }
        return groups;
    }, [busRoutesByID]);

    const isLoadingOrEmptyRoutes = routesLoading || Object.keys(busRoutesByID || {}).length === 0;

    return (
        <SidebarMenuSub className="peer-data-[active=false]/menu-button:hidden">
            {/* Bus Routes Section - Grouped */}
            <Collapsible className="group/collapsible" defaultOpen={true}>
                <SidebarMenuItem> 
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton> 
                            <Route />
                            <span>Bus Routes</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <SidebarMenuSub>
                                {isLoadingOrEmptyRoutes && !routesLoading ? ( 
                                    <SidebarMenuSubItem>
                                      <span className="p-2 text-xs text-gray-500">No bus routes available.</span>
                                    </SidebarMenuSubItem>
                                ) : routesLoading ? (
                                     Array.from({ length: 3 }).map((_, index) => (
                                        <SidebarMenuSkeleton key={`loading-group-${index}`}>Loading Groups...</SidebarMenuSkeleton>
                                    ))
                                ) : (
                                    Array.from(groupedRoutesByBusType.entries()).map(([busTypeId, groupData]) => (
                                        <Collapsible 
                                            key={`group-${busTypeId}`} 
                                            className="group/collapsible-inner" 
                                            open={sidebarGroupExpansionState[busTypeId] !== undefined ? sidebarGroupExpansionState[busTypeId] : true} 
                                            onOpenChange={() => toggleSidebarGroupExpansion(busTypeId)} 
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton variant="outline" className="font-semibold justify-between w-full">
                                                        <div className="flex items-center"> 
                                                            <span>{groupData.description}</span>
                                                            <ChevronDown className="ml-2 transition-transform group-data-[state=closed]/collapsible-inner:-rotate-90 h-4 w-4" />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-7 h-7" // Adjusted size for better click area
                                                            onClick={(e) => {
                                                                e.stopPropagation(); 
                                                                toggleMapGroupVisibility(busTypeId);
                                                            }}
                                                            aria-label="Toggle group map visibility"
                                                        >
                                                            {mapGroupVisibilityState[busTypeId] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                        </Button>
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent asChild>
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        className="overflow-hidden"
                                                    >
                                                        <SidebarMenuSub>
                                                            {groupData.route_ids.size > 0 ? (
                                                                Array.from(groupData.route_ids).map(routeId => (
                                                                    <SidebarMenuSubButton
                                                                        className="cursor-pointer"
                                                                        key={`bus-route-${routeId}`} 
                                                                        // The button itself doesn't need an onClick if checkbox handles all
                                                                        // However, if clicking the row should also toggle, this is fine.
                                                                        onClick={() => {
                                                                            if (mapGroupVisibilityState[busTypeId] !== false) {
                                                                                toggleRouteVisibility(routeId);
                                                                            }
                                                                        }}
                                                                        // Disable button interaction if group is hidden on map
                                                                        disabled={mapGroupVisibilityState[busTypeId] === false} 
                                                                    >
                                                                        <Checkbox
                                                                            checked={busRoutesVisibility[routeId] === true}
                                                                            disabled={mapGroupVisibilityState[busTypeId] === false} 
                                                                            onCheckedChange={() => {
                                                                                // Checkbox click directly calls toggleRouteVisibility
                                                                                // No need for mapGroupVisibilityState check here as button is disabled
                                                                                toggleRouteVisibility(routeId);
                                                                            }}
                                                                            aria-label={`Toggle visibility for Route ${routeId}`}
                                                                        />
                                                                        <span>{`Route ${routeId}`}</span>
                                                                    </SidebarMenuSubButton>
                                                                ))
                                                            ) : ( 
                                                                <SidebarMenuSubItem>
                                                                    <span className="p-2 text-xs text-gray-500">No routes in this group.</span>
                                                                </SidebarMenuSubItem>
                                                            )}
                                                        </SidebarMenuSub>
                                                    </motion.div>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    ))
                                )}
                            </SidebarMenuSub>
                        </motion.div>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>

            {/* Buses Section (remains unchanged) */}
            <Collapsible className="group/collapsible" defaultOpen={true}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton >
                            <Bus/>
                            <span>Bus Locations</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <SidebarMenuSub>
                                {busesLoading ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <SidebarMenuSkeleton key={`loading-bus-${index}`}>
                                            Loading Buses...
                                        </SidebarMenuSkeleton>
                                    ))
                                ) : buses.length > 0 ? (
                                    buses.map((bus, i) => (
                                        <SidebarMenuSubButton
                                            className="cursor-pointer"
                                            key={`bus-location-${bus.id || i}`} 
                                            onClick={() => toggleBusVisibility(i)} 
                                        >
                                            <Checkbox checked={busVisibility![i]} aria-label={`Toggle visibility for Bus ${bus.id || i}`} />
                                            <span>{bus.id || `Bus ${i + 1}`}</span>
                                        </SidebarMenuSubButton>
                                    ))
                                ) : (
                                   <SidebarMenuSubItem>
                                      <span className="p-2 text-xs text-gray-500">No buses available.</span>
                                    </SidebarMenuSubItem>
                                )}
                            </SidebarMenuSub>
                        </motion.div>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenuSub>
    );
}


function AddRouteItems() {
    const addRouteStore = useAddRouteStore();
    const { 
        newRouteBusStops, 
        clearNewRouteBusStops: storeClearNewRouteBusStops,
        clearWaypointRoute: storeClearWaypointRoute,
        clearIntermediateRoutes: storeClearIntermediateRoutes,
        clearVertices: storeClearVertices,
        updateBusStopName,
        deleteBusStop
    } = addRouteStore;

    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [currentStop, setCurrentStop] = React.useState<BusStop | null>(null); 
    const [stopNameInput, setStopNameInput] = React.useState("");

    const handleEditClick = (stop: BusStop) => { 
        setCurrentStop(stop);
        setStopNameInput(stop.name || "");
        setIsAlertOpen(true);
    };

    const handleSaveName = () => {
        if (currentStop && currentStop.id) {
            updateBusStopName(currentStop.id, stopNameInput.trim());
        }
        setIsAlertOpen(false);
        setCurrentStop(null);
        setStopNameInput("");
    };

    const handleDeleteClick = async (stopId: string | undefined) => {
        if (stopId) {
            await deleteBusStop(stopId);
        } else {
            console.warn("Attempted to delete a stop without an ID.");
        }
    };

    const handleClearAllWaypoints = () => {
        storeClearNewRouteBusStops();
        storeClearWaypointRoute();
        storeClearIntermediateRoutes();
        storeClearVertices();
    };
    
    return (
        <SidebarMenuSub className="peer-data-[active=false]/menu-button:hidden flex flex-col h-full">
            <div className="flex-grow overflow-y-auto pr-1">
                {newRouteBusStops.length === 0 ? (
                    <SidebarMenuSubItem>
                        <span className="p-2 text-xs text-gray-400 italic">
                            Click on the map to add bus stops.
                        </span>
                    </SidebarMenuSubItem>
                ) : (
                    newRouteBusStops.map((stop) => ( 
                        <SidebarMenuSubItem 
                            key={stop.id || `stop-${stop.index}`} 
                            className="mb-2 p-2 border rounded-md shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col text-sm">
                                    <span className="font-semibold">
                                        {stop.index}: {stop.name || `Unnamed Stop`} 
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Lat: {stop.location.latitude.toFixed(3)}, Lng: {stop.location.longitude.toFixed(3)}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="w-7 h-7"
                                        onClick={() => handleEditClick(stop)}
                                        aria-label="Edit stop name"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="w-7 h-7 text-red-500 hover:text-red-700"
                                        onClick={() => handleDeleteClick(stop.id)}
                                        aria-label="Delete stop"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </SidebarMenuSubItem>
                    ))
                )}
            </div>

            <div className="mt-auto pt-2 border-t border-border">
                <SidebarMenuSubItem>
                    <SidebarMenuSubButton 
                        className="justify-between font-bold cursor-pointer text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100" 
                        onClick={handleClearAllWaypoints}
                    >
                        <span>Clear All Waypoints</span>
                        <Trash className="w-5 h-5" />
                    </SidebarMenuSubButton>
                </SidebarMenuSubItem>
            </div>

            {currentStop && (
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Edit Bus Stop Name</AlertDialogTitle>
                            <AlertDialogDescription>
                                Stop: {currentStop.index} 
                                ({currentStop.location.latitude.toFixed(3)}, {currentStop.location.longitude.toFixed(3)})
                                <br/> Current Name: {currentStop.name || "Not set"}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-2">
                            <Label htmlFor="stopName" className="text-sm">New Stop Name</Label>
                            <Input
                                id="stopName"
                                value={stopNameInput}
                                onChange={(e) => setStopNameInput(e.target.value)}
                                placeholder="E.g., Central Station"
                                className="mt-1"
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => { setCurrentStop(null); setIsAlertOpen(false); }}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSaveName}>Save Name</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </SidebarMenuSub>
    );
}

function onOptionSelect(key: AdminMenuKey) {
    if (key === AdminMenuKey.AddRoute) {
        // console.log("pressed bus route types")
        // runTestMain()/

    }
}

export function AdminSidebar() {
    const sideBarStore = useSidebarStore()
    const { activeMenu, setActiveMenu: setActive } = sideBarStore

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="absolute ">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel >Options</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sidebarMenuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton key={item.title} asChild isActive={activeMenu[item.key]} onClick={() => {
                                        setActive(item.key)
                                        onOptionSelect(item.key)

                                    }}>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                    {menuSubitems[item.key] && menuSubitems[item.key]()}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
