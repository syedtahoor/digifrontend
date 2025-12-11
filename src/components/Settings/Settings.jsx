import React, { useState } from 'react';
import { Menu, Search, X, Settings as SettingsIcon, FileText } from 'lucide-react';
import SavedTextSnippets from './SettingsPages/SavedTexts'

function SettingsDefault() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
        <SettingsIcon className="h-7 w-7 text-gray-800" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Choose a setting from the sidebar to configure automation, canned responses, and workspace
        preferences.
      </p>
    </div>
  );
}

const sidebarMenuItems = [
  {
    key: 'savedTextSnippets',
    label: 'Saved Text Snippets',
    icon: FileText,
    description: 'Manage canned responses for outreach and support.',
    component: SavedTextSnippets,
  },
];

export default function SalesforceSetup() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const closeSidebar = () => setSidebarOpen(false);

  const activeItem = sidebarMenuItems.find((item) => item.key === activeSection);
  const ActiveComponent = activeItem?.component ?? null;

  return (
    <div className="relative flex min-h-screen flex-col bg-white md:flex-row">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col overflow-y-auto border-r border-gray-200 bg-gray-50 transition-transform duration-200 ease-in-out md:static md:w-64 md:translate-x-0 md:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-3 md:hidden">
          <span className="text-sm font-medium text-gray-700">Setup</span>
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded p-1 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-200 p-3">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Quick Find"
              className="w-full rounded border border-gray-300 py-2 pl-8 pr-2 text-sm focus:border-gray-700 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 py-2">
          <nav className="text-sm">
            {sidebarMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.key);
                    closeSidebar();
                  }}
                  className={`flex cursor-pointer w-full flex-col gap-1 px-4 py-2 text-left transition ${isActive ? 'border-l-4 border-gray-700 bg-white text-gray-800 shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-gray-800' : 'text-gray-400'}`} />
                    <span className="font-normal">{item.label}</span>
                  </span>
                  {isActive && item.description && (
                    <span className="text-[10px] text-gray-500">{item.description}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex flex-1 flex-col md:ml-0 md:pl-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded p-1 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-medium text-gray-900">Setup</h1>
          <span className="w-5" />
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="px-4 py-6 sm:px-6 lg:px-5">
            <header className="mb-8 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <SettingsIcon className="h-6 w-6 text-gray-800" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
                <p className="text-sm text-gray-500">
                  {activeItem?.description ||
                    'Configure your CRM workspace, automation, and productivity tools.'}
                </p>
              </div>
            </header>

            {ActiveComponent ? <ActiveComponent /> : <SettingsDefault />}
          </div>
        </div>
      </main>
    </div>
  );
}