"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminSidebar({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-black via-gray-900 to-black fixed left-0 top-0 h-screen shadow-2xl z-50 flex flex-col border-r border-red-900/30 overflow-y-auto">
        {/* Logo Section */}
        <div className="p-6 border-b border-red-900/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/50">
              <span className="text-xl font-bold text-white">K&D</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">K&D Admin</h1>
              <p className="text-xs text-gray-400">Restaurant Control</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive("/admin/dashboard")
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50"
                : "text-gray-300 hover:bg-red-900/20 hover:text-white"
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="font-semibold">Dashboard</span>
          </Link>
          
          <Link
            href="/admin/menu"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive("/admin/menu")
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50"
                : "text-gray-300 hover:bg-red-900/20 hover:text-white"
            }`}
          >
            <span className="text-xl">🍽️</span>
            <span className="font-semibold">Menu</span>
          </Link>
          
          <Link
            href="/admin/orders"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive("/admin/orders")
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50"
                : "text-gray-300 hover:bg-red-900/20 hover:text-white"
            }`}
          >
            <span className="text-xl">📋</span>
            <span className="font-semibold">Orders</span>
          </Link>
          
          <Link
            href="/admin/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive("/admin/users")
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50"
                : "text-gray-300 hover:bg-red-900/20 hover:text-white"
            }`}
          >
            <span className="text-xl">👥</span>
            <span className="font-semibold">Users</span>
          </Link>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-red-900/30 bg-black/50">
          <div className="flex items-center gap-3 mb-3 p-3 bg-gray-900/50 rounded-lg border border-red-900/30">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-red-600/50">
              {user?.fullName?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">{user?.fullName || "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/50"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
