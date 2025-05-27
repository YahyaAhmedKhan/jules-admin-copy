import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { BusRoutesTable } from "./bus-routes-table"
import { Separator } from "./ui/separator"
import { BusTypesTable } from "./bus-types-table";


export function TablesView() {
    return (
        <div className="flex justify-center flex-grow w-full h-screen p-4 bg-white tables-area">
            <Tabs defaultValue="routes" className="w-full flex flex-col items-center max-h-full">
                {/* Tabs List stays fixed height */}
                <TabsList className="grid w-1/2 grid-cols-2 mx-auto">
                    <TabsTrigger value="routes">Bus Routes</TabsTrigger>
                    <TabsTrigger value="types">Bus Types</TabsTrigger>
                </TabsList>

                <TabsContent
                    value="routes"
                    // className="w-full rounded-lg p-4 mt-4 flex flex-col items-center flex-grow max-h-[calc(100vh-8rem)]"
                    className="w-full max-h-[calc(100vh-8rem)] flex-col flex-grow flex"
                >
                    <div className="flex flex-col items-start justify-start w-full px-4">
                        <h2 className="text-2xl font-bold">Bus Routes</h2>
                        <p className="text-gray-500">Manage your bus routes here.</p>
                    </div>
                    <Separator className="mt-4 mb-2" />

                    {/* Scrollable bus routes table area */}
                    <div className="overflow-auto flex-grow w-full">
                        <BusRoutesTable />
                    </div>
                </TabsContent>

                <TabsContent value="types"
                    // className="w-full rounded-lg p-4 mt-4 flex flex-col items-center flex-grow max-h-[calc(100vh-8rem)]"
                    className="w-full max-h-[calc(100vh-8rem) flex flex-col flex-grow]"
                >
                    <div className="flex flex-col items-start justify-start w-full px-4">
                        <h2 className="text-2xl font-bold">Bus Types</h2>
                        <p className="text-gray-500">Manage your bus types here.</p>
                    </div>
                    <Separator className="mt-4 mb-2" />

                    {/* Scrollable bus routes table area */}
                    <div className="overflow-auto flex-grow w-full">
                        {/* <BusRoutesTable /> */}
                        <BusTypesTable />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}