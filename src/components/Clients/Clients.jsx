import React, { useState, useCallback, useMemo, useRef, useEffect, useDeferredValue } from 'react';
import { Plus, Search, ChevronDown, Trash2, Edit2, User, Mail, Phone, Building2, Calendar, DollarSign, MoreVertical, RefreshCw, ChevronRight, ChevronDownIcon, Check, X } from 'lucide-react';
import axiosMethods from '../../../axiosConfig';
import { useNavigate } from 'react-router-dom';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
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

const SkeletonLoader = () => (
    <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-16 rounded animate-pulse"></div>
        ))}
    </div>
);

// Dropdown Menu Component
const ActionMenu = ({ client, onEdit, onDelete, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-6 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-32"
        >
            <button
                onClick={() => onEdit(client)}
                className="w-full px-4 cursor-pointer py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
                <Edit2 size={14} />
                Edit
            </button>
            <button
                onClick={() => onDelete(client.id)}
                className="w-full px-4 cursor-pointer py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
            >
                <Trash2 size={14} />
                Delete
            </button>
        </div>
    );
};

// Account Row Component
const AccountRow = ({ account, isExpanded, onToggle }) => {
    const formatCurrency = (amount, currency = 'USD') => {
        if (!amount) return '-';

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) return '-';

        const currencyCode = currency || 'USD';

        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numericAmount);
        } catch (error) {
            // Fallback if currency is invalid
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numericAmount);
        }
    };
    return (
        <div className="border-l-2 border-gray-200 ml-4 pl-4">
            <div
                className="flex items-center gap-2 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={onToggle}
            >
                <div className={`transform ${isExpanded ? 'rotate-90' : ''} transition-transform`}>
                    <ChevronRight size={14} />
                </div>
                <Building2 size={14} className="text-gray-500" />
                <span className="font-medium text-sm">{account.company}</span>
                <span className="text-xs text-gray-500 ml-2">({account.bank_name})</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2">
                    {account.opportunities?.length || 0} opportunities
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {account.contacts?.length || 0} contacts
                </span>
            </div>

            {isExpanded && account.opportunities && account.opportunities.length > 0 && (
                <div className="ml-6 space-y-2 py-2">
                    {account.opportunities.map(opportunity => (
                        <div key={opportunity.id} className="flex items-center gap-3 text-sm py-1">
                            <DollarSign size={12} className="text-gray-500" />
                            <span className="font-medium">{opportunity.title}</span>
                            <span className="text-gray-600">
                                {formatCurrency(opportunity.amount, account.account_currency)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${opportunity.stage === 'Proposal Sent' ? 'bg-purple-100 text-purple-700' :
                                opportunity.stage === 'Negotiation' ? 'bg-orange-100 text-orange-700' :
                                    opportunity.stage === 'Closed Won' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {opportunity.stage}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {isExpanded && account.contacts && account.contacts.length > 0 && (
                <div className="ml-6 space-y-2 py-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">Contacts:</div>
                    {account.contacts.map(contact => (
                        <div key={contact.id} className="flex items-center gap-2 text-sm py-1">
                            <User size={12} className="text-gray-500" />
                            <span>{contact.name}</span>
                            <span className="text-gray-500 text-xs">({contact.email})</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

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

export default function ClientsManagement() {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedClients, setSelectedClients] = useState(new Set());
    const [toast, setToast] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const [activeMenu, setActiveMenu] = useState(null);
    const [expandedAccounts, setExpandedAccounts] = useState({});
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const normalizedSearchTerm = useMemo(
        () => deferredSearchTerm.trim().toLowerCase(),
        [deferredSearchTerm]
    );

    const observerRef = useRef();
    const navigate = useNavigate();

    const lastClientRef = useCallback((node) => {
        if (loadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                loadMoreClients();
            }
        });

        if (node) observerRef.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    // Fetch initial clients using axios
    const fetchClients = useCallback(async (reset = false) => {
        if (reset) {
            setLoading(true);
            setSkip(0);
        } else {
            setLoadingMore(true);
        }

        try {
            const currentSkip = reset ? 0 : skip;
            const result = await axiosMethods.get('/allclients', { skip: currentSkip });

            if (result.success) {
                if (reset) {
                    setClients(result.data.map(buildLeadCache));
                } else {
                    setClients(prev => [...prev, ...result.data.map(buildLeadCache)]);
                }
                setHasMore(result.hasMore);
                setSkip(currentSkip + result.data.length);
            } else {
                setToast({ message: 'Failed to fetch clients', type: 'error' });
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            setToast({ message: 'Error fetching clients', type: 'error' });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [skip]);

    // Load more clients for infinite scroll
    const loadMoreClients = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            fetchClients(false);
        }
    }, [fetchClients, loading, loadingMore, hasMore]);

    // Initial load and refresh
    useEffect(() => {
        fetchClients(true);
    }, []);

    const refreshClients = useCallback(() => {
        fetchClients(true);
    }, [fetchClients]);

    // Delete client using axios
    const deleteClient = useCallback(async (id) => {
        try {
            const result = await axiosMethods.delete('/clients', { id });

            if (result.success) {
                setClients(prev => prev.filter(client => client.id !== id));
                setSelectedClients(prev => {
                    const updated = new Set(prev);
                    updated.delete(id);
                    return updated;
                });
                setActiveMenu(null);
                setToast({
                    message: `Client ${result.deleted_client} deleted successfully`,
                    type: 'success'
                });
            } else {
                setToast({
                    message: result.message || 'Failed to delete client',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error deleting client:', error);
            setToast({
                message: error.response?.data?.message || 'Error deleting client',
                type: 'error'
            });
        }
    }, []);

    // Edit client function
    const editClient = useCallback((client) => {
        console.log('Edit client:', client);
        setActiveMenu(null);
        setToast({ message: `Editing ${client.name}`, type: 'success' });
    }, []);

    // Toggle action menu
    const toggleActionMenu = useCallback((clientId, e) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === clientId ? null : clientId);
    }, [activeMenu]);

    // Toggle account expansion
    const toggleAccount = useCallback((accountId) => {
        setExpandedAccounts(prev => ({
            ...prev,
            [accountId]: !prev[accountId]
        }));
    }, []);

    // Close action menu
    const closeActionMenu = useCallback(() => {
        setActiveMenu(null);
    }, []);

    const handleSelectClient = useCallback((clientId, e) => {
        e.stopPropagation();
        setSelectedClients(prev => {
            const updated = new Set(prev);
            if (updated.has(clientId)) {
                updated.delete(clientId);
            } else {
                updated.add(clientId);
            }
            return updated;
        });
    }, []);

    const handleSelectAll = (e) => {
        if (selectedClients.size === filteredClients.length && selectedClients.size > 0) {
            setSelectedClients(new Set());
        } else {
            setSelectedClients(new Set(filteredClients.map(c => c.id)));
        }
    };

    const filteredClients = useMemo(() => {
        const hasSearch = normalizedSearchTerm.length > 0;
        const matches = clients.filter(client => {
            if (!hasSearch) return true;
            const searchTarget = client.__searchText ?? '';
            return searchTarget.includes(normalizedSearchTerm);
        });

        if (sortBy === 'name') {
            return [...matches].sort((a, b) => a.name.localeCompare(b.name));
        }
        if (sortBy === 'value') {
            return [...matches].sort((a, b) => (b.expected_deal_value || 0) - (a.expected_deal_value || 0));
        }
        return matches;
    }, [clients, normalizedSearchTerm, sortBy]);

    // Calculate total opportunities and accounts
    const totalStats = useMemo(() => {
        return clients.reduce((stats, client) => {
            const accounts = client.accounts || [];
            stats.totalAccounts += accounts.length;
            stats.totalOpportunities += accounts.reduce((sum, acc) => sum + (acc.opportunities?.length || 0), 0);
            stats.totalContacts += accounts.reduce((sum, acc) => sum + (acc.contacts?.length || 0), 0);
            return stats;
        }, { totalAccounts: 0, totalOpportunities: 0, totalContacts: 0 });
    }, [clients]);

    // Utility function for currency formatting
    const formatCurrency = (amount, currency = 'USD') => {
        if (!amount) return '-';

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) return '-';

        const currencyCode = currency || 'USD';

        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numericAmount);
        } catch (error) {
            // Fallback if currency is invalid
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numericAmount);
        }
    };

    return (
        <div className="h-full bg-gray-50" onClick={closeActionMenu}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <p>Manage your converted <span className='font-semibold'>Clients</span> here and track the progress of each deal.</p>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{filteredClients.length} clients</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                onClick={refreshClients}
                                disabled={loading}
                            >
                                <RefreshCw size={16} className="inline mr-1" />
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-6 py-3">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-full">
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400 bg-white"
                        >
                            <option value="recent">Recently Added</option>
                            <option value="name">Name</option>
                            <option value="value">Deal Value</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-6 py-3">
                    <div className="flex items-center gap-8 text-sm">
                        <div>
                            <span className="text-gray-500">Total Clients:</span>
                            <span className="ml-2 font-semibold text-gray-900">{clients.length}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Total Accounts:</span>
                            <span className="ml-2 font-semibold text-gray-900">{totalStats.totalAccounts}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Total Opportunities:</span>
                            <span className="ml-2 font-semibold text-gray-900">{totalStats.totalOpportunities}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">High Priority:</span>
                            <span className="ml-2 font-semibold text-gray-900">{clients.filter(c => c.lead_priority === 'high').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="p-6">
                <div className="bg-white border border-gray-200 rounded">
                    {loading ? (
                        <div className="p-6">
                            <SkeletonLoader />
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="w-12 px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedClients.size === filteredClients.length && filteredClients.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Client Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Company</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Phone</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Deal Value</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Close Date</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Priority</th>
                                    <th className="px-4 py-1 text-left font-medium text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map((client, index) => (
                                    <React.Fragment key={client.id}>
                                        <tr
                                            className={`border-b border-gray-200 hover:bg-gray-50 ${client.accounts?.length > 0 ? 'bg-blue-50' : ''}`}
                                            ref={index === filteredClients.length - 1 ? lastClientRef : null}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedClients.has(client.id)}
                                                    onChange={(e) => handleSelectClient(client.id, e)}
                                                    className="w-4 h-4"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                                                        {client.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div
                                                            onClick={() => navigate(`/SingleClientPage/${client.id}`)}
                                                            className="font-semibold cursor-pointer text-gray-900 hover:underline"
                                                        >
                                                            {client.name}
                                                        </div>
                                                        {client.accounts && client.accounts.length > 0 && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {client.accounts.length} account{client.accounts.length > 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{client.company}</td>
                                            <td className="px-4 py-3 text-gray-600">{client.email}</td>
                                            <td className="px-4 py-3 text-gray-600">{client.phone}</td>
                                            <td className="px-4 py-3 text-gray-900 font-medium">
                                                {formatCurrency(client.expected_deal_value, client.account_currency)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {client.expected_closing_date ? new Date(client.expected_closing_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                }) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${client.lead_priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    client.lead_priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {client.lead_priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 relative">
                                                <button
                                                    className="text-gray-400 cursor-pointer hover:text-gray-600 p-1 rounded hover:bg-gray-200"
                                                    onClick={(e) => toggleActionMenu(client.id, e)}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {activeMenu === client.id && (
                                                    <ActionMenu
                                                        client={client}
                                                        onEdit={editClient}
                                                        onDelete={deleteClient}
                                                        onClose={() => toggleActionMenu(null)}
                                                    />
                                                )}
                                            </td>
                                        </tr>

                                        {/* Accounts Section */}
                                        {client.accounts && client.accounts.length > 0 && (
                                            <tr>
                                                <td colSpan="9" className="px-4 py-3 bg-blue-50">
                                                    <div className="space-y-2">
                                                        {client.accounts.map(account => (
                                                            <AccountRow
                                                                key={account.id}
                                                                account={account}
                                                                isExpanded={expandedAccounts[account.id]}
                                                                onToggle={() => toggleAccount(account.id)}
                                                            />
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Loading more indicator */}
                    {loadingMore && (
                        <div className="p-4 text-center">
                            <div className="inline-flex items-center gap-2 text-gray-500">
                                <RefreshCw size={16} className="animate-spin" />
                                Loading more clients...
                            </div>
                        </div>
                    )}

                    {/* No more data indicator */}
                    {!hasMore && filteredClients.length > 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No more clients to load
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && filteredClients.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No clients found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
