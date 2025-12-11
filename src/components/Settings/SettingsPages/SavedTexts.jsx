import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, X, Star, Copy, Check, ChevronDown } from 'lucide-react';
import axiosMethods from '../../../../axiosConfig';

const CATEGORIES = ['Email', 'SMS', 'Chat', 'Notes'];
const AVAILABLE_FOR_OPTIONS = ['Contacts', 'Leads', 'Accounts', 'Opportunities'];
const TOKENS = [
  { label: 'Contact Name', value: '{[contact name]}' },
  { label: 'Lead Name', value: '{[lead name]}' },
  { label: 'Account Name', value: '{[account name]}' },
  { label: 'User Name', value: '{[user name]}' },
  { label: 'Today', value: '{[today]}' },
  { label: 'Now', value: '{[now]}' }
];

const defaultFormData = { name: '', content: '', description: '', category: 'Email', available_for: [], is_default: false };

function normalizeSavedText(text) {
  if (!text) return null;
  return {
    ...text,
    available_for: Array.isArray(text.available_for) ? text.available_for : [],
    is_default: Boolean(text.is_default),
  };
}

function timeAgo(dateInput) {
  if (!dateInput) {
    return 'just now';
  }

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return 'just now';
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

function renderTokens(content) {
  const dummyData = {
    '{[contact name]}': 'Jannat Zubar',
    '{[lead name]}': 'Ahmed Khan',
    '{[account name]}': 'Acme Corp',
    '{[user name]}': 'Sarah Johnson',
    '{[today]}': new Date().toLocaleDateString(),
    '{[now]}': new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  
  return content.replace(/\{\[([^\]]+)\]\}/g, (match) => dummyData[match] || match);
}

function Toast({ message, type = 'success', onClose }) {
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
}

function QuickTextPicker({ onInsert, trigger, texts = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === '.') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filtered = useMemo(() => {
    return texts.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase())
    );
  }, [texts, search]);

  const handleSelect = (text) => {
    const rendered = renderTokens(text.content);
    onInsert(rendered);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={ref}>
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg cursor-pointer border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-black/15"
        >
          Quick Text (Ctrl + .)
        </button>
      )}

      {isOpen && (
        <div className="absolute top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-zinc-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search saved texts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/15"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <p>No saved texts found</p>
              </div>
            ) : (
              filtered.map((text) => (
                <button
                  key={text.id}
                  onClick={() => handleSelect(text)}
                  className="w-full px-4 cursor-pointer py-3 text-left hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none border-b border-zinc-100 last:border-b-0"
                >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-zinc-900">{text.name}</span>
                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-slate-700">
                            {text.category}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 line-clamp-2">{text.content}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SavedTextsManager() {
  const [texts, setTexts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableForFilter, setAvailableForFilter] = useState([]);
  const [defaultOnlyFilter, setDefaultOnlyFilter] = useState(false);
  const [selectedText, setSelectedText] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [formData, setFormData] = useState(() => ({ ...defaultFormData }));
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const contentRef = useRef(null);
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const tokenDropdownRef = useRef(null);
  const [demoText, setDemoText] = useState('');

  const fetchSavedTexts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosMethods.get('/saved-texts');
      if (response?.success === false) {
        throw new Error(response?.message || 'Failed to load saved texts.');
      }
      const payload = Array.isArray(response?.data) ? response.data : [];
      const normalized = payload.map(normalizeSavedText).filter(Boolean);
      setTexts(normalized);
    } catch (error) {
      console.error('Failed to load saved texts', error);
      const message = error.response?.data?.message || 'Failed to load saved texts.';
      setToast({ message, type: 'error' });
      setTexts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchSavedTexts();
  }, [fetchSavedTexts]);
  useEffect(() => {
    if (!showTokenDropdown) return;
    
    const handleClickOutside = (e) => {
      if (tokenDropdownRef.current && !tokenDropdownRef.current.contains(e.target)) {
        setShowTokenDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTokenDropdown]);

  const filteredTexts = useMemo(() => {
    const searchLower = search.toLowerCase();
    return texts.filter((text) => {
      const nameLower = (text?.name || '').toLowerCase();
      const contentLower = (text?.content || '').toLowerCase();
      const matchesSearch = !searchLower || nameLower.includes(searchLower) || contentLower.includes(searchLower);
      const matchesCategory = !categoryFilter || text?.category === categoryFilter;
      const availableFor = Array.isArray(text?.available_for) ? text.available_for : [];
      const matchesAvailableFor =
        availableForFilter.length === 0 ||
        availableForFilter.some((option) => availableFor.includes(option));
      const matchesDefault = !defaultOnlyFilter || Boolean(text?.is_default);

      return matchesSearch && matchesCategory && matchesAvailableFor && matchesDefault;
    });
  }, [texts, search, categoryFilter, availableForFilter, defaultOnlyFilter]);

  const handleCreate = () => {
    setFormData({ ...defaultFormData });
    setErrors({});
    setIsEditing(true);
    setSelectedText(null);
  };

  const handleEdit = (text) => {
    const normalized = normalizeSavedText(text);
    if (!normalized) return;

    setFormData({
      ...defaultFormData,
      ...normalized,
      available_for: [...normalized.available_for],
    });
    setErrors({});
    setIsEditing(true);
    setSelectedText(normalized);
  };

  const handleDuplicate = (text) => {
    const normalized = normalizeSavedText(text);
    if (!normalized) return;

    setFormData({
      ...defaultFormData,
      ...normalized,
      name: `${normalized.name} (Copy)`,
      is_default: false,
      available_for: [...normalized.available_for],
    });
    setErrors({});
    setIsEditing(true);
    setSelectedText(null);
  };

  const handleDelete = (text) => {
    const normalized = normalizeSavedText(text);
    if (!normalized) return;

    setDeleteConfirm(normalized);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const response = await axiosMethods.delete(`/saved-texts/${deleteConfirm.id}`);
      if (response?.success === false) {
        throw new Error(response?.message || 'Failed to delete saved text.');
      }

      setTexts((prev) => prev.filter((t) => t.id !== deleteConfirm.id));
      setToast({
        message: response?.message || 'Saved text deleted successfully',
        type: 'success',
      });

      if (selectedText?.id === deleteConfirm.id) {
        setIsEditing(false);
        setSelectedText(null);
      }

      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete saved text', error);
      const message = error.response?.data?.message || error.message || 'Failed to delete saved text.';
      setToast({ message, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    const name = formData.name.trim();
    const content = formData.content.trim();
    
    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length > 150) {
      newErrors.name = 'Name must be 150 characters or less';
    }
    
    if (!content) {
      newErrors.content = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);

    const payload = {
      name: formData.name.trim(),
      content: formData.content,
      description: formData.description?.trim() || '',
      category: formData.category,
      available_for: Array.from(new Set(formData.available_for)),
      is_default: Boolean(formData.is_default),
    };

    try {
      if (selectedText) {
        const response = await axiosMethods.put(`/saved-texts/${selectedText.id}`, payload);
        if (response?.success === false) {
          throw new Error(response?.message || 'Failed to update saved text.');
        }

        const updated = normalizeSavedText(response?.data);
        if (updated) {
          setTexts((prev) => prev.map((text) => (text.id === updated.id ? updated : text)));
        }

        setToast({
          message: response?.message || 'Saved text updated successfully',
          type: 'success',
        });
      } else {
        const response = await axiosMethods.post('/saved-texts', payload);
        if (response?.success === false) {
          throw new Error(response?.message || 'Failed to create saved text.');
        }

        const created = normalizeSavedText(response?.data);
        if (created) {
          setTexts((prev) => [created, ...prev]);
        }

        setToast({
          message: response?.message || 'Saved text created successfully',
          type: 'success',
        });
      }

      setFormData({ ...defaultFormData });
      setErrors({});
      setIsEditing(false);
      setSelectedText(null);
    } catch (error) {
      console.error('Failed to save saved text', error);
      const message = error.response?.data?.message || error.message || 'Failed to save saved text.';
      setToast({ message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedText(null);
    setFormData({ ...defaultFormData });
    setErrors({});
  };

  const insertToken = (token) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const newText = text.substring(0, start) + token + text.substring(end);
    
    setFormData({ ...formData, content: newText });
    setShowTokenDropdown(false);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + token.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const copyPreview = () => {
    const rendered = renderTokens(formData.content);
    navigator.clipboard.writeText(rendered);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  const renderPreview = () => {
    if (!formData.content) return null;
    
    const parts = [];
    let lastIndex = 0;
    const regex = /\{\[([^\]]+)\]\}/g;
    let match;

    while ((match = regex.exec(formData.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: formData.content.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'token', content: match[0] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < formData.content.length) {
      parts.push({ type: 'text', content: formData.content.substring(lastIndex) });
    }

    return parts.map((part, idx) => {
      if (part.type === 'token') {
        return (
          <span key={idx} className="inline-flex items-center rounded bg-zinc-200 px-2 py-0.5 font-mono text-sm text-slate-800">
            {part.content}
          </span>
        );
      }
      return <span key={idx}>{part.content}</span>;
    });
  };

  const toggleAvailableForFilter = (option) => {
    setAvailableForFilter(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-48 bg-gradient-to-bl from-zinc-200/70 via-transparent to-transparent sm:block" />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Saved Texts</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Build a shared library of reusable text. Start by searching for an existing entry, then create or edit to keep your team aligned.
                </p>
                <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Review filters to narrow down your saved snippets.
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Use tokens to personalise content without manual edits.
                  </span>
                </div>
              </div>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 rounded-full cursor-pointer bg-black px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-zinc-900 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isEditing}
              >
                <Plus className="h-4 w-4" />
                Create quick text
              </button>
            </div>

            <div className="mt-8 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
                  <label htmlFor="search" className="sr-only">Search</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="search"
                      type="text"
                      placeholder="Search by name or content..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-11 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="sr-only">Category</label>
                  <select
                    id="category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full rounded-xl cursor-pointer border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end">
                  <label htmlFor="defaultOnly" className="cursor-pointer inline-flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-700 shadow-sm transition hover:border-black focus-within:ring-2 focus-within:ring-black/20">
                    <input
                      id="defaultOnly"
                      type="checkbox"
                      checked={defaultOnlyFilter}
                      onChange={(e) => setDefaultOnlyFilter(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-black focus:ring-black"
                    />
                    Default only
                  </label>
                </div>
              </div>

              {availableForFilter.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <p className="font-medium text-slate-600">Active filters:</p>
                  {availableForFilter.map(opt => (
                    <span key={opt} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-slate-700 shadow-sm">
                      {opt}
                      <button
                        onClick={() => toggleAvailableForFilter(opt)}
                        className="rounded-full bg-zinc-200 cursor-pointer p-1 text-slate-600 hover:bg-zinc-300"
                        aria-label={`Remove ${opt} filter`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-200/70 pt-5">
                <p className="text-sm font-medium text-slate-600">Filter by Available For</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AVAILABLE_FOR_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleAvailableForFilter(opt)}
                      className={`rounded-full cursor-pointer px-4 py-1.5 text-sm font-medium transition ${
                        availableForFilter.includes(opt)
                          ? 'bg-black text-white shadow focus-visible:outline-offset-2 focus-visible:outline-black'
                          : 'border border-slate-200 bg-white/70 text-slate-600 hover:border-black hover:text-slate-800 focus-visible:outline-offset-2 focus-visible:outline-black/20'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* List Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Saved Texts</h2>
                <p className="text-xs text-slate-500">Step through the filters, then select a draft to inspect its content.</p>
              </div>
              {!isLoading && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {filteredTexts.length} total
                </span>
              )}
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, idx) => (
                    <div
                      key={idx}
                      className="animate-pulse rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm"
                    >
                      <div className="mb-3 h-4 w-1/3 rounded bg-slate-100"></div>
                      <div className="mb-2 h-3 w-full rounded bg-slate-100"></div>
                      <div className="h-3 w-5/6 rounded bg-slate-100"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTexts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-12 text-center shadow-inner">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-slate-900">No saved texts found</h3>
                  <p className="mb-4 text-sm text-slate-600">
                    {search || categoryFilter || availableForFilter.length > 0 || defaultOnlyFilter
                      ? 'Try adjusting your filters or search query.'
                      : 'Create your first reusable snippet to jump-start conversations.'}
                  </p>
                  {!isEditing && (
                    <button
                      onClick={handleCreate}
                      className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-zinc-900  focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      <Plus className="h-4 w-4" />
                      Create quick text
                    </button>
                  )}
                </div>
              ) : (
                filteredTexts.map(text => (
                  <div
                    key={text.id}
                    className={`rounded-xl border transition-all ${
                      selectedText?.id === text.id
                        ? 'border-transparent bg-zinc-100 shadow-lg ring-2 ring-black/60'
                        : 'border-slate-200 bg-white/70 shadow-sm hover:-translate-y-0.5 hover:border-black/60 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="truncate text-base font-semibold text-slate-900">{text.name}</h3>
                          {text.is_default && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-xs font-medium text-white">
                              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                              Default
                            </span>
                          )}
                        </div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {text.category}
                          </span>
                          {text.available_for.map(avail => (
                            <span key={avail} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                              {avail}
                            </span>
                          ))}
                        </div>
                        <p className="mb-1 line-clamp-2 text-sm text-slate-600">{text.content}</p>
                        <p className="text-xs text-slate-500">Updated {timeAgo(text.updated_at)}</p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                        ID #{text.id}
                      </span>
                    </div>
                    <div className="border-t border-slate-200/70 px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(text)}
                          disabled={isEditing}
                          className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-zinc-100  focus-visible:outline-offset-2 focus-visible:outline-black/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(text)}
                          disabled={isEditing}
                          className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-zinc-100  focus-visible:outline-offset-2 focus-visible:outline-black/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(text)}
                          disabled={isEditing}
                          className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-zinc-100  focus-visible:outline-offset-2 focus-visible:outline-black/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor / Preview Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
            {!isEditing ? (
              <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-slate-700 shadow-inner">
                  <Plus className="h-10 w-10" />
                </div>
                <div className="max-w-lg space-y-2">
                  <h3 className="text-2xl font-semibold text-slate-900">Select or create a quick text</h3>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Follow these steps to get started quickly:</p>
                    <ol className="mx-auto max-w-xs space-y-1 text-left text-xs text-slate-500">
                      <li>1. Choose a saved text on the left to review details.</li>
                      <li>2. Click <strong>Create quick text</strong> to draft a new snippet.</li>
                      <li>3. Insert merge tokens where personalisation is needed.</li>
                    </ol>
                  </div>
                </div>

                {/* Demo Integration */}
                <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white/75 p-6 text-left shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">Quick Text Demo</h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      Ctrl + .
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-slate-600">
                    Try the Quick Text picker in action. Insert saved snippets just like your team will inside conversations.
                  </p>
                  <div className="space-y-3">
                    <textarea
                      id="demoTextarea"
                      value={demoText}
                      onChange={(e) => setDemoText(e.target.value)}
                      placeholder="Press Ctrl + . or tap the button to insert a saved text..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
                      rows={4}
                    />
                    <QuickTextPicker
                      texts={texts}
                      onInsert={(text) => setDemoText(demoText + text)}
                      trigger={
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-900  focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                          <Plus className="h-4 w-4" />
                          Insert saved text
                        </button>
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {selectedText ? 'Edit quick text' : 'Create quick text'}
                    </h2>
                    <p className="text-sm text-slate-600">
                      Give it a clear name, weave in tokens, and decide where it should appear across the workspace.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800 focus-visible:outline-offset-2 focus-visible:outline-black/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-900 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? 'Saving...' : selectedText ? 'Update text' : 'Save text'}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-900">
                      Name <span className="text-slate-900">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={150}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15 ${
                        errors.name ? 'border-black bg-zinc-100' : 'border-slate-200 bg-white/80'
                      }`}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 text-sm text-slate-800">{errors.name}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">{formData.name.length}/150 characters</p>
                  </div>

                  <div>
                    <label htmlFor="content" className="mb-2 block text-sm font-semibold text-slate-900">
                      Content <span className="text-slate-900">*</span>
                    </label>

                    {/* Token Toolbar */}
                    <div className="relative mb-3" ref={tokenDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                        className="inline-flex  items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-black hover:text-slate-800 cursor-pointer focus-visible:outline-offset-2 focus-visible:outline-black/15"
                        aria-expanded={showTokenDropdown}
                        aria-haspopup="true"
                      >
                        Insert token
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      {showTokenDropdown && (
                        <div className="absolute top-full z-10 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                          {TOKENS.map((token) => (
                            <button
                              key={token.value}
                              type="button"
                              onClick={() => insertToken(token.value)}
                              className="w-full px-4 py-2 cursor-pointer text-left text-sm text-slate-700 transition hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                            >
                              <div className="font-medium text-slate-900">{token.label}</div>
                              <div className="font-mono text-xs text-slate-500">{token.value}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <textarea
                      id="content"
                      ref={contentRef}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15 ${
                        errors.content ? 'border-black bg-zinc-100' : 'border-slate-200 bg-white/80'
                      }`}
                      aria-invalid={errors.content ? 'true' : 'false'}
                      aria-describedby={errors.content ? 'content-error' : undefined}
                    />
                    {errors.content && (
                      <p id="content-error" className="mt-1 text-sm text-slate-800">{errors.content}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">{formData.content.length} characters</p>
                  </div>

                  <div>
                    <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-900">
                      Description
                    </label>
                    <input
                      id="description"
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label htmlFor="formCategory" className="mb-2 block text-sm font-semibold text-slate-900">
                        Category
                      </label>
                      <select
                        id="formCategory"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-xl cursor-pointer border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                   <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-900">
                        Set as default
                      </label>
                      <div className="inline-flex w-full items-start gap-4">
                        <label className="flex cursor-pointer items-center gap-2 pt-1">
                          <span className={`text-[10px] font-semibold uppercase tracking-wide transition ${
                            formData.is_default ? 'text-slate-400' : 'text-slate-900'
                          }`}>
                            Off
                          </span>
                          <input
                            type="checkbox"
                            checked={formData.is_default}
                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                            className="sr-only"
                          />
                          <span className={`relative inline-flex cursor-pointer h-6 w-12 items-center rounded-full border transition duration-200 ${
                            formData.is_default 
                              ? 'border-black bg-black' 
                              : 'border-slate-300 bg-white'
                          }`}>
                            <span className={`h-4 w-4 rounded-full shadow transition-all duration-200 ${
                              formData.is_default 
                                ? 'translate-x-7 bg-white shadow-lg' 
                                : 'translate-x-1 bg-slate-400'
                            }`}></span>
                          </span>
                          <span className={`text-[10px] font-semibold uppercase tracking-wide transition ${
                            formData.is_default ? 'text-slate-900' : 'text-slate-400'
                          }`}>
                            On
                          </span>
                        </label>
                        <span className="flex-1 text-sm text-slate-700">
                          {formData.is_default
                            ? 'This saved text will appear first wherever a default quick text is used.'
                            : 'Switch on to make this quick text the default suggestion for your team.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Available for
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {AVAILABLE_FOR_OPTIONS.map(option => (
                        <label key={option} className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:border-black">
                          <input
                            type="checkbox"
                            checked={formData.available_for.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, available_for: [...formData.available_for, option] });
                              } else {
                                setFormData({ ...formData, available_for: formData.available_for.filter(o => o !== option) });
                              }
                            }}
                            className="h-4 w-4 rounded cursor-pointer border-slate-300 text-black focus:ring-black"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">Live preview</h3>
                      <button
                        type="button"
                        onClick={copyPreview}
                        disabled={!formData.content}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-black focus-visible:outline-offset-2 focus-visible:outline-black/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {copiedPreview ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy preview
                          </>
                        )}
                      </button>
                    </div>

                    <div className="min-h-24 rounded-xl border border-slate-200/70 bg-slate-50/80 p-4">
                      {formData.content ? (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
                          {renderPreview()}
                        </div>
                      ) : (
                        <p className="text-sm italic text-slate-500">
                          Enter content above to preview tokens with Salesforce-style chips.
                        </p>
                      )}
                    </div>

                    {formData.content && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-zinc-100 p-3">
                        <p className="mb-1 text-xs font-semibold text-slate-800">Rendered output</p>
                        <p className="text-sm text-slate-700">{renderTokens(formData.content)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-2xl">
            <h2 id="delete-dialog-title" className="text-2xl font-semibold text-slate-900">
              Delete saved text
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to remove "{deleteConfirm.name}"? This action cannot be undone for your team.
            </p>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full cursor-pointer bg-black px-5 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-900  focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
