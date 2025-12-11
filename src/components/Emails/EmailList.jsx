// =====================================================
// FILE: src/components/Email/EmailList.jsx
// Email List - Shows all emails with selection
// =====================================================

import React from 'react';
import { Archive, Trash2, Star, Paperclip, Reply, Forward } from 'lucide-react';

const EmailList = ({
  emails,
  selectedEmail,
  selectedItems,
  onEmailClick,
  onToggleStar,
  onToggleSelect,
  onSelectAll,
  isLoading = false,
  errorMessage = '',
  onRetry
}) => {
  const allSelected = emails.length > 0 && selectedItems.length === emails.length;

  return (
    <div className="flex-1 min-h-0 h-full w-full px-3 sm:px-6 lg:px-3 py-2 box-border">
      <div className="flex flex-col h-full max-w-7xl mx-auto bg-white/95 border border-slate-200 rounded-md  shadow-sm overflow-hidden">
        {/* List Header */}
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div className="text-sm font-semibold text-slate-800">Inbox</div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>{emails.filter(email => email.isUnread).length} unread</span>
            </div>
          </div>

          {selectedItems.length > 0 ? (
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                {selectedItems.length} selected
              </button>
              <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" title="Archive">
                <Archive className="w-4 h-4 text-slate-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Sort</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Newest first</span>
            </div>
          )}
        </div>

        {/* Email Items */}
        <div className="flex-1 overflow-y-auto email-scroll">
          {isLoading ? (
            <ListState message="Fetching latest emails..." isLoading />
          ) : errorMessage ? (
            <ListState
              message={errorMessage}
              isError
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : emails.length === 0 ? (
            <ListState message="No emails synced yet. They will appear here automatically as soon as your fetcher stores them." />
          ) : (
            <div className="divide-y divide-slate-100">
              {emails.map(email => (
                <EmailItem
                  key={email.id}
                  email={email}
                  isSelected={selectedItems.includes(email.id)}
                  onSelect={() => onToggleSelect(email.id)}
                  onStar={() => onToggleStar(email.id)}
                  onClick={() => onEmailClick(email)}
                  isActive={selectedEmail?.id === email.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Email Item Component (kept in same file to reduce files)
const EmailItem = ({ email, isSelected, onSelect, onStar, onClick, isActive }) => {
  const baseActions = [
    { Icon: Reply, label: 'Reply' },
    { Icon: Forward, label: 'Forward' },
    { Icon: Archive, label: 'Archive' },
    { Icon: Trash2, label: 'Delete' }
  ];

  const handleActionClick = event => {
    event.stopPropagation();
  };

  const renderActions = extraClasses => (
    <>
      {baseActions.map(({ Icon, label }) => (
        <button
          key={label}
          className={`p-1.5 rounded transition-colors text-gray-600 hover:bg-gray-200 ${extraClasses}`}
          title={label}
          onClick={handleActionClick}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </>
  );

  return (
    <article
      className={`group relative px-4 sm:px-6 py-4 cursor-pointer transition-colors ${
        isActive ? 'bg-indigo-50/60' : isSelected ? 'bg-blue-50/60' : 'bg-white'
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={e => {
            e.stopPropagation();
            onSelect();
          }}
          className="mt-1.5 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p
                className={`text-sm ${
                  email.isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                }`}
              >
                {email.sender}
              </p>
              <p
                className={`text-xs ${
                  email.isUnread ? 'text-slate-700' : 'text-slate-500'
                }`}
              >
                {email.email}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {email.isUnread && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
              <span>{email.timestamp}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={e => {
                e.stopPropagation();
                onStar();
              }}
              className="p-1 rounded-full border border-transparent hover:border-yellow-200 hover:bg-yellow-50 transition-colors"
            >
              <Star
                className={`w-5 h-5 ${
                  email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                }`}
              />
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${
                  email.isUnread ? 'font-medium text-slate-900' : 'text-slate-700'
                } truncate`}
              >
                {email.subject}
              </p>
              <p className="text-sm text-slate-500 truncate">{email.preview}</p>
            </div>
            {email.hasAttachment && <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />}
          </div>

          {email.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {email.labels.map((label, idx) => (
                <span key={idx} className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className="hidden md:flex items-center space-x-1 ml-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
          onClick={handleActionClick}
        >
          {renderActions('')}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 md:hidden" onClick={handleActionClick}>
        {renderActions('bg-gray-100')}
      </div>
    </article>
  );
};

export default EmailList;

const ListState = ({ message, isLoading = false, isError = false, actionLabel, onAction }) => (
  <div className="h-full min-h-[240px] flex flex-col items-center justify-center gap-3 px-6 text-center">
    <p
      className={`text-sm ${isError ? 'text-red-500' : 'text-slate-500'} ${
        isLoading ? 'animate-pulse' : ''
      }`}
    >
      {message}
    </p>
    {onAction && (
      <button
        className="px-4 py-1.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
        onClick={onAction}
      >
        {actionLabel || 'Retry'}
      </button>
    )}
  </div>
);
