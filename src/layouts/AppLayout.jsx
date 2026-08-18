import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-canvas overflow-hidden flex-col md:flex-row">
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </div>
      </div>
      <BottomNav className="block md:hidden" />
    </div>
  );
}
