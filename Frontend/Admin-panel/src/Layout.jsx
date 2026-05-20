import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";

export default function Layout({ children }) {
  return (
    <div className="bg-[#F5F7FB] min-h-screen">
      {/* FIXED SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="ml-[260px] flex flex-col min-h-screen">
        {/* HEADER */}
        <Header />

        {/* PAGE */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}