import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="bg-[#F5F7FB] min-h-screen flex flex-col md:flex-row">
      {/* SIDEBAR (Responsive drawer on mobile, fixed on desktop) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen min-w-0 max-w-full overflow-x-hidden">
        {/* HEADER */}
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* PAGE CONTENT */}
        <main className="p-3 sm:p-5 md:p-6 lg:p-8 flex-1 min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}