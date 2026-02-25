import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Aurora from "../components/ui/Aurora"; 

const AdminLayout = () => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/add-show", label: "Add Shows", icon: <PlusCircle size={20} /> },
  ];

  return (
    <div className="relative w-screen h-screen bg-[#0F0F0F] overflow-hidden text-white font-sans">
      {/* 1. Lớp Background Aurora nằm dưới cùng */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <Aurora
          colorStops={["#7cff67", "#B19EEF", "#5227FF"]} 
          blend={0.7} // Độ hòa trộn
          amplitude={1.2} // Độ cao sóng
          speed={0.5} // Tốc độ trôi
        />
      </div>

      {/* Lớp Nội dung chính nằm đè lên trên */}
      <div className="relative z-10 flex h-full">
        
        {/* Sidebar: Nền trong suốt + Blur để thấy Aurora bên dưới */}
        <aside className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
          <div className="p-6 flex items-center gap-3">
              <span className="text-xl font-bold text-aurora">QuickShow</span>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {menuItems.map((item) => (
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? "btn-aurora text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
              <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white w-full transition hover:bg-white/5 rounded-lg">
                  <LogOut size={20}/>
                  <span>Logout</span>
              </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-transparent border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white/90">Admin Panel</h2>
              <div className="text-sm text-gray-300">Welcome, Admin</div>
          </header>

          <main className="flex-1 overflow-auto p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;