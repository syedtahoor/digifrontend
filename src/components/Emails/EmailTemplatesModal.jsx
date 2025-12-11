import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const EmailTemplatesModal = ({ onClose }) => {
  const [selectedLayout, setSelectedLayout] = useState(null);

  useEffect(() => {
    const handleEsc = event => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const layouts = [
    {
      id: 'sales',
      name: 'Sales',
      description: 'Send targeted outreach to sales leads.',
      color: 'border-yellow-300 bg-yellow-50',
      preview: (
        <div className="space-y-2">
          <div className="h-2 bg-gray-300 rounded w-3/4"></div>
          <div className="h-2 bg-gray-300 rounded w-1/2"></div>
          <div className="flex gap-2 mt-3">
            <div className="w-16 h-16 bg-gray-200 rounded"></div>
            <div className="w-16 h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      )
    },
    {
      id: 'announcement',
      name: 'Announcement',
      description: 'Call out important updates or announce big events.',
      color: 'border-blue-300 bg-blue-50',
      preview: (
        <div className="space-y-2">
          <div className="h-2 bg-gray-300 rounded w-full"></div>
          <div className="h-2 bg-gray-300 rounded w-full"></div>
          <div className="h-2 bg-gray-300 rounded w-3/4"></div>
          <div className="flex gap-2 mt-3">
            <div className="w-12 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-1">
              <div className="h-1.5 bg-gray-300 rounded w-full"></div>
              <div className="h-1.5 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      description: 'Share regular updates or other forms of brand promotion.',
      color: 'border-pink-300 bg-pink-50',
      preview: (
        <div className="space-y-2">
          <div className="h-2 bg-gray-300 rounded w-2/3 mx-auto"></div>
          <div className="flex gap-2 mt-3">
            <div className="w-12 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-1">
              <div className="h-1.5 bg-gray-300 rounded w-full"></div>
              <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
              <div className="h-1.5 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-1">
              <div className="h-1.5 bg-gray-300 rounded w-full"></div>
              <div className="h-1.5 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'richtext',
      name: 'Rich Text',
      description: 'Create emails with formatted text and styling.',
      color: 'border-green-300 bg-green-50',
      preview: (
        <div className="space-y-2">
          <div className="h-2 bg-gray-300 rounded w-1/2"></div>
          <div className="space-y-1 mt-3">
            <div className="h-1.5 bg-gray-300 rounded w-full"></div>
            <div className="h-1.5 bg-gray-300 rounded w-full"></div>
            <div className="h-1.5 bg-gray-300 rounded w-4/5"></div>
          </div>
          <div className="space-y-1 mt-3">
            <div className="h-1.5 bg-gray-300 rounded w-full"></div>
            <div className="h-1.5 bg-gray-300 rounded w-full"></div>
            <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
          </div>
          <div className="space-y-1 mt-3">
            <div className="h-1.5 bg-gray-300 rounded w-full"></div>
            <div className="h-1.5 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      )
    },
    {
      id: 'plaintext',
      name: 'Plain Text',
      description: 'Simple text-only email format.',
      color: 'border-blue-400 bg-blue-100',
      preview: (
        <div className="flex items-center justify-center h-full">
          <div className="text-4xl text-gray-400">+</div>
        </div>
      )
    }
  ];

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Templates</p>
            <h2 className="text-xl font-semibold text-gray-800">Select an Email Layout</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Close template modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Layout Options */}
          <div className="w-full lg:w-1/2 border-r border-gray-200 overflow-y-auto p-6 email-scroll">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Layout Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {layouts.map((layout) => (
                <div
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout.id)}
                  className={`cursor-pointer rounded-lg border-4 p-4 transition-all hover:shadow-md ${
                    selectedLayout === layout.id 
                      ? `${layout.color} border-opacity-100` 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="bg-white rounded p-3 mb-3 h-32 overflow-hidden">
                    {layout.preview}
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">{layout.name}</h4>
                  <p className="text-xs text-gray-600">{layout.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="hidden lg:block w-1/2 bg-gray-50 overflow-y-auto p-6 email-scroll">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Preview</h3>
            <div className="bg-white rounded-lg shadow-sm p-8 min-h-[500px] border border-gray-200">
              {selectedLayout ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-block px-4 py-2 bg-gray-100 rounded text-sm text-gray-600 mb-4">
                      Preview of {layouts.find(l => l.id === selectedLayout)?.name} Layout
                    </div>
                  </div>
                  {layouts.find(l => l.id === selectedLayout)?.preview}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Select a layout to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 cursor-pointer rounded-lg font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedLayout) {
                alert(`Selected layout: ${layouts.find(l => l.id === selectedLayout)?.name}`);
              }
            }}
            disabled={!selectedLayout}
            className={`px-6 cursor-pointer py-2 rounded-lg font-medium transition-colors ${
              selectedLayout
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Select & Continue
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return ReactDOM.createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default EmailTemplatesModal;
