import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings, User, LogOut, BookCheck, UserLock, TrendingUp, FileText, House, DollarSign, ShoppingCart, Warehouse, MoreHorizontal, Box, Target } from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen, userRole, onActiveMenuChange }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Admin routes - main visible icons
  const adminMainNavigation = [
    {
      name: "Home",
      href: "/dashboard",
      icon: House,
      color: "bg-black",
    },
    {
      name: "Leads",
      icon: BookCheck,
      color: "bg-black",
      sidebarlabel: "Leads",
      subItems: [
        { name: "Leads", href: "/leads" },
      ],
    },
    {
      name: "Clients",
      icon: UserLock,
      color: "bg-black",
      sidebarlabel: "Clients",
      subItems: [
        { name: "Clients", href: "/clients" },
      ],
    },
    {
      name: "Emails",
      icon: UserLock,
      color: "bg-black",
      sidebarlabel: "Emails",
      subItems: [
        { name: "Emails", href: "/emails" },
      ],
    },
    {
      name: "Campaign",
      href: "/campaigns",
      icon: Target,
      color: "bg-black",
    },
    
  ];

  // Additional admin menu items (shown in "More" dropdown)
  const adminMoreNavigation = [
    {
      name: "Inventory",
      href: "/inventory",
      icon: Warehouse,
      color: "bg-black",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: TrendingUp,
      color: "bg-black",
    },
    {
      name: "Products",
      href: "/products",
      icon: Box,
      color: "bg-black",
    },
  ];

  // User main navigation
  const userMainNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: House,
      color: "bg-black",
    },
    {
      name: "My Orders",
      icon: ShoppingCart,
      color: "bg-black",
      subItems: [
        { name: "Active Orders", href: "/orders/active" },
        { name: "Order History", href: "/orders/history" },
        { name: "Returns", href: "/orders/returns" },
      ],
    },
    {
      name: "Inventory",
      icon: Warehouse,
      color: "bg-black",
      subItems: [
        { name: "Products", href: "/inventory/products" },
        { name: "Stock Levels", href: "/inventory/stock" },
        { name: "Low Stock Alert", href: "/inventory/alerts" },
      ],
    },
    {
      name: "Sales & Revenue",
      icon: TrendingUp,
      color: "bg-black",
      subItems: [
        { name: "My Sales", href: "/sales/my-sales" },
        { name: "Revenue Report", href: "/sales/revenue" },
      ],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      color: "bg-black",
    },
  ];

  // Settings menu item for both roles
  const settingsNavigation = [
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      color: "bg-black",
    }
  ];

  const userMoreNavigation = [];

  const mainNavigation = userRole === "Admin" ? adminMainNavigation : userMainNavigation;
  const moreNavigation = userRole === "Admin" ? adminMoreNavigation : userMoreNavigation;

  React.useEffect(() => {
    // Find active menu name
    let activeMenuName = '';

    mainNavigation.forEach(item => {
      if (item.href && isActive(item.href)) {
        activeMenuName = item.name;
      } else if (item.subItems && isParentActive(item.subItems)) {
        activeMenuName = item.name;
      }
    });

    moreNavigation.forEach(item => {
      if (item.href && isActive(item.href)) {
        activeMenuName = item.name;
      }
    });

    // ✅ NEW: Check settings navigation
    settingsNavigation.forEach(item => {
      if (item.href && isActive(item.href)) {
        activeMenuName = item.name;
      }
    });

    // Send to parent
    if (onActiveMenuChange && activeMenuName) {
      onActiveMenuChange(activeMenuName);
    }
  }, [location.pathname, mainNavigation, moreNavigation, settingsNavigation, onActiveMenuChange]);

  const isActive = (path) => location.pathname === path;
  const isParentActive = (subItems) =>
    subItems?.some(item => location.pathname === item.href);
  const getSidebarLabel = (item) => item?.sidebarlabel || item.name;
  const isSettingsRouteActive = location.pathname.startsWith("/settings");

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
    setShowMoreMenu(false);
    setOpenMenu(null);
  };

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <div className="w-16 bg-black h-screen flex flex-col items-center py-2 relative shadow-2xl">


      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center space-y-2 w-full px-2">
        {mainNavigation.map((item) => {
          const isItemActive = item.href ? (!item.disableActiveHighlight && isActive(item.href)) : false;
          return (
            <div key={item.name} className="relative w-full">
              {item.href ? (
                <Link
                  to={item.href}
                  onClick={handleLinkClick}
                  className={`w-full flex cursor-pointer flex-col items-center justify-center gap-1 rounded-sm py-3 transition-all duration-200 group relative text-center ${isItemActive
                    ? `bg-white text-black shadow-lg scale-105`
                    : "hover:bg-gray-950 text-white rounded-sm"
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${isItemActive ? "text-black" : "text-white"}`} />
                  <span className={`text-[10px] font-medium leading-tight ${isItemActive ? "text-black" : "text-white"}`}>
                    {getSidebarLabel(item)}
                  </span>
                  {isItemActive && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
                  )}
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center cursor-pointer justify-center rounded-sm transition-all duration-200 group relative flex-col gap-1 py-3 text-center ${isParentActive(item.subItems)
                      ? `bg-white text-black shadow-lg scale-105`
                      : "hover:bg-gray-950 text-white rounded-sm "
                      }`}
                  >
                    <item.icon className={`w-5 h-5 ${isParentActive(item.subItems) ? "text-black" : "text-white"}`} />
                    <span className={`text-[10px] font-medium leading-tight ${isParentActive(item.subItems) ? "text-black" : "text-white"}`}>
                      {getSidebarLabel(item)}
                    </span>
                    {isParentActive(item.subItems) && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
                    )}
                  </button>

                  {/* Click Menu for Nested Items */}
                  {openMenu === item.name && (
                    <div className="absolute left-full top-0 ml-2 z-[9999]">
                      <div className="bg-white rounded-sm shadow-2xl border border-gray-300 py-1 min-w-[220px]">
                        <div className="px-3 py-2 border-b border-gray-300">
                          <p className="text-xs font-semibold text-black uppercase tracking-wide">
                            {item.name}
                          </p>
                        </div>
                        <div className="py-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              onClick={handleLinkClick}
                              className={`block w-full text-left px-3 py-2 text-sm transition-colors ${isActive(subItem.href)
                                ? "bg-black text-white font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* More Menu Button (if there are additional items) */}
        {moreNavigation.length > 0 && (
          <div className="relative w-full">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-full h-11 flex items-center cursor-pointer justify-center rounded-sm transition-all duration-200 hover:bg-gray-950 group relative text-white"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* More Items Dropdown */}
            {showMoreMenu && (
              <div className="absolute left-full bottom-0 ml-2 z-[9999]">
                <div className="bg-white rounded-lg shadow-2xl border border-gray-300 py-1 min-w-[180px]">
                  {moreNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={handleLinkClick}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-3 ${isActive(item.href)
                        ? "bg-black text-white font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col items-center space-y-2 w-full px-2 pt-4 border-t border-gray-800">
        <Link
          to="/settings"
          onClick={handleLinkClick}
          className={`w-full h-11 flex items-center cursor-pointer justify-center rounded-lg transition-all duration-200 group ${isSettingsRouteActive
            ? "bg-white text-black shadow-lg"
            : "hover:bg-gray-950 text-white"
            }`}
        >
          <Settings className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-90 ${isSettingsRouteActive ? "text-black" : "text-white"}`} />
        </Link>

        <button
          onClick={() => {
            sessionStorage.clear();
            window.location.href = "/login"; // optional redirect
          }}
          className="w-full h-11 flex items-center cursor-pointer justify-center rounded-lg hover:bg-gray-95x transition-all duration-200 group text-white"
        >
          <LogOut className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default Sidebar;