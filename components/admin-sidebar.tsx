"use client"

import { BookmarkCheck, Bus, ChevronDown, Delete, Eye, Home, Inbox, MapPlus, Pencil, PlusCircle, Route, Search, Settings, Table, Table2, Table2Icon, Trash } from "lucide-react"
import { motion } from "framer-motion";
import * as React from "react"; // Ensured React is imported for useMemo

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
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { JSX } from "react/jsx-runtime"
import useBusRouteStore from "@/stores/bus-routes-store"
import useSidebarStore from "@/stores/sidebar-store"

import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import useAddRouteStore from "@/stores/add-route-store"
import { useBusStore } from "@/stores/bus-store"
import { AdminMenuKey } from "@/enums/admin-menu-key";
import { BusRouteEdgeModel } from '@/data-models/bus-route-edge-model'; // Added BusRouteEdgeModel import


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
        busRoutes, // Use busRoutes for grouping
        busRoutesVisibility,
        toggleRouteVisibility,
        busRouteGroupVisibility, // Added from store
        toggleGroupVisibility,  // Added from store
    } = busRouteStore;

    const busStore = useBusStore();
    const { buses, busVisibility, toggleBusVisibility } = busStore;

    // Group bus routes by bus_type_id
    const groupedBusRoutes = React.useMemo(() => {
        const groups: Map<number, { description: string, routes: BusRouteEdgeModel[] }> = new Map();
        if (busRoutes && Array.isArray(busRoutes)) {
            busRoutes.forEach(route => {
                if (route && typeof route.bus_type_id !== 'undefined' && route.bus_type_description) {
                    if (!groups.has(route.bus_type_id)) {
                        groups.set(route.bus_type_id, {
                            description: route.bus_type_description,
                            routes: [],
                        });
                    }
                    groups.get(route.bus_type_id)!.routes.push(route);
                }
            });
        }
        return groups;
    }, [busRoutes]);

    // Check if bus routes data is still loading or empty
     const isLoadingOrEmptyRoutes = busRoutes.length === 0;


    return (
        <SidebarMenuSub className="peer-data-[active=false]/menu-button:hidden">
            {/* Bus Routes Section - Now with Grouping */}
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
                                {isLoadingOrEmptyRoutes ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <SidebarMenuSkeleton key={`loading-group-${index}`}>Loading Groups...</SidebarMenuSkeleton>
                                    ))
                                ) : (
                                    Array.from(groupedBusRoutes.entries()).map(([busTypeId, groupData]) => (
                                        <Collapsible key={`group-${busTypeId}`} className="group/collapsible-inner" open={busRouteGroupVisibility[busTypeId]} onOpenChange={() => toggleGroupVisibility(busTypeId)}>
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton variant="outline" className="font-semibold"> {/* Added variant and font-semibold for distinction */}
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
                                                            {groupData.routes.length > 0 ? (
                                                                groupData.routes.map(route => (
                                                                    <SidebarMenuSubButton
                                                                        className="cursor-pointer"
                                                                        key={`bus-route-${route.route_id}`}
                                                                        onClick={() => {
                                                                            if (busRouteGroupVisibility[busTypeId]) { // Only allow toggle if group is visible
                                                                                toggleRouteVisibility(route.route_id);
                                                                            }
                                                                        }}
                                                                        disabled={!busRouteGroupVisibility[busTypeId]} // Disable button if group is collapsed
                                                                    >
                                                                        <Checkbox
                                                                            checked={busRoutesVisibility[route.route_id] === true && busRouteGroupVisibility[busTypeId] === true}
                                                                            disabled={!busRouteGroupVisibility[busTypeId]} // Disable checkbox if group is collapsed
                                                                        />
                                                                        <span>{`Route ${route.route_id}`}</span>
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
                        <SidebarMenuButton>
                            <Bus />
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
                                {buses.length > 0 ? (
                                    buses.map((bus, i) => (
                                        <SidebarMenuSubButton
                                            className="cursor-pointer"
                                            key={`bus-location-${i}`} // Changed key to avoid conflict
                                            onClick={() => toggleBusVisibility(i)}
                                        >
                                            <Checkbox checked={busVisibility![i]} />
                                            <span>{bus.id}</span>
                                        </SidebarMenuSubButton>
                                    ))
                                ) : (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <SidebarMenuSkeleton key={`loading-bus-${index}`}>
                                            Loading Buses...
                                        </SidebarMenuSkeleton>
                                    ))
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
