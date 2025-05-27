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
import { Button } from "./ui/button";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, Trash, X } from "lucide-react";
import { AlertDialog, AlertDialogHeader, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { toast } from "@/hooks/use-toast";
import { BusTypesService } from "@/app/services/bus-types-service";
import { useBusTypeStore } from "@/stores/bus-types-store";

export function BusTypesTable() {
    const {
        busRouteTypes,
        getBusRouteTypes,
        fetchBusRouteTypes,
        loading,
        error,

    } = useBusTypeStore();

    // Loading state

    // Filter state
    const [descriptionFilter, setDescriptionFilter] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // useEffect(() => {
    //     async function fetchData() {
    //         setError(null);
    //         try {
    //             await getBusRouteTypes();
    //         } catch (err) {
    //             setError("Failed to load bus types.");
    //         } finally {
    //         }
    //     }
    //     // fetchData();
    // }, [getBusRouteTypes]);

    // Reset filters helper
    const resetFilters = () => {
        setDescriptionFilter("");
        setCurrentPage(1);
    };

    // Filter and paginate bus types
    const filteredBusTypes = busRouteTypes?.filter(type =>
        type.description.toLowerCase().includes(descriptionFilter.toLowerCase())
    ) ?? [];

    const totalItems = filteredBusTypes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = filteredBusTypes.slice(startIndex, endIndex);

    // Refresh data handler
    const handleRefresh = async () => {
        toast({
            title: "Refreshing bus types",
            description: "Fetching latest bus type data",
            variant: "default",
            action: <Loader2 className="w-6 h-6 animate-spin" />,
        });
        await fetchBusRouteTypes();
        try {
            await getBusRouteTypes();
            toast({
                title: "Bus types refreshed!",
                description: "Bus type data has been updated",
                variant: "default",
                action: <Check className="w-6 h-6" />
            });
        } catch {
            toast({
                title: "Failed to refresh bus types",
                description: "An error occurred while fetching bus types.",
                variant: "destructive",
            });
        }
    };

    // if (isLoading) {
    //     return (
    //         <div className="flex items-center justify-center w-full h-full">
    //             <div className="flex flex-col items-center gap-4 text-center">
    //                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    //                 <p className="text-sm text-muted-foreground">Loading bus types...</p>
    //             </div>
    //         </div>
    //     );
    // }

    // if (error) {
    //     return <div className="p-4 text-red-500">Error loading bus types: {error}</div>;
    // }

    return (
        <div className="flex-grow w-full h-screen p-4 bg-white">
            <div className="flex flex-col gap-4 mb-4 sm:flex-row">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter by Description..."
                        value={descriptionFilter}
                        onChange={e => setDescriptionFilter(e.target.value)}
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

                <div className="flex items-center gap-2 ml-auto">
                    {descriptionFilter && (
                        <Button variant="outline" onClick={resetFilters} className="whitespace-nowrap">
                            Reset Filters
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="default" className="whitespace-nowrap" onClick={handleRefresh}>
                        Refresh Bus Types
                        <RefreshCw className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {error ?
                <div className="p-4 text-red-500">Error loading Bus Types: {error}</div> :
                loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading Bus Types...</p>
                        </div>
                    </div>
                ) :

                    (<div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-[120px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((type, index) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="text-gray-500 flex justify-center">
                                                <span>{startIndex + index + 1}.</span>
                                            </TableCell>
                                            <TableCell className="font-medium">{type.id}</TableCell>
                                            <TableCell className="font-semibold">{type.description}</TableCell>
                                            <TableCell className="flex justify-end gap-2">
                                                <DeleteButton busTypeId={type.id} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6">
                                            <span className="font-bold">No bus types found matching the filter</span>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>)}


        </div>
    );
}

function DeleteButton({ busTypeId }: { busTypeId: number }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-1">
                    Delete
                    <Trash className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want to delete this bus type?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the bus type with <span className="font-bold">ID: {busTypeId}</span>.
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
                                    description: "Please wait while the bus type is being deleted.",
                                    variant: "default",
                                    duration: Infinity,
                                });

                                const busTypesService = new BusTypesService();
                                try {
                                    await busTypesService.deleteBusType(busTypeId);

                                    toast({
                                        title: `Bus type with ID ${busTypeId} has been deleted.`,
                                        description: "The bus type has been successfully deleted.",
                                        variant: "default",
                                    });


                                    // Optionally refresh or clear cache here
                                    // You might want to call clearBusRouteTypes() and getBusRouteTypes() again from store
                                } catch (error) {
                                    console.error("Error deleting bus type:", error);
                                    toast({
                                        title: "Error deleting bus type",
                                        description: "An error occurred while deleting the bus type.",
                                        variant: "destructive",
                                    });
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