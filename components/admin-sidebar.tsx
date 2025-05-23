"use client"

import { BookmarkCheck, Bus, ChevronDown, Delete, Eye, Home, Inbox, MapPlus, Pencil, PlusCircle, Route, Search, Settings, Table, Table2, Table2Icon, Trash } from "lucide-react"
import { motion } from "framer-motion";

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
    const { busRoutes, busRoutesVisibility, toggleRouteVisibility, busRoutesByID } = busRouteStore

    const busStore = useBusStore();
    const { buses, busVisibility, toggleBusVisibility } = busStore

    return (
        <SidebarMenuSub className="peer-data-[active=false]/menu-button:hidden">
            <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton >
                            <Route></Route>
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
                                {Object.entries(busRoutesByID).length > 0 ? (
                                    Object.entries(busRoutesByID).map(([id, routes]) => (

                                        <SidebarMenuSubButton className="cursor-pointer " key={`bus route-${id}`} onClick={() => toggleRouteVisibility(Number(id))}>
                                            <Checkbox checked={busRoutesVisibility[Number(id)]} ></Checkbox>
                                            <span>{`Route ${id}`}</span>
                                        </SidebarMenuSubButton>
                                    ))
                                ) : (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <SidebarMenuSkeleton key={index}>Loading</SidebarMenuSkeleton>
                                    ))
                                )}
                            </SidebarMenuSub>
                        </motion.div>
                    </CollapsibleContent>


                </SidebarMenuItem>
            </Collapsible>

            {/* Buses */}
            <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton >
                            <Bus></Bus>
                            <span>Bus Locations</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <SidebarMenuSub>
                                {buses.length > 0 ?
                                    buses.map((bus, i) => {
                                        return <SidebarMenuSubButton className="cursor-pointer " key={`bus route-${i}`} onClick={() => toggleBusVisibility(i)}>
                                            <Checkbox checked={busVisibility![i]}  ></Checkbox>
                                            <span>{bus.id}</span>
                                        </SidebarMenuSubButton>
                                    }) :
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <SidebarMenuSkeleton key={index}>
                                            Loading
                                        </SidebarMenuSkeleton>
                                    ))
                                }
                            </SidebarMenuSub>
                        </motion.div>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenuSub >

    )
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
