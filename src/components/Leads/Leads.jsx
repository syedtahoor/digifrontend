import React, { useState, useCallback, useMemo, useRef, useEffect, useDeferredValue } from 'react';
import { Plus, Upload, RefreshCw, Search, ChevronDown, Trash2, Edit2, X, Check, User, Mail, Phone, Briefcase, Building2, TrendingUp, Star, FileText, Eye, ArrowUp, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosMethods from '../../../axiosConfig';
import LeadAddModal from './LeadAddModal';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const containerClasses = isSuccess
    ? 'bg-gradient-to-br from-gray-900 to-black text-white border border-gray-800 shadow-2xl'
    : 'bg-white text-slate-900 border border-slate-200 shadow-xl';
  const iconWrapperClasses = isSuccess
    ? 'bg-white/10 text-white'
    : 'bg-slate-100 text-slate-900';

  return (
    <div
      role="status"
      aria-live="assertive"
      className={`fixed top-4 right-4 z-50 flex w-80 max-w-full items-center gap-3 rounded-xl px-4 py-4 transition-all duration-200 ease-out ${containerClasses}`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconWrapperClasses}`}>
        {isSuccess ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </span>
      <span className="flex-1 text-sm font-semibold leading-5">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className={`rounded-full p-1 transition-opacity duration-150 hover:opacity-70 ${isSuccess ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-500'}`}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-gradient-to-r from-gray-100 to-gray-50 h-16 rounded"></div>
    ))}
  </div>
);

// Normalize and cache frequently used lead values for faster filtering
// Normalize and cache frequently used lead values for faster filtering
const buildLeadCache = (lead) => {
  const name = lead?.name ?? '';
  const email = lead?.email ?? '';
  const company = lead?.company ?? '';

  return {
    ...lead,
    __searchText: `${name} ${email} ${company}`.toLowerCase(),
    // Ensure currency has a default value
    account_currency: lead?.account_currency || 'USD'
  };
};

const STATUS_COLOR_MAP = {
  new: 'bg-blue-50 text-blue-700 border border-blue-200',
  contacted: 'bg-teal-50 text-teal-700 border border-teal-200',
  qualified: 'bg-green-50 text-green-700 border border-green-200',
  converted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  proposalsent: 'bg-orange-50 text-orange-700 border border-orange-200',
  disqualified: 'bg-red-50 text-red-700 border border-red-200'
};

const PRIORITY_COLOR_MAP = {
  low: 'bg-gray-100 text-gray-600 border border-gray-300',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  high: 'bg-red-100 text-red-700 border border-red-200'
};

const getStatusBadgeColor = (status) => STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP.new;
const getPriorityBadgeColor = (priority) => PRIORITY_COLOR_MAP[priority] || PRIORITY_COLOR_MAP.medium;

const LeadRow = React.memo(
  ({ lead, isSelected, onSelect, onView, onDelete, statusColor, priorityColor }) => {
    // Utility function for currency formatting
    const formatCurrency = (amount, currency = 'USD') => {
      if (!amount) return '-';

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) return '-';

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numericAmount);
    };
    const leadInitial = lead?.name ? lead.name.charAt(0).toUpperCase() : '';

    const handleSelectChange = (event) => onSelect(lead.id, event);
    const handleNameClick = () => onView(lead.id);
    const handleViewClick = (event) => {
      event.stopPropagation();
      onView(lead.id);
    };
    const handleDeleteClick = (event) => {
      event.stopPropagation();
      onDelete(lead.id);
    };

    return (
      <tr className="border-b border-gray-200 hover:bg-blue-50 transition group">
        <td className="px-4 py-4 text-left w-12">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectChange}
            className="w-4 h-4 cursor-pointer"
          />
        </td>
        <td
          onClick={handleNameClick}
          className="px-6 py-4 font-medium text-gray-900 cursor-pointer"
        >
          <div className="flex items-center gap-2 font-semibold hover:text-gray-700" title="Click to View the Lead..">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white text-xs font-bold">
              {leadInitial}
            </div>
            {lead.name}
          </div>
        </td>
        <td className="px-6 py-4 text-gray-600">{lead.company || '-'}</td>
        <td className="px-6 py-4 text-gray-600">{lead.phone || '-'}</td>
        <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{lead.email}</td>
        <td className="px-6 py-4">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1`}>•</span>
            {lead.status}
          </span>
        </td>
        <td className="px-6 py-4 text-gray-600">{lead.interest || 'No Record!'}</td>
        <td className="px-6 py-4 text-gray-600">
          {lead.expected_deal_value
            ? formatCurrency(lead.expected_deal_value, lead.account_currency)
            : '-'}
        </td>
        <td className="px-6 py-4 text-gray-600">
          {lead.expected_closing_date
            ? new Date(lead.expected_closing_date).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
            : '-'}
        </td>
        <td className="px-6 py-4">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${priorityColor}`}>
            {lead.lead_priority}
          </span>
        </td>
        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
          {lead.created_at
            ? new Date(lead.created_at).toLocaleString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            : "-"}
        </td>
        <td className="px-6 py-4 ">
          <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleViewClick}
              className="text-gray-800 cursor-pointer hover:text-gray-900 hover:bg-blue-100 p-1.5 rounded transition"
              title="View details"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={(event) => event.stopPropagation()}
              className="text-gray-600 cursor-pointer hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded transition"
              title="Edit lead"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="text-red-700 cursor-pointer hover:bg-red-50 p-1.5 rounded transition"
              title="Delete lead"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  },
  (prev, next) =>
    prev.lead === next.lead &&
    prev.isSelected === next.isSelected &&
    prev.statusColor === next.statusColor &&
    prev.priorityColor === next.priorityColor
);

