import { AdminMenuKey } from '@/enums/admin-menu-key';
import { create } from 'zustand';

interface SidebarStore {

    activeMenu: {
        home: boolean,
        addRoute: boolean,
        busRouteTypes: boolean,
        search: boolean,
        settings: boolean
    }

    setActiveMenu: (key: keyof SidebarStore['activeMenu']) => void

}



const useSidebarStore = create<SidebarStore>((set, get) => ({

    activeMenu:
    {
        home: true,
        addRoute: false,
        busRouteTypes: false,
        search: false,
        settings: false
    },

    setActiveMenu: (key) => {
        set(
            {
                activeMenu: {
                    home: key === AdminMenuKey.Home,
                    addRoute: key === AdminMenuKey.AddRoute,
                    busRouteTypes: key === AdminMenuKey.BusRouteTypes,
                    search: key === AdminMenuKey.Search,
                    settings: key === AdminMenuKey.Settings,
                }
            }
        )
    }

}));

export default useSidebarStore; 