// =====================================================
// FILE: src/components/Email/EmailDetail.jsx
// Modal-style email detail card
// =====================================================

import React from 'react';
import {
  Star,
  Archive,
  Trash2,
  MoreVertical,
  X,
  Paperclip,
  UserPlus,
  CheckSquare,
  Tag,
  Link2,
  Download,
  Send,
  Reply,
  ReplyAll,
  CornerUpRight
} from 'lucide-react';

const crmActions = [
  {
    label: 'Convert to Lead',
    description: 'Create a CRM lead instantly',
    icon: UserPlus
  },
  {
    label: 'Create Task',
    description: 'Assign follow-up work',
    icon: CheckSquare
  },
  {
    label: 'Link Contact',
    description: 'Attach to an existing record',
    icon: Link2
  },
  {
    label: 'Tag Campaign',
    description: 'Categorize for reporting',
    icon: Tag
  }
];

const replyModes = [
  { label: 'Reply', icon: Reply },
  { label: 'Reply All', icon: ReplyAll },
  { label: 'Forward', icon: CornerUpRight }
];

const toolbarButtons = [
  { label: 'Archive', icon: Archive },
  { label: 'Delete', icon: Trash2 },
  { label: 'More', icon: MoreVertical }
];

const getFileExtension = filename => filename?.split('.').pop()?.toUpperCase() || '';