const LeadCard = React.memo(({ lead, isSelected, onSelect, onView, onDelete, statusColor, priorityColor }) => {
  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '-';

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return '-';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  };
  const leadInitial = lead?.name ? lead.name.charAt(0).toUpperCase() : '';

  return (
    <div className={`bg-white border ${isSelected ? 'border-black' : 'border-gray-200'} rounded-lg p-5 hover:shadow-md transition-all group`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(lead.id, e);
            }}
            className="w-4 h-4 cursor-pointer"
          />
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white font-bold">
            {leadInitial}
          </div>
          <div>
            <h3
              className="font-bold text-gray-900 cursor-pointer hover:underline"
              onClick={() => onView(lead.id)}
            >
              {lead.name}
            </h3>
            <p className="text-sm text-gray-500">{lead.company || 'No Company'}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(lead.id);
            }}
            className="p-1.5 hover:bg-gray-100 rounded transition"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 hover:bg-gray-100 rounded transition"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lead.id);
            }}
            className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} className="text-gray-400" />
          <span className="truncate">{lead.email || 'No email'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} className="text-gray-400" />
          <span>{lead.phone || 'No phone'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase size={14} className="text-gray-400" />
          <span>{lead.interest || 'No interest'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-sm">
          <span className="text-gray-500">Deal: </span>
          {/* // LeadCard component mein update */}
          <span className="font-bold text-gray-900">
            {formatCurrency(lead.expected_deal_value, lead.account_currency)}
          </span>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${priorityColor}`}>
          {lead.lead_priority?.toUpperCase()}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span className={`px-2 py-1 rounded-full ${statusColor}`}>
          {lead.status}
        </span>
        {lead.expected_closing_date && (
          <span>
            Closes: {new Date(lead.expected_closing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
});

export default function ClientsManagement() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 50;
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const normalizedSearchTerm = useMemo(
    () => deferredSearchTerm.trim().toLowerCase(),
    [deferredSearchTerm]
  );
  const observerTarget = useRef(null);
  const tableContainerRef = useRef(null);




  const fetchInitialLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosMethods.get('/leads');

      if (response.success) {
        const normalizedLeads = Array.isArray(response.data) ? response.data.map(buildLeadCache) : [];
        setLeads(normalizedLeads);
        setHasMore(response.hasMore ?? (normalizedLeads.length >= itemsPerPage));
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Initial load
  useEffect(() => {
    fetchInitialLeads();
  }, [fetchInitialLeads]);

  const fetchMoreLeads = useCallback(async () => {
    try {
      if (!hasMore || loadingMore) {
        return;
      }

      setLoadingMore(true);
      const response = await axiosMethods.get('/leads', {
        skip: leads.length
      });

      if (response.success && response.data?.length > 0) {
        const normalizedLeads = response.data.map(buildLeadCache);
        setLeads(prev => [...prev, ...normalizedLeads]);
        setHasMore(response.hasMore ?? (normalizedLeads.length >= itemsPerPage));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch more leads:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, leads.length, itemsPerPage]);


  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchMoreLeads();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, fetchMoreLeads]);

  // Scroll to top listener
  useEffect(() => {
    const container = tableContainerRef.current;
    const scrollableParent = container?.closest('.overflow-y-auto');

    const scrollTargets = [window];
    if (container) scrollTargets.push(container);
    if (scrollableParent && scrollableParent !== container) {
      scrollTargets.push(scrollableParent);
    }

    const getScrollTop = (target) => {
      if (target === window) {
        return window.scrollY || document.documentElement.scrollTop || 0;
      }
      return target ? target.scrollTop : 0;
    };

    let frameId = null;

    const updateScrollState = () => {
      const currentScroll = scrollTargets.reduce(
        (max, target) => Math.max(max, getScrollTop(target)),
        0
      );
      frameId = null;
      setShowScrollTop(prev => {
        const shouldShow = currentScroll > 200;
        return prev === shouldShow ? prev : shouldShow;
      });
    };

    const handleScroll = () => {
      if (frameId !== null) {
        return;
      }
      frameId = window.requestAnimationFrame(updateScrollState);
    };

    scrollTargets.forEach(target =>
      target.addEventListener('scroll', handleScroll, { passive: true })
    );

    updateScrollState();

    return () => {
      scrollTargets.forEach(target =>
        target.removeEventListener('scroll', handleScroll)
      );
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [loading]);



  const handleLeadAdded = (newLead) => {
    setLeads(prev => [buildLeadCache(newLead), ...prev]);
  };

  const deleteLead = useCallback(async (id) => {
    try {
      const response = await axiosMethods.delete(`/leads/${id}`);

      if (response.success) {
        setLeads(prev => prev.filter(lead => lead.id !== id));
        setSelectedLeads(prev => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
        setToast({
          message: `Lead deleted successfully`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Error deleting lead');
    }
  }, []);

  const handleRowClick = useCallback((leadId) => {
    navigate(`/SingleLeadPage/${leadId}`);
  }, [navigate]);

  const handleSelectLead = useCallback((leadId, e) => {
    e.stopPropagation();
    setSelectedLeads(prev => {
      const updated = new Set(prev);
      if (updated.has(leadId)) {
        updated.delete(leadId);
      } else {
        updated.add(leadId);
      }
      return updated;
    });
  }, []);

  const handleSelectAll = (e) => {
    e.stopPropagation();
    if (selectedLeads.size === paginatedLeads.length && selectedLeads.size > 0) {
      setSelectedLeads(new Set());
    } else {
      const allIds = new Set(paginatedLeads.map(lead => lead.id));
      setSelectedLeads(allIds);
    }
  };

  const scrollToTop = () => {
    const container = tableContainerRef.current;
    const scrollableParent = container?.closest('.overflow-y-auto');
    let scrolled = false;

    const scrollElementToTop = (element) => {
      if (!element) return false;
      if (element.scrollHeight <= element.clientHeight) return false;
      element.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    };

    scrolled = scrollElementToTop(container);
    if (!scrolled) {
      scrolled = scrollElementToTop(scrollableParent);
    }

    if (!scrolled) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Optimized filtering and searching
  const filteredLeads = useMemo(() => {
    const hasSearch = normalizedSearchTerm.length > 0;

    const matches = leads.filter(lead => {
      if (filterStatus !== 'all' && lead.status !== filterStatus) {
        return false;
      }

      if (!hasSearch) {
        return true;
      }

      const searchTarget = lead.__searchText ?? '';
      return searchTarget.includes(normalizedSearchTerm);
    });

    if (sortBy === 'name') {
      return [...matches].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return [...matches].sort((a, b) => {
        const priorityA = priorityOrder[a.lead_priority] ?? Number.POSITIVE_INFINITY;
        const priorityB = priorityOrder[b.lead_priority] ?? Number.POSITIVE_INFINITY;
        return priorityA - priorityB;
      });
    }

    return matches;
  }, [leads, normalizedSearchTerm, filterStatus, sortBy]);

  // Pagination
  const paginatedLeads = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Display */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Header with Title and Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-md text-gray-600">Manage Leads, Add then to campaigns etc.</p>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-xs font-semibold text-gray-500 border-r border-gray-300 mr-5 p-2 pr-5">
                {leads.length} items • {filteredLeads.length} results
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-1.5 cursor-pointer bg-white hover:bg-black hover:text-white duration-300 text-gray-900 px-5 py-2 rounded-l-md border border-gray-300 border-r-0 transition text-sm font-medium"
              >
                <Plus size={14} />
                New
              </button>
              <button className="inline-flex cursor-pointer items-center gap-1.5 bg-white border border-gray-300 border-r-0 duration-300 hover:bg-black hover:text-white text-gray-700 px-5 py-2 transition text-sm font-medium">
                <Upload size={14} />
                Import Leads
              </button>
              <button className="inline-flex cursor-pointer items-center gap-1.5 bg-white border border-gray-300 border-r-0 duration-300 hover:bg-black hover:text-white text-gray-700 px-5 py-2 transition text-sm font-medium">
                Add to Campaign
              </button>
              <button className="inline-flex cursor-pointer items-center gap-1.5 bg-white border border-gray-300 border-r-0 duration-300 hover:bg-black hover:text-white text-gray-700 px-5 py-2 transition text-sm font-medium">
                <RefreshCw size={14} />
                Change Status
              </button>
              <button className="px-3 py-2 duration-300 cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-r-md transition">
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1 min-w-[250px] relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search this list..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white transition"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 cursor-pointer py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white transition"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="proposalsent">Proposal Sent</option>
              <option value="disqualified">Disqualified</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 py-2.5 border cursor-pointer border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white transition"
            >
              <option value="recent">Sort by Recent</option>
              <option value="name">Sort by Name</option>
              <option value="priority">Sort by Priority</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 cursor-pointer rounded transition ${viewMode === 'grid' ? 'bg-gray-950 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 cursor-pointer rounded transition ${viewMode === 'list' ? 'bg-gray-950 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table or Grid */}
      <div className="max-w-full mx-auto px-6 py-6">
        <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-gray-200 relative">
          {loading ? (
            <div className="p-6">
              <SkeletonLoader />
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg font-medium">No leads yet</p>
              <p className="text-gray-400 mt-1">Add your first lead to get started</p>
            </div>
          ) : viewMode === 'list' ? (
            <>
              <div className="overflow-x-auto" ref={tableContainerRef}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 sticky top-0">
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 w-12">
                        <input
                          type="checkbox"
                          checked={selectedLeads.size === paginatedLeads.length && paginatedLeads.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-300">Name</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-300">Company</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-300">Phone</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-300">Email</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-300">Lead Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-300">Interest</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-300">Deal Value</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-300">Closing Date</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-300">Priority</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-300">Lead Created</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeads.map((lead, idx) => (
                      <LeadRow
                        key={lead.id ?? `lead-${idx}`}
                        lead={lead}
                        isSelected={selectedLeads.has(lead.id)}
                        onSelect={handleSelectLead}
                        onView={handleRowClick}
                        onDelete={deleteLead}
                        statusColor={getStatusBadgeColor(lead.status)}
                        priorityColor={getPriorityBadgeColor(lead.lead_priority)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="p-6 border-t border-gray-200">
                  <SkeletonLoader />
                </div>
              )}

              {/* Intersection Observer Target */}
              <div ref={observerTarget} className="h-4" />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                  <span className="text-sm text-gray-600 font-medium">
                    Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, filteredLeads.length)} of {filteredLeads.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === i ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-white'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* No More Records */}
              {!hasMore && leads.length > 0 && (
                <div className="px-6 py-4 text-center text-gray-500 text-sm bg-gray-50 border-t border-gray-200">
                  All leads loaded ✓
                </div>
              )}
            </>
          ) : (
            <>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedLeads.map((lead, idx) => (
                    <LeadCard
                      key={lead.id ?? `lead-${idx}`}
                      lead={lead}
                      isSelected={selectedLeads.has(lead.id)}
                      onSelect={handleSelectLead}
                      onView={handleRowClick}
                      onDelete={deleteLead}
                      statusColor={getStatusBadgeColor(lead.status)}
                      priorityColor={getPriorityBadgeColor(lead.lead_priority)}
                    />
                  ))}
                </div>
              </div>

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="p-6 border-t border-gray-200">
                  <SkeletonLoader />
                </div>
              )}

              {/* Intersection Observer Target */}
              <div ref={observerTarget} className="h-4" />

              {/* Pagination for Grid View */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                  <span className="text-sm text-gray-600 font-medium">
                    Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, filteredLeads.length)} of {filteredLeads.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === i ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-white'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* No More Records */}
              {!hasMore && leads.length > 0 && (
                <div className="px-6 py-4 text-center text-gray-500 text-sm bg-gray-50 border-t border-gray-200">
                  All leads loaded ✓
                </div>
              )}
            </>
          )}

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 cursor-pointer right-8 bg-transparent text-black border p-3 rounded-full shadow-lg hover:bg-black hover:text-white transition-all duration-200 z-50"
              title="Scroll to top"
            >
              <ArrowUp size={20} />
            </button>
          )}
        </div>
      </div>
      <LeadAddModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleLeadAdded}
        fetchInitialLeads={fetchInitialLeads}
      />
    </div>
  );
}
