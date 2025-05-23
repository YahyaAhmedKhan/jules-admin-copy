"use client"

import { BookmarkCheck, Bus, ChevronDown, Delete, Eye, Home, Inbox, MapPlus, Pencil, PlusCircle, Route, Search, Settings, Table, Table2, Table2Icon, Trash } from "lucide-react"
import { motion } from "framer-motion";
import * as React from "react"; // Ensure React is imported

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem, // Added this import
    useSidebar,
} from "@/components/ui/sidebar"
import { JSX } from "react/jsx-runtime"
import useBusRouteStore from "@/stores/bus-routes-store"
import useSidebarStore from "@/stores/sidebar-store"

import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible" // Corrected path
import useAddRouteStore from "@/stores/add-route-store"
import { useBusStore } from "@/stores/bus-store" // Corrected to useBusStore from "@/stores/bus-store"
import { AdminMenuKey } from "@/enums/admin-menu-key";
import { BusRouteEdgeModel } from '@/data-models/bus-route-edge-model'; // Ensure this is imported


interface MenuItem {
    title: string;
    key: AdminMenuKey
    url: string;
    icon: any;

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
        busRoutesByID, // Using busRoutesByID for unique routes
        busRoutesVisibility,
        toggleRouteVisibility,
        busRouteGroupVisibility,
        toggleGroupVisibility,
        loading: routesLoading, // Get loading state
    } = busRouteStore;

    const busStore = useBusStore();
    // Assuming busStore has a loading state, if not, busesLoading would be undefined.
    // If busStore.loading doesn't exist, you might need to adjust or ensure it's added to the store.
    const { buses, busVisibility, toggleBusVisibility, loading: busesLoading } = busStore; 

    const groupedRoutesByBusType = React.useMemo(() => {
        const groups: Map<number, { description: string, route_ids: Set<number> }> = new Map();
        if (busRoutesByID && Object.keys(busRoutesByID).length > 0) {
            for (const routeIdStr in busRoutesByID) {
                const routeId = parseInt(routeIdStr, 10);
                const routeEdges = busRoutesByID[routeId];
                if (routeEdges && routeEdges.length > 0) {
                    const firstEdge = routeEdges[0]; // Use the first edge for type info
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
                                {isLoadingOrEmptyRoutes && !routesLoading ? ( // Show skeleton only if loading, or empty message if not loading but empty
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
                                            open={busRouteGroupVisibility[busTypeId] !== undefined ? busRouteGroupVisibility[busTypeId] : true} // Default to true if undefined
                                            onOpenChange={() => toggleGroupVisibility(busTypeId)}
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton variant="outline" className="font-semibold">
                                                        <span>{groupData.description}</span>
                                                        <ChevronDown className="ml-auto transition-transform group-data-[state=closed]/collapsible-inner:-rotate-90" />
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
                                                                        key={`bus-route-${routeId}`} // Key is now unique
                                                                        onClick={() => {
                                                                            if (busRouteGroupVisibility[busTypeId] !== false) {
                                                                                toggleRouteVisibility(routeId);
                                                                            }
                                                                        }}
                                                                        // disabled property is implicitly handled by clickability check if needed, or can be explicit
                                                                    >
                                                                        <Checkbox
                                                                            checked={busRoutesVisibility[routeId] === true && busRouteGroupVisibility[busTypeId] !== false}
                                                                            disabled={busRouteGroupVisibility[busTypeId] === false}
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

            {/* Buses Section (remains unchanged from previous version) */}
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
                                            key={`bus-location-${bus.id || i}`} // Use bus.id if available for a more stable key
                                            onClick={() => toggleBusVisibility(i)} // Assuming toggleBusVisibility uses index
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
    const addRouteStore = useAddRouteStore()
    const { clearNewRouteBusStops: clearWaypoints, clearWaypointRoute, clearIntermediateRoutes, clearVertices } = addRouteStore

    return (
        <SidebarMenuSub className="peer-data-[active=false]/menu-button:hidden">
            <SidebarMenuSubItem>
                <SidebarMenuSubButton className="justify-between font-bold cursor-pointer hover:text-red-500" onClick={() => {
                    clearWaypoints()
                    clearWaypointRoute()
                    clearIntermediateRoutes()
                    clearVertices()
                }}>
                    <span>Clear Waypoints</span>
                    <Trash className="" ></Trash>
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        </SidebarMenuSub>
    )
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
