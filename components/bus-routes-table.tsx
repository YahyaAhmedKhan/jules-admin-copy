import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import useBusRouteStore from "@/stores/bus-routes-store";
import { Button } from "./ui/button";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, Trash, X } from "lucide-react";
import { AlertDialog, AlertDialogHeader, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { toast } from "@/hooks/use-toast";
import { RouteService } from "@/app/services/route-service";
import useSidebarStore from "@/stores/sidebar-store";
import { AdminMenuKey } from "@/enums/admin-menu-key";
import { getMapInstance, setMapZoom, setMapCoordinates } from "@/map/mapbox-map";
import { Location } from "@/types/location";

// Interface to represent a processed route with all required information
interface ProcessedRoute {
    routeId: number;
    description: string;
    stopCount: number;
    busTypeId: number | string;
    busTypeDescription: string;
    firstStop: Location;
}

export function BusRoutesTable() {
    // Access the bus routes store
    const {
        busRoutesByID,
        fetchRoutes,
        loading,
        error
    } = useBusRouteStore();

    const {
        activeMenu,
        setActiveMenu
    } = useSidebarStore();

    // State for search filters
    const [descriptionFilter, setDescriptionFilter] = useState("");
    const [busTypeFilter, setBusTypeFilter] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Process the routes to get the data we need for the table
    const processRoutes = (): ProcessedRoute[] => {
        if (!busRoutesByID || Object.keys(busRoutesByID).length === 0) {
            return [];
        }

        return Object.entries(busRoutesByID).flatMap(([routeId, edges]) => {
            const firstEdge = edges[0];
            const description = firstEdge?.route_description || 'No description';
            const busTypeId = firstEdge?.bus_type_id || "Unknown";
            const busTypeDescription = firstEdge?.bus_type_description || 'Unknown';
            const firstStop: Location = {
                latitude: firstEdge.source_lat,
                longitude: firstEdge.source_lon,
            };

            const uniqueStops = new Set();
            edges.forEach(edge => {
                uniqueStops.add(`${edge.source_lat},${edge.source_lon}`);
                uniqueStops.add(`${edge.target_lat},${edge.target_lon}`);
            });

            const baseRoute: ProcessedRoute = {
                routeId: parseInt(routeId),
                description,
                stopCount: uniqueStops.size,
                busTypeId,
                busTypeDescription,
                firstStop
            };

            // Duplicate the route 10 times with unique routeId
            return Array.from({ length: 8 }, (_, i) => ({
                ...baseRoute,
                routeId: parseInt(routeId) * 100 + i
            }));
        });
    };

    const allRoutes = processRoutes();

    // Apply filters
    const filteredRoutes = allRoutes.filter(route => {
        // Convert filters and route data to lowercase for case-insensitive comparison
        const descriptionMatch = route.description.toLowerCase().includes(descriptionFilter.toLowerCase());
        const busTypeMatch = route.busTypeDescription.toLowerCase().includes(busTypeFilter.toLowerCase());

        // If both filters are active, both conditions must match
        // If only one filter is active, only that condition needs to match
        if (descriptionFilter && busTypeFilter) {
            return descriptionMatch && busTypeMatch;
        } else if (descriptionFilter) {
            return descriptionMatch;
        } else if (busTypeFilter) {
            return busTypeMatch;
        }

        // If no filters are active, show all routes
        return true;
    });

    // Calculate pagination values
    const totalItems = filteredRoutes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = filteredRoutes.slice(startIndex, endIndex);

    // Reset all filters
    const resetFilters = () => {
        setDescriptionFilter("");
        setBusTypeFilter("");
        setCurrentPage(1);
    };

    // When filters change, go back to first page
    useEffect(() => {
        setCurrentPage(1);
    }, [descriptionFilter, busTypeFilter]);

    // Handle refresh for the routes
    const handleRefreshRoutes = () => {

        toast({
            title: "Refreshing routes",
            description: "Fetching latest bus route data",
            variant: "default",
            action: <Loader2 className="w-6 h-6 animate-spin" />,
        });
        fetchRoutes().then(() => {
            toast({
                title: "Routes refreshed!",
                description: "Bus route data has been updated",
                variant: "default",
                action: <Check className="w-6 h-6" />
            });
        });


    };

    return (
        <div className="flex-grow w-full h-scree p-4 bg-white">
            <div className="flex flex-col gap-4 mb-4 sm:flex-row">
                <div className="flex w-3/5 gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by Route Description..."
                            value={descriptionFilter}
                            onChange={(e) => setDescriptionFilter(e.target.value)}
                            className="pl-8"
                        />
                        {descriptionFilter && (
                            <button
                                onClick={() => setDescriptionFilter("")}
                                className="absolute right-2 top-2.5"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by Bus Type..."
                            value={busTypeFilter}
                            onChange={(e) => setBusTypeFilter(e.target.value)}
                            className="pl-8"
                        />
                        {busTypeFilter && (
                            <button
                                onClick={() => setBusTypeFilter("")}
                                className="absolute right-2 top-2.5"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    {(descriptionFilter || busTypeFilter) && (
                        <Button variant="outline" onClick={resetFilters} className="whitespace-nowrap">
                            Reset Filters
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="default" className="whitespace-nowrap" onClick={handleRefreshRoutes}>
                        Refresh Routes
                        <RefreshCw className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>


            {/* if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading bus routes...</p>
                </div>
            </div>
            );
    }

            if (error) {
        return <div className="p-4 text-red-500">Error loading bus routes: {error}</div>;
    } */}
            {error ?
                <div className="p-4 text-red-500">Error loading bus routes: {error}</div> :
                loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading bus routes...</p>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead className="w-[100px]">Route ID</TableHead>
                                    <TableHead>Route Description</TableHead>
                                    <TableHead>Stops</TableHead>
                                    <TableHead>Bus Type ID</TableHead>
                                    <TableHead>Bus Type</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((route, index) => (
                                        <TableRow key={route.routeId}>
                                            <TableCell className="text-gray-500 flex justify-center">
                                                <span>{startIndex + index + 1}.</span>
                                            </TableCell>
                                            <TableCell className="font-medium"><span className="font-bold">{route.routeId}</span></TableCell>
                                            <TableCell><span className="font-semibold">{route.description}</span></TableCell>
                                            <TableCell><span className="font-semibold">{route.stopCount}</span></TableCell>
                                            <TableCell><span className="font-semibold">{route.busTypeId}</span></TableCell>
                                            <TableCell><span className="font-semibold">{route.busTypeDescription}</span></TableCell>
                                            <TableCell className="flex justify-end gap-2">
                                                <Button variant="default" size="sm" className="flex items-center gap-1"
                                                    onClick={() => {
                                                        setActiveMenu(AdminMenuKey.Home);
                                                        const globalMap = getMapInstance();
                                                        if (!globalMap) {
                                                            throw Error("Global map not set.");
                                                        }
                                                        setMapCoordinates({
                                                            latitude: route.firstStop.latitude,
                                                            longitude: route.firstStop.longitude
                                                        });
                                                        setMapZoom({ zoom: 14 });
                                                    }}
                                                >
                                                    View Route
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Button>
                                                <DeleteButton routeId={route.routeId} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-6">
                                            <span className="font-bold">No bus routes found matching the filters</span>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )

            }



            {/* Pagination controls */}
            {!(loading || error) && filteredRoutes.length > 0 && (
                <div className="flex items-center justify-between mt-4 space-x-2">
                    <div className="text-sm text-muted-foreground">
                        Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalItems}</strong> routes
                    </div>

                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {/* Dynamic page links */}
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;

                                // Logic to display appropriate page numbers
                                if (totalPages <= 5) {
                                    // If 5 or fewer pages, show all
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    // If near the start
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    // If near the end
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    // If in the middle
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setCurrentPage(pageNum);
                                            }}
                                            isActive={pageNum === currentPage}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            {/* Show ellipsis if there are more pages */}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}

function DeleteButton({ routeId }: { routeId: number }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-1">
                    Delete Route
                    <Trash className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want to delete this route?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the route with <span className="font-bold">Route ID: {routeId}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline">
                            Cancel
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant="default"
                            onClick={async () => {
                                const loadingToast = toast({
                                    title: "Deleting...",
                                    action: <Loader2 className="w-6 h-6 animate-spin" />,
                                    description: "Please wait while the route is being deleted.",
                                    variant: "default",
                                    duration: Infinity
                                });

                                // Simulate API call delay
                                const routeService = new RouteService();
                                try {
                                    const response = await routeService.deleteBusRoute(routeId);
                                    // if response has status 200, else throws error
                                    console.log(`Route with ID ${routeId} deleted successfully.`);
                                    toast({
                                        title: `Route with ID ${routeId} has been deleted.`,
                                        description: "The route has been successfully deleted.",
                                        variant: "default",
                                    });
                                }
                                catch (error) {
                                    console.error("Error deleting route:", error);
                                    toast({
                                        title: "Error deleting route",
                                        description: "An error occurred while deleting the route.",
                                        variant: "destructive",
                                    });
                                    return;
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}