import React, { useState } from 'react';
import { Mail, Send, FileText, Star, Trash2, Calendar, Plus, Inbox, X } from 'lucide-react';
import EmailTemplatesModal from './EmailTemplatesModal'; // Import the modal component

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeView, setActiveView }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State for controlling modal visibility
  
  const navItems = [
    { icon: Inbox, label: 'Inbox', count: 2, view: 'inbox' },
    { icon: Send, label: 'Sent', view: 'sent' },
    { icon: FileText, label: 'Drafts', count: 3, view: 'drafts' },
    { icon: Star, label: 'Starred', view: 'starred' },
    { icon: Trash2, label: 'Trash', view: 'trash' },
  ];

  const filters = [
    { icon: Calendar, label: 'Today' },
    { icon: Calendar, label: 'This Week' },
    { icon: Calendar, label: 'This Month' },
  ];

  const labels = [
    { color: 'bg-blue-500', label: 'Campaign' },
    { color: 'bg-green-500', label: 'Client Name' },
    { color: 'bg-red-500', label: 'Urgent' },
  ];

  const accounts = [
    { email: 'team@agency.com', provider: 'Gmail', active: true },
    { email: 'support@agency.com', provider: 'Outlook', active: false },
  ];

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-0 w-56 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Mail className="w-6 h-6 text-gray-900" />
            <span className="text-xl font-bold text-gray-900 font-mono">Clients Mails</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compose Button */}
        <div className="p-4">
          <button
            onClick={() => setIsModalOpen(true)} // Open the modal on click
            className="w-full cursor-pointer flex items-center justify-center space-x-2 bg-gray-900 text-white py-2.5 px-4 rounded-sm hover:bg-gray-950 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Compose</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex cursor-pointer items-center justify-between px-3 py-2 rounded-lg transition-colors ${activeView === item.view ? 'bg-indigo-50 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${activeView === item.view ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase">Filters</div>
          <div className="space-y-1">
            {filters.map((item, idx) => (
              <button key={idx} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Labels */}
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase">Labels</div>
          <div className="space-y-1">
            {labels.map((item, idx) => (
              <button key={idx} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span>{item.label}</span>
              </button>
            ))}
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Label</span>
            </button>
          </div>

          {/* Connected Accounts */}
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase">Connected Accounts</div>
          <div className="space-y-1 mb-4">
            {accounts.map((account, idx) => (
              <div key={idx} className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${account.active ? 'bg-gray-100' : ''}`}>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{account.email}</div>
                  <div className="text-xs text-gray-500">{account.provider}</div>
                </div>
                {account.active && <div className="w-2 h-2 bg-green-500 rounded-full" />}
              </div>
            ))}
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Render the modal when the state is true */}
      {isModalOpen && <EmailTemplatesModal onClose={() => setIsModalOpen(false)} />}
    </aside>
  );
};

export default Sidebar;
