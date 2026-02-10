import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const AdminLayout = () => {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const menu = [
    { path: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/admin/add-show", icon: <PlusCircle size={20} />, label: "Add Shows" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-6 text-xl font-bold text-primary">QuickShow Admin</div>
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {menu.map((item) => (
            <Link key={item.path} to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path ? "bg-primary" : "hover:bg-gray-800"
              }`}>
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="p-4 flex gap-3 text-gray-400 hover:text-white border-t border-gray-800">
            <LogOut /> Logout
        </button>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;