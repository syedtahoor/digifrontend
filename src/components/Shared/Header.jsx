import React, { useState } from "react";
import { Search, Plus, Cloud, Settings, HelpCircle, Bell, ChevronDown, Menu, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ setSidebarOpen, userRole, activeMenuName }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left Section - Menu Toggle and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen?.(true)}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 font-serif flex"> {activeMenuName}</h1>
        </div>

        {/* Center Section - Search and Plus (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
          <div className={`relative flex items-center transition-all duration-200 ${searchFocused ? 'w-[30rem]' : 'w-80'}`}>
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Quick Find..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 py-1  text-md bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:bg-white focus:border-gray-400 transition-colors"
            />
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Right Section - Icons and User */}
        <div className="flex items-center gap-1">

          <button
            onClick={() => navigate("/settings")}
            className="p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => navigate("/calendar")}
            className="p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
            title="Calendar"
          >
            <CalendarDays className="w-4 h-4 text-gray-600" />
          </button>

          <button className="p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors relative" title="Notifications">
            <Bell className="w-4 h-4 text-gray-600" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-2"></div>

          <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded transition-colors">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center
  ${userRole === "Admin" ? "bg-blue-500" : "bg-orange-500"}`}
            >
              {userRole === "Admin" ? (
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff&bold=true&size=28"
                  alt="Admin"
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <img
                  src="https://ui-avatars.com/api/?name=Ohsana+K&background=f97316&color=fff&bold=true&size=28"
                  alt="User"
                  className="w-7 h-7 rounded-full"
                />
              )}
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-gray-800 leading-tight">{userRole === "Admin" ? "Admin" : "User"}
              </div>
              <div className="text-xs text-gray-500 leading-tight">{userRole === "Admin" ? "Administrator" : "Client"}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;