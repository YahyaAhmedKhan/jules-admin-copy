import { SidebarTrigger } from "./ui/sidebar";
import { User } from "lucide-react";

export const Navbar = () => {
  return (
    <header>
      <div className="flex items-center justify-between w-screen gap-10 px-4 py-3 border-0 bg-slate-100">
        <div className="flex gap-3">
          <SidebarTrigger />
          <div className="text-xl font-bold cursor-pointer " >Rawangi Admin</div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <User className="w-5 h-5 text-slate-700" />
          <span className="text-slate-700 font-bold">Test Admin</span>
        </div>
      </div>
    </header>
  );
};
export default Navbar;