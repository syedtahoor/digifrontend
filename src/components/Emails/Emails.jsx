// =====================================================
// FILE: src/components/Email/Emails.jsx
// Main Email Page Component (live data)
// =====================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import { Search, RefreshCw, Filter, Menu } from 'lucide-react';
import axiosMethods from '../../../axiosConfig';

const POLLING_INTERVAL = 15000; // 15 seconds keeps UI in sync with the scheduler
const EMAIL_CACHE_KEY = 'emails_cache_v1';
const CACHE_WINDOW_MS = 1000 * 60 * 30; // 30 minutes cache window

const formatReceivedTimestamp = isoString => {
  if (!isoString) return '--';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '--';

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  const options = sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' };

  return date.toLocaleDateString([], options);
};

const cleanLabel = value => (typeof value === 'string' ? value.replace(/["']/g, '').trim() : '');

const toTitle = value =>
  cleanLabel(value)
    .replace(/[_\-.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

const extractInlineName = raw => {
  if (!raw || typeof raw !== 'string') return '';
  const match = raw.match(/^(.*?)</);
  if (match?.[1]) {
    return cleanLabel(match[1]);
  }
  return '';
};

const deriveBrandFromEmail = emailAddress => {
  if (!emailAddress || typeof emailAddress !== 'string') return '';
  const domain = emailAddress.split('@')[1];
  if (!domain) return '';
  const domainParts = domain.split('.').filter(Boolean);
  if (!domainParts.length) return '';
  const core = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : domainParts[0];
  return toTitle(core);
};

const deriveSenderName = payload => {
  const byExplicitName = cleanLabel(payload?.from_name);
  if (byExplicitName) return byExplicitName;

  const inlineName = extractInlineName(payload?.from);
  if (inlineName) return inlineName;

  const brand = deriveBrandFromEmail(payload?.from_email || payload?.from);
  if (brand) return brand;

  const subjectFallback = cleanLabel(payload?.subject);
  if (subjectFallback) return subjectFallback;

  return 'Unknown Sender';
};

const createEmailViewModel = payload => {
  const safeBody = typeof payload?.body === 'string' ? payload.body : '';
  const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
  const hasAttachment = attachments.length > 0;
  const previewSource = payload?.snippet || safeBody.replace(/\s+/g, ' ').trim();
  const sender = deriveSenderName(payload);
  const subject = cleanLabel(payload?.subject) || '(No subject)';
  const emailAddress = payload?.from_email || payload?.from || '';

  return {
    id: payload?.id,
    imap_uid: payload?.imap_uid,
    sender,
    email: emailAddress,
    subject,
    preview: previewSource ? previewSource.slice(0, 160) : '',
    timestamp: formatReceivedTimestamp(payload?.received_at),
    isUnread: !payload?.seen,
    isStarred: Boolean(payload?.isStarred),
    labels: Array.isArray(payload?.labels) ? payload.labels : [],
    hasAttachment,
    thread: [],
    attachments,
    body: safeBody,
    receivedAt: payload?.received_at,
    raw: payload,
  };
};

const sortEmailsByReceivedAt = emails =>
  [...emails].sort((a, b) => {
    const aTime = a?.receivedAt ? new Date(a.receivedAt).getTime() : 0;
    const bTime = b?.receivedAt ? new Date(b.receivedAt).getTime() : 0;
    if (bTime !== aTime) {
      return bTime - aTime;
    }
    const aKey = a?.imap_uid ?? a?.id ?? 0;
    const bKey = b?.imap_uid ?? b?.id ?? 0;
    return bKey - aKey;
  });

const mergeEmailLists = (existing, incoming) => {
  const map = new Map();
  incoming.forEach(email => {
    const key = email.imap_uid ?? email.id;
    if (key == null) return;
    map.set(key, email);
  });
  existing.forEach(email => {
    const key = email.imap_uid ?? email.id;
    if (key == null || map.has(key)) return;
    map.set(key, email);
  });
  return sortEmailsByReceivedAt(Array.from(map.values()));
};

const Emails = () => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const detailTimer = useRef();
  const pollTimerRef = useRef();
  const latestUidRef = useRef(0);
  const emailsSnapshotRef = useRef([]);

  const persistEmailsCache = useCallback((emailsToStore, latestUidValue) => {
    try {
      sessionStorage.setItem(
        EMAIL_CACHE_KEY,
        JSON.stringify({
          emails: emailsToStore,
          latestUid: typeof latestUidValue === 'number' ? latestUidValue : latestUidRef.current ?? 0,
          cachedAt: Date.now(),
        })
      );
    } catch (error) {
      console.warn('Failed to cache emails:', error);
    }
  }, []);

  const commitEmails = useCallback(
    (updater, options = {}) => {
      setEmails(prevEmails => {
        const nextEmails = typeof updater === 'function' ? updater(prevEmails) : updater;
        emailsSnapshotRef.current = nextEmails;
        if (options.persist) {
          persistEmailsCache(nextEmails, options.latestUid);
        }
        return nextEmails;
      });
    },
    [persistEmailsCache]
  );

  const toggleStar = id => {
    commitEmails(prevEmails =>
      prevEmails.map(email =>
        email.id === id ? { ...email, isStarred: !email.isStarred } : email
      )
    );

    setSelectedEmail(prev =>
      prev && prev.id === id ? { ...prev, isStarred: !prev.isStarred } : prev
    );
  };

  const toggleSelect = id => {
    setSelectedItems(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const selectAll = () => {
    setSelectedItems(prev =>
      prev.length === emails.length ? [] : emails.map(email => email.id)
    );
  };

  const animateDrawerOpen = () => {
    setDetailOpen(false);
    const openDrawer = () => setDetailOpen(true);
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(openDrawer);
    } else {
      setTimeout(openDrawer, 0);
    }
  };

  const fetchEmails = useCallback(
    async ({ mode = 'initial' } = {}) => {
      if (mode === 'initial' && emailsSnapshotRef.current.length === 0) {
        setIsInitialLoading(true);
      }
      if (mode === 'refresh') {
        setIsRefreshing(true);
      }
      if (mode !== 'poll') {
        setFetchError('');
      }

      const params = { limit: 50 };
      if (mode === 'poll') {
        params.after_uid = latestUidRef.current ?? 0;
      }

      try {
        const response = await axiosMethods.get('/emails', params);
        const rows = Array.isArray(response?.data) ? response.data : [];
        const viewModels = rows.map(createEmailViewModel);

        const metaUid =
          typeof response?.meta?.latest_uid === 'number'
            ? response.meta.latest_uid
            : rows.reduce(
                (max, row) => Math.max(max, row?.imap_uid ?? 0),
                latestUidRef.current ?? 0
              );

        latestUidRef.current = metaUid ?? latestUidRef.current ?? 0;

        if (mode === 'poll') {
          if (viewModels.length === 0) {
            return;
          }
          commitEmails(
            prevEmails => mergeEmailLists(prevEmails, viewModels),
            { persist: true, latestUid: metaUid }
          );
        } else {
          const sorted = sortEmailsByReceivedAt(viewModels);
          commitEmails(sorted, { persist: true, latestUid: metaUid });
        }
      } catch (error) {
        if (mode !== 'poll') {
          const fallback = 'Unable to load emails right now.';
          const message =
            error?.response?.data?.message ||
            error?.message ||
            fallback;
          setFetchError(message);
        }
        console.error('Failed to fetch emails:', error);
      } finally {
        if (mode === 'initial') {
          setIsInitialLoading(false);
        }
        if (mode === 'refresh') {
          setIsRefreshing(false);
        }
      }
    },
    [commitEmails]
  );

  useEffect(() => {
    try {
      const cachedRaw = sessionStorage.getItem(EMAIL_CACHE_KEY);
      if (!cachedRaw) {
        return;
      }

      const cached = JSON.parse(cachedRaw);
      if (!cached || !Array.isArray(cached.emails) || cached.emails.length === 0) {
        if (typeof cached?.latestUid === 'number') {
          latestUidRef.current = cached.latestUid;
        }
        return;
      }

      if (cached.cachedAt && Date.now() - cached.cachedAt > CACHE_WINDOW_MS) {
        sessionStorage.removeItem(EMAIL_CACHE_KEY);
        return;
      }

      const normalized = sortEmailsByReceivedAt(cached.emails);
      commitEmails(normalized);
      setIsInitialLoading(false);
      if (typeof cached.latestUid === 'number') {
        latestUidRef.current = cached.latestUid;
      }
    } catch (error) {
      console.warn('Failed to hydrate cached emails:', error);
    }
  }, [commitEmails]);

  useEffect(() => {
    fetchEmails({ mode: 'initial' });
  }, [fetchEmails]);

  useEffect(() => {
    pollTimerRef.current = setInterval(() => {
      fetchEmails({ mode: 'poll' });
    }, POLLING_INTERVAL);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [fetchEmails]);

  useEffect(() => {
    return () => {
      if (detailTimer.current) {
        clearTimeout(detailTimer.current);
        detailTimer.current = undefined;
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedEmail) return;
    const updatedSelection = emails.find(email => email.id === selectedEmail.id);
    if (updatedSelection && updatedSelection !== selectedEmail) {
      setSelectedEmail(updatedSelection);
    }
  }, [emails, selectedEmail]);

  useEffect(() => {
    setSelectedItems(prev => {
      if (prev.length === 0) return prev;
      const allowedIds = new Set(emails.map(email => email.id));
      const filtered = prev.filter(id => allowedIds.has(id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [emails]);

  const handleEmailClick = email => {
    if (detailTimer.current) {
      clearTimeout(detailTimer.current);
      detailTimer.current = undefined;
    }

    const updatedEmail = email.isUnread ? { ...email, isUnread: false } : email;
    const isOpeningFresh = !selectedEmail;

    setSelectedEmail(updatedEmail);

    if (isOpeningFresh) {
      animateDrawerOpen();
    } else {
      setDetailOpen(true);
    }

    if (email.isUnread) {
      commitEmails(prevEmails =>
        prevEmails.map(item => (item.id === email.id ? updatedEmail : item))
      );
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    if (detailTimer.current) {
      clearTimeout(detailTimer.current);
    }
    detailTimer.current = setTimeout(() => {
      setSelectedEmail(null);
      detailTimer.current = undefined;
    }, 320);
  };

  const handleRefreshClick = () => {
    if (isRefreshing) return;
    fetchEmails({ mode: 'refresh' });
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/90 backdrop-blur border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails, contacts, campaigns..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-60"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              title="Refresh inbox"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          <EmailList
            emails={emails}
            selectedEmail={selectedEmail}
            selectedItems={selectedItems}
            onEmailClick={handleEmailClick}
            onToggleStar={toggleStar}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            isLoading={isInitialLoading}
            errorMessage={fetchError}
            onRetry={() => fetchEmails({ mode: 'refresh' })}
          />

          {selectedEmail && (
            <>
              <div
                className={`fixed inset-0 z-30 bg-gradient-to-br from-gray-800/40 via-gray-700/25 to-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${
                  detailOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={handleCloseDetail}
              />
              <aside className="fixed inset-0 z-40 flex justify-end pointer-events-none">
                <div
                  className={`pointer-events-auto h-full w-full bg-transparent transition-transform duration-300 transform ${
                    detailOpen ? 'translate-x-0' : 'translate-x-full'
                  }`}
                >
                  <EmailDetail
                    email={selectedEmail}
                    onClose={handleCloseDetail}
                    onToggleStar={() => selectedEmail && toggleStar(selectedEmail.id)}
                    variant="drawer"
                  />
                </div>
              </aside>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emails;
