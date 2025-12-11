import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children, sidebarOpen, setSidebarOpen, userRole }) => {
  const [activeMenuName, setActiveMenuName] = useState('Dashboard');

  const content = children ?? <Outlet />;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
        onActiveMenuChange={setActiveMenuName}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          userRole={userRole}
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Sidebar
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            userRole={userRole}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header userRole={userRole} setSidebarOpen={setSidebarOpen} activeMenuName={activeMenuName} />
        <main className="flex-1 overflow-y-auto p-0 lg:p-0 bg-white">{content}</main>
      </div>
    </div>
  );
};

export default Layout;