const EmailDetail = ({ email, onClose, onToggleStar, variant = 'panel' }) => {
  if (!email) {
    const emptyClasses =
      variant === 'modal'
        ? 'flex h-full w-full items-center justify-center bg-slate-50 p-10 text-center'
        : 'flex-1 w-full border-l border-slate-100 bg-slate-50 flex items-center justify-center text-center p-10';

    return (
      <section className={emptyClasses}>
        <div>
          <p className="text-lg font-semibold text-slate-800">No email selected</p>
          <p className="text-sm text-slate-500 mt-2">Choose a message to view its details.</p>
        </div>
      </section>
    );
  }

  const baseThread = Array.isArray(email.thread) ? email.thread : [];
  const rootAttachments = Array.isArray(email.attachments) ? email.attachments : [];
  const fallbackBody = typeof email.body === 'string' ? email.body.trim() : '';
  const fallbackMessage =
    baseThread.length === 0 && fallbackBody
      ? [
        {
          id: email.id ?? email.message_id ?? 'primary',
          sender: email.sender ?? email.from ?? email.email ?? 'Unknown Sender',
          email: email.email ?? email.from ?? '',
          body: fallbackBody,
          timestamp: email.raw?.received_at_human ?? email.timestamp ?? '',
          type: 'inbound',
          attachments: rootAttachments,
        },
      ]
      : [];
  const conversationThread = baseThread.length > 0 ? baseThread : fallbackMessage;
  const conversationAttachments = conversationThread.flatMap(message => message.attachments || []);
  const allAttachments =
    baseThread.length > 0 ? [...rootAttachments, ...conversationAttachments] : rootAttachments;
  const labels = Array.isArray(email.labels) ? email.labels : [];
  const senderInitial = email.sender?.[0]?.toUpperCase() ?? '?';
  const wrapperClasses = {
    modal: 'flex h-full flex-col  rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden',
    drawer: 'flex h-full w-full flex-col bg-white shadow-2xl border-l border-slate-200',
    panel: 'flex-1 w-full border-l border-slate-100 bg-white flex flex-col min-h-0'
  }[variant] ?? 'flex-1 w-full border-l border-slate-100 bg-white flex flex-col min-h-0';

  const renderBody = body => {
    if (!body) return null;
    const containsHTML = /<\/?[a-z][\s\S]*>/i.test(body);

    if (containsHTML) {
      return (
        <div
          className="text-sm leading-relaxed text-slate-700 space-y-3 break-words [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:pl-5 [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      );
    }

    return <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">{body}</p>;
  };

  const [activeReplyMode, setActiveReplyMode] = React.useState(null);
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    setActiveReplyMode(null);
    setComposerOpen(false);
    setDraft('');
  }, [email?.id]);

  const focusComposer = () => {
    if (!textareaRef.current) return;
    const focus = () => textareaRef.current && textareaRef.current.focus();
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(focus);
    } else {
      setTimeout(focus, 0);
    }
  };

  const handleReplyModeSelect = mode => {
    setActiveReplyMode(mode.label);
    setComposerOpen(true);
    focusComposer();
  };

  return (
    <section className={wrapperClasses}>
      <div className="flex-1 min-h-0 overflow-y-auto email-scroll email-detail-scroll">
        <header className="px-5 sm:px-6 lg:px-8 py-4  border-b border-slate-100 bg-slate-50 flex flex-wrap items-center gap-3 justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Inbox / Campaign Updates</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              {email.subject || 'No subject'}
            </h1>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <button
              onClick={onToggleStar}
              className="p-2.5 rounded-xl border border-transparent hover:border-yellow-200 hover:bg-yellow-50 transition-colors"
              title="Star"
            >
              <Star
                className={`w-5 h-5 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'
                  }`}
              />
            </button>
            {toolbarButtons.map(button => {
              const Icon = button.icon;
              return (
                <button
                  key={button.label}
                  className="p-2.5 rounded-xl text-slate-500 hover:bg-white transition-colors"
                  title={button.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
            <button
              onClick={onClose}
              className="p-2.5 cursor-pointer rounded-xl text-slate-500 hover:bg-white transition-colors"
              aria-label="Close detail"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="px-5 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Sender Summary */}
          <section className="rounded-md border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-indigo-100 text-indigo-600 font-semibold flex items-center justify-center">
                {senderInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-900">{email.sender}</p>
                <p className="text-sm text-slate-500">{email.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{email.timestamp}</p>
                <p className="text-xs text-slate-400">Today</p>
              </div>
            </div>
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {labels.map((label, idx) => (
                  <span
                    key={`${label}-${idx}`}
                    className="px-3 py-1 text-xs font-semibold rounded-full border border-slate-200 bg-slate-50 text-slate-600"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Conversation */}
          <section className="rounded-md border border-slate-200 bg-white shadow-sm p-5 conversation-scroll email-scroll">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">Conversation</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {conversationThread.length} touchpoint
                  {conversationThread.length === 1 ? '' : 's'} captured below in chronological order.
                </p>
              </div>
              <span className="text-xs text-slate-500">Newest last</span>
            </div>
            <div className="mt-6 relative">
              <span className="absolute left-6 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-6 pl-10">
                {conversationThread.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-4">No conversation history yet.</div>
                ) : (
                  conversationThread.map((message, index) => {
                    const messageAttachments = Array.isArray(message.attachments) ? message.attachments : [];
                    const messageInitial = message.sender?.[0]?.toUpperCase() ?? message.email?.[0] ?? '?';
                    const isOutbound = message.type === 'outbound';
                    const badgeClasses = isOutbound
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    const cardClasses = isOutbound
                      ? 'border-indigo-100 bg-indigo-50/40'
                      : 'border-slate-200 bg-slate-50/70';
                    const badgeLabel = isOutbound ? 'You replied' : `${message.sender?.split(' ')[0] || 'Contact'} wrote`;

                    return (
                      <article key={message.id} className="relative">
                        <span className="absolute -left-9 top-5 w-4 h-4 rounded-full border-4 border-white bg-indigo-500" />
                        <div className={`rounded-xl border ${cardClasses} p-4 space-y-3`}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 font-semibold flex items-center justify-center">
                                {messageInitial}
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                                  Step {index + 1}
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-slate-900">{message.sender}</p>
                                  <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${badgeClasses}`}>
                                    {badgeLabel}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">{message.email}</p>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">{message.timestamp}</span>
                          </div>
                          {renderBody(message.body)}

                          {messageAttachments.length > 0 && (
                            <div className="space-y-2">
                              {messageAttachments.map((att, idx) => (
                                <div
                                  key={`${message.id}-${idx}`}
                                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-white border border-dashed border-slate-200"
                                >
                                  <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{att.name}</p>
                                    {att.size && <p className="text-xs text-slate-500">{att.size}</p>}
                                  </div>
                                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                                    Download
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Attachments */}
          {allAttachments.length > 0 && (
            <section className="rounded-md border border-slate-200 bg-white shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <p className="text-base font-semibold text-slate-900">Attachments · {allAttachments.length}</p>
                <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold">
                  <Download className="w-4 h-4" />
                  Download all
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allAttachments.map((attachment, idx) => (
                  <div
                    key={`${attachment.name ?? 'attachment'}-${idx}`}
                    className="flex items-center gap-3 px-3 py-3 rounded-md bg-slate-50 border border-slate-200"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white text-indigo-600 text-xs font-semibold flex items-center justify-center">
                      {getFileExtension(attachment.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {attachment.name || 'Attachment'}
                      </p>
                      {attachment.size && <p className="text-xs text-slate-500">{attachment.size}</p>}
                    </div>
                    <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CRM Actions */}
          <section className="rounded-md border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                CRM Actions
              </p>
              <span className="text-xs text-slate-400">Stay synced</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {crmActions.map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className="flex items-center gap-3 px-4 py-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-white transition-all text-left"
                  >
                    <span className="w-10 h-10 rounded-md bg-white border border-slate-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                      <p className="text-xs text-slate-500">{action.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* Reply */}
      <section className="border-t border-slate-100 bg-slate-50 px-5 sm:px-6 lg:px-8 py-5 space-y-4">
        {composerOpen ? (
          <div className="rounded-md border border-slate-200 bg-white shadow-sm focus-within:border-indigo-200 focus-within:shadow-md transition">
            <textarea
              ref={textareaRef}
              placeholder={`Write your ${activeReplyMode?.toLowerCase() || 'reply'}...`}
              className="w-full p-4 text-sm text-slate-700 resize-none min-h-[160px] focus:outline-none bg-transparent"
              rows="5"
              value={draft}
              onChange={e => setDraft(e.target.value)}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                <Paperclip className="w-4 h-4" />
                Attach file
              </button>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-white">
                  Save Draft
                </button>
                <button
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!draft.trim()}
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/80 px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Select a reply action to start composing.</p>
              <p className="text-sm text-slate-500">Choose Reply, Reply All or Forward above.</p>
            </div>
            <button
              type="button"
              onClick={() => handleReplyModeSelect(replyModes[0])}
              className="self-start sm:self-auto px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700"
            >
              Quick Reply
            </button>
          </div>
        )}
      </section>
    </section>
  );
};

export default EmailDetail;
