import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ThumbsUp, ThumbsDown, Phone, Mail, Edit, FileText, DollarSign, Calendar, ShoppingBag, CheckSquare, PhoneCall, CalendarPlus, ChevronRight, ChevronDown, MessageCircle, Check, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosMethods from '../../../axiosConfig';
import CreateTask from './CreateTask';
import CreateNewEvent from './CreateNewEvent';
import CreateCallLog from './CreateCallLog';
import Email from './Email';

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

const LOG_CALL_INITIAL_STATE = {
  subject: '',
  callType: 'Outbound',
  callDuration: '',
  callDateTime: '',
  comments: '',
  followUpTask: false,
  followUpDueDate: '',
  followUpNotes: '',
};

const TASK_FORM_INITIAL_STATE = {
  subject: '',
  taskSubtype: 'Task',
  assignedTo: 'Me',
  dueDate: '',
  name: '',
  relatedTo: '',
  comments: '',
  priority: 'Normal',
  status: 'Not Started',
  reminderSet: true,
  reminderDateTime: '',
  recurring: false,
  recurrenceType: 'Daily',
  recurrenceInterval: '1',
  recurrenceDaysOfWeek: [],
  recurrenceStartDate: '',
  recurrenceEndDate: '',
};

const EVENT_FORM_INITIAL_STATE = {
  subject: '',
  event_type: 'Meeting',
  assignedTo: 'Me',
  start_datetime: '',
  end_datetime: '',
  location: '',
  relatedTo: '',
  description: '',
  all_day: false,
  set_reminder: true,
  reminder_datetime: '',
  attendees_enabled: false,
  attendees: [],
};

const EMAIL_FORM_INITIAL_STATE = {
  from: '',
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
};

const ACTIVITY_TYPE_STYLES = {
  task: {
    icon: CheckSquare,
    labels: {
      upcoming: 'You have an upcoming Task',
      overdue: 'This task is overdue',
      past: 'You had a Task',
    },
  },
  event: {
    icon: Calendar,
    labels: {
      upcoming: 'You have an upcoming Event',
      overdue: 'This event has passed',
      past: 'You had an Event',
    },
  },
  call: {
    icon: Phone,
    labels: {
      upcoming: 'You have a scheduled Call',
      overdue: 'This call is overdue',
      past: 'You logged a Call',
    },
  },
  email: {
    icon: Mail,
    labels: {
      upcoming: 'Prepare to send an Email',
      overdue: 'This email is pending',
      past: 'You sent an Email',
    },
  },
  default: {
    icon: MessageCircle,
    labels: {
      upcoming: 'Scheduled activity',
      overdue: 'This activity is overdue',
      past: 'You had an activity',
    },
  },
};

const getActivityConfig = (type) => ACTIVITY_TYPE_STYLES[type] || ACTIVITY_TYPE_STYLES.default;

const padUnit = (value) => String(value).padStart(2, '0');

const toDatetimeLocal = (date) => {
  return `${date.getFullYear()}-${padUnit(date.getMonth() + 1)}-${padUnit(date.getDate())}T${padUnit(date.getHours())}:${padUnit(date.getMinutes())}`;
};

const toDateInput = (date) => {
  return `${date.getFullYear()}-${padUnit(date.getMonth() + 1)}-${padUnit(date.getDate())}`;
};

const createEmptyAttendee = () => ({
  name: '',
  email: '',
  phone: '',
});

const buildTaskFormDefaults = (client, { primaryAccountName } = {}) => {
  const now = new Date();
  return {
    ...TASK_FORM_INITIAL_STATE,
    subject: client?.name ? `Follow up with ${client.name}` : '',
    name: client?.name || '',
    relatedTo: primaryAccountName || client?.company || client?.name || '',
    dueDate: toDateInput(now),
    reminderDateTime: toDatetimeLocal(now),
    recurrenceStartDate: toDatetimeLocal(now),
    recurrenceEndDate: '',
  };
};

const buildEventFormDefaults = (client, { primaryAccountName } = {}) => {
  const start = new Date();
  const remainder = start.getMinutes() % 30;

  if (remainder !== 0) {
    start.setMinutes(start.getMinutes() + (30 - remainder), 0, 0);
  }

  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const reminder = new Date(start.getTime() - 15 * 60 * 1000);

  return {
    ...EVENT_FORM_INITIAL_STATE,
    subject: client?.name ? `Event with ${client.name}` : '',
    relatedTo: primaryAccountName || client?.company || client?.name || '',
    start_datetime: toDatetimeLocal(start),
    end_datetime: toDatetimeLocal(end),
    reminder_datetime: toDatetimeLocal(reminder),
    attendees: [createEmptyAttendee()],
  };
};

const buildEmailFormDefaults = (client, contacts = []) => {
  const primaryContact = contacts.find((contact) => contact.email) || null;
  const fallbackLead = client?.lead || {};

  return {
    ...EMAIL_FORM_INITIAL_STATE,
    to: primaryContact?.email || fallbackLead?.email || client?.email || '',
    subject: client?.name ? `Follow up with ${client.name}` : '',
  };
};

const formatDateTimeForApi = (value) => {
  if (!value) return null;
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) {
    return null;
  }
  const normalizedTime = timePart.length === 5 ? `${timePart}:00` : timePart;
  return `${datePart} ${normalizedTime}`;
};

const formatDateForApi = (value) => {
  if (!value) return null;
  return `${value} 00:00:00`;
};

const getFirstValidationMessage = (error) => {
  const validationErrors = error?.response?.data?.errors;
  if (validationErrors && typeof validationErrors === 'object') {
    const firstKey = Object.keys(validationErrors)[0];
    const firstMessage = validationErrors[firstKey]?.[0];
    if (firstMessage) {
      return firstMessage;
    }
  }
  return null;
};

const ActivityTimelineList = ({ items, emptyTitle, emptyDescription }) => {
  if (!items?.length) {
    return (
      <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-left">
        <p className="text-sm font-semibold text-gray-500">{emptyTitle}</p>
        <p className="mt-2 text-xs text-gray-400">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-0">
      {items.map((item, index) => {
        const config = getActivityConfig(item.type);
        const isLast = index === items.length - 1;
        const IconComponent = config.icon;

        const iconBgColor =
          item.type === 'task' ? 'bg-green-500' :
            item.type === 'event' ? 'bg-pink-500' :
              item.type === 'call' ? 'bg-blue-400' :
                item.type === 'email' ? 'bg-purple-500' :
                  'bg-gray-400';

        return (
          <li key={item.id || `${item.type}-${index}`} className="flex gap-0 group hover:bg-gray-50">
            <div className="relative flex items-start pt-4 pl-1">
              <button
                type="button"
                aria-label="Toggle activity details"
                className="text-gray-400 transition hover:text-gray-600 z-10"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="relative flex flex-col items-center pt-3 px-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded ${iconBgColor} text-white z-10`}>
                <IconComponent className="h-5 w-5" />
              </div>
              {!isLast && (
                <div className={`absolute top-12 bottom-0 w-0.5 ${iconBgColor}`} style={{ left: '50%', transform: 'translateX(-50%)' }} />
              )}
            </div>

            <div className="flex-1 flex items-start justify-between py-3 pr-4 border-b border-gray-100">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 underline cursor-pointer">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-600">{item.description}</p>
                {item.meta?.length ? (
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                    {item.meta.map((meta, metaIndex) => (
                      <span key={`${item.id || index}-meta-${metaIndex}`}>{meta}</span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex items-start gap-2 ml-4">
                <div className="text-right text-xs text-gray-700">
                  {item.dateLabel && (
                    <div className="font-medium">{item.dateLabel}</div>
                  )}
                  {item.timeLabel && (
                    <div className="text-gray-500">{item.timeLabel}</div>
                  )}
                  {item.relativeLabel && (
                    <div className="text-gray-500">{item.relativeLabel}</div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Open activity options"
                  className="text-gray-400 transition hover:text-gray-600 mt-0.5"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const getActivityDescriptor = (type, status) => {
  const config = getActivityConfig(type);
  const labels = config.labels || {};
  return labels[status] || labels.upcoming || '';
};

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string' && value.includes(' ')) {
    const normalized = value.replace(' ', 'T');
    const parsedNormalized = new Date(normalized);
    if (!Number.isNaN(parsedNormalized.getTime())) {
      return parsedNormalized;
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateLabel = (date) =>
  date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

const formatTimeLabel = (date, rawValue) => {
  if (typeof rawValue === 'string') {
    const match = rawValue.match(/(?:T|\s)(\d{2}):(\d{2})/);
    if (match) {
      const hours = Number(match[1]);
      const minutes = match[2];
      if (!Number.isNaN(hours)) {
        const normalizedHours = ((hours % 12) || 12).toString();
        const suffix = hours >= 12 ? 'PM' : 'AM';
        return `${normalizedHours}:${minutes} ${suffix}`;
      }
    }
  }

  return date
    ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';
};

const formatRelativeLabel = (date) => {
  if (!date) {
    return '';
  }

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Tomorrow';
  }
  if (diffDays === -1) {
    return 'Yesterday';
  }
  if (diffDays > 1 && diffDays <= 7) {
    return `In ${diffDays} days`;
  }
  if (diffDays < -1 && diffDays >= -7) {
    return `${Math.abs(diffDays)} days ago`;
  }
  return '';
};

const formatEventTimeRange = (startDate, endDate, allDay, rawStart, rawEnd) => {
  if (allDay) {
    return 'All-day';
  }

  const startLabel = formatTimeLabel(startDate, rawStart);
  const endLabel = formatTimeLabel(endDate, rawEnd);

  if (startLabel && endLabel) {
    return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
  }
  return startLabel || endLabel || '';
};

const EMPTY_ACTIVITY_RESULT = { upcomingActivities: [], pastActivities: [] };

const safeArray = (value) => (Array.isArray(value) ? value : []);

const createActivityId = (prefix, ...candidates) => {
  if (!candidates.length) {
    return `${prefix}-unknown-0`;
  }

  const fallback = candidates[candidates.length - 1];
  const primary = candidates
    .slice(0, -1)
    .find((val) => val !== undefined && val !== null && val !== '');

  const base = primary ?? 'unknown';
  const normalizedFallback =
    fallback !== undefined && fallback !== null && fallback !== '' ? fallback : 0;

  return `${prefix}-${String(base)}-${String(normalizedFallback)}`;
};

const createItemKey = (item, fallbackProps = []) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  if (item.id !== undefined && item.id !== null) {
    return `id-${item.id}`;
  }

  for (const prop of fallbackProps) {
    const value = item[prop];
    if (value !== undefined && value !== null && value !== '') {
      return `${prop}-${value}`;
    }
  }

  return null;
};

const mergeActivityList = (target, items, seenSet, fallbackProps = []) => {
  safeArray(items).forEach((item, index) => {
    if (!item) {
      return;
    }

    const key =
      createItemKey(item, fallbackProps) ??
      `idx-${fallbackProps[0] || 'activity'}-${target.length}-${index}`;

    if (seenSet.has(key)) {
      return;
    }

    seenSet.add(key);
    target.push(item);
  });
};

const buildActivityTimeline = (activitySource) => {
  if (!activitySource) {
    return EMPTY_ACTIVITY_RESULT;
  }

  const nowTime = Date.now();
  const activities = [];

  safeArray(activitySource.tasks).forEach((task, index) => {
    if (!task) {
      return;
    }

    const reminderSource =
      task.reminder_time || task.reminderTime || task.reminder_at || null;
    const dueSource = task.due_date || task.dueDate || task.due_on || task.due_at || null;
    const reminderDate = parseDateValue(reminderSource);
    const dueDate = parseDateValue(dueSource);
    const activityDate = reminderDate ?? dueDate;
    const activityTime = activityDate ? activityDate.getTime() : null;
    const statusText = (task.status || '').toLowerCase();
    const isCompleted =
      statusText === 'completed' || statusText === 'done' || statusText === 'closed';
    const isOverdue = !isCompleted && activityTime !== null && activityTime < nowTime;
    const computedStatus = isCompleted ? 'past' : isOverdue ? 'overdue' : 'upcoming';

    activities.push({
      id: createActivityId('task', task.id, task.subject, task.title, index),
      type: 'task',
      title: task.subject || task.title || 'Task',
      description: getActivityDescriptor('task', computedStatus),
      status: computedStatus,
      dateLabel: formatDateLabel(activityDate),
      timeLabel: formatTimeLabel(reminderDate ?? dueDate, reminderSource ?? dueSource),
      relativeLabel: formatRelativeLabel(activityDate),
      meta: [task.priority, task.status, reminderDate ? 'Reminder' : null].filter(Boolean),
      timestamp: activityTime,
    });
  });

  safeArray(activitySource.events).forEach((event, index) => {
    if (!event) {
      return;
    }

    const rawStart =
      event.start_datetime || event.startDateTime || event.start_time || event.start;
    const rawEnd = event.end_datetime || event.endDateTime || event.end_time || event.end;
    const startDate = parseDateValue(rawStart);
    const endDate = parseDateValue(rawEnd);
    const comparisonDate = endDate || startDate;
    const comparisonTime = comparisonDate ? comparisonDate.getTime() : null;
    const isPast = comparisonTime !== null && comparisonTime < nowTime;
    const status = isPast ? 'past' : 'upcoming';
    const allDay = Boolean(event.all_day);

    activities.push({
      id: createActivityId('event', event.id, event.subject, event.title, rawStart, index),
      type: 'event',
      title: event.subject || event.title || 'Event',
      description: getActivityDescriptor('event', status),
      status,
      dateLabel: formatDateLabel(startDate || endDate),
      timeLabel: formatEventTimeRange(startDate, endDate, allDay, rawStart, rawEnd),
      relativeLabel: formatRelativeLabel(startDate || endDate),
      meta: [event.event_type || event.type, event.location].filter(Boolean),
      timestamp: comparisonTime,
    });
  });

  safeArray(activitySource.call_logs).forEach((call, index) => {
    if (!call) {
      return;
    }

    const rawCallDate = call.call_date_time || call.callDateTime || call.call_time || call.date;
    const callDate = parseDateValue(rawCallDate);
    const callTime = callDate ? callDate.getTime() : null;
    const callTypeLabel = call.call_type || call.type || null;
    const isFutureCall = callTime !== null && callTime >= nowTime;
    const callStatus = isFutureCall ? 'upcoming' : 'past';
    const descriptorStatus =
      callStatus === 'past' && (callTypeLabel || '').toLowerCase() === 'missed'
        ? 'overdue'
        : callStatus;

    activities.push({
      id: createActivityId('call', call.id, call.subject, rawCallDate, index),
      type: 'call',
      title: call.subject || call.title || 'Call Log',
      description: getActivityDescriptor('call', descriptorStatus),
      status: callStatus,
      dateLabel: formatDateLabel(callDate),
      timeLabel: formatTimeLabel(callDate, rawCallDate),
      relativeLabel: formatRelativeLabel(callDate),
      meta: [
        callTypeLabel,
        call.call_duration_minutes ? `${call.call_duration_minutes} min` : null,
      ].filter(Boolean),
      timestamp: callTime,
    });
  });

  safeArray(activitySource.emails).forEach((email, index) => {
    if (!email) {
      return;
    }

    const rawSentDate = email.sent_at || email.created_at || email.date;
    const sentDate = parseDateValue(rawSentDate);
    const sentTime = sentDate ? sentDate.getTime() : null;
    const emailStatus = sentTime !== null && sentTime >= nowTime ? 'upcoming' : 'past';

    activities.push({
      id: createActivityId('email', email.id, email.subject, rawSentDate, index),
      type: 'email',
      title: email.subject || 'Email',
      description: getActivityDescriptor('email', emailStatus),
      status: emailStatus,
      dateLabel: formatDateLabel(sentDate),
      timeLabel: formatTimeLabel(sentDate, rawSentDate),
      relativeLabel: formatRelativeLabel(sentDate),
      meta: [email.direction, email.status].filter(Boolean),
      timestamp: sentTime,
    });
  });

  const upcomingActivities = activities
    .filter((activity) => activity.status === 'upcoming' || activity.status === 'overdue')
    .sort((a, b) => {
      const aTime = a.timestamp ?? Number.POSITIVE_INFINITY;
      const bTime = b.timestamp ?? Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });

  const pastActivities = activities
    .filter((activity) => activity.status === 'past')
    .sort((a, b) => {
      const aTime = a.timestamp ?? 0;
      const bTime = b.timestamp ?? 0;
      return bTime - aTime;
    });

  return { upcomingActivities, pastActivities };
};

const SkeletonLine = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded ${className}`} />
);

const SingleClientSkeleton = () => (
  <div className="min-h-screen bg-gray-100 p-4 md:p-3">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-gray-200" />
              <div className="space-y-2">
                <SkeletonLine className="h-4 w-36" />
                <SkeletonLine className="h-3 w-48" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <SkeletonLine className="h-9 w-24" />
              <SkeletonLine className="h-9 w-32" />
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse">
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`detail-${idx}`} className="space-y-2">
                    <SkeletonLine className="h-3 w-24" />
                    <SkeletonLine className="h-4 w-full" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <SkeletonLine key={`action-${idx}`} className="h-9 w-24" />
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <SkeletonLine key={`feedback-${idx}`} className="h-3 w-2/3" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <SkeletonLine className="h-3 w-20" />
              {Array.from({ length: 5 }).map((_, idx) => (
                <SkeletonLine key={`quick-${idx}`} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={`summary-card-${idx}`} className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
            <div className="animate-pulse space-y-4">
              <div className="space-y-2">
                <SkeletonLine className="h-4 w-32" />
                <SkeletonLine className="h-3 w-48" />
              </div>
              {Array.from({ length: 3 }).map((_, rowIdx) => (
                <SkeletonLine key={`summary-row-${idx}-${rowIdx}`} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-md shadow-sm border border-gray-200 p-5">
          <div className="animate-pulse space-y-4">
            <div className="space-y-2">
              <SkeletonLine className="h-4 w-36" />
              <SkeletonLine className="h-3 w-56" />
            </div>
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonLine key={`timeline-${idx}`} className="h-16 w-full" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
          <div className="animate-pulse space-y-4">
            <div className="space-y-2">
              <SkeletonLine className="h-4 w-28" />
              <SkeletonLine className="h-3 w-40" />
            </div>
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonLine key={`insight-${idx}`} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SingleClientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientPayload, setClientPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [insightsOnly, setInsightsOnly] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [toast, setToast] = useState(null);
  const [showLogCallForm, setShowLogCallForm] = useState(false);
  const [logCallFormData, setLogCallFormData] = useState({ ...LOG_CALL_INITIAL_STATE });
  const [logCallSubmitting, setLogCallSubmitting] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({ ...TASK_FORM_INITIAL_STATE });
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [eventFormData, setEventFormData] = useState({ ...EVENT_FORM_INITIAL_STATE });
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailFormData, setEmailFormData] = useState({ ...EMAIL_FORM_INITIAL_STATE });
  const [emailValidationErrors, setEmailValidationErrors] = useState({});
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const showFeedback = true;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchClientDetails = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) {
        setFetchError('Missing client identifier.');
        setClientPayload(null);
        setLoading(false);
        return;
      }

      if (!silent) {
        setLoading(true);
      }
      setFetchError('');

      try {
        const response = await axiosMethods.get(`/clients/${id}`);

        if (!isMountedRef.current) {
          return;
        }

        if (response?.success && response.data) {
          setClientPayload(response.data);
        } else if (response?.data) {
          setClientPayload(response.data);
        } else {
          setFetchError('Unable to load client details.');
        }
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Failed to load client details.';
        setFetchError(message);
      } finally {
        if (!isMountedRef.current) {
          return;
        }

        if (!silent) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    fetchClientDetails();
  }, [fetchClientDetails]);

  const client = clientPayload?.client || null;
  const accounts = clientPayload?.accounts || [];
  const accountsById = useMemo(() => {
    if (!accounts.length) {
      return new Map();
    }

    return new Map(accounts.map((account) => [account.id, account]));
  }, [accounts]);
  const opportunities = clientPayload?.opportunities || [];
  const contacts = useMemo(() => {
    if (!clientPayload?.contacts) {
      return [];
    }

    return clientPayload.contacts.map((contact) => ({
      ...contact,
      accountName: accountsById.get(contact.account_id)?.name || 'N/A',
    }));
  }, [clientPayload, accountsById]);

  const lead = client?.lead || null;
  const primaryAccountName = accounts.length ? accounts[0]?.name : null;
  const primaryAccountId = accounts.length ? accounts[0]?.id ?? null : null;
  const primaryContact = contacts.length ? contacts[0] : null;
  const summarySubtitle = useMemo(() => {
    if (!client) {
      return 'Client';
    }

    const parts = [];

    if (client.status) {
      parts.push(client.status);
    }

    if (client.company) {
      parts.push(client.company);
    }

    return parts.join(' · ') || 'Client';
  }, [client]);

  const clientContext = useMemo(
    () => ({
      clientId: client?.id ?? client?.client_id ?? null,
      leadId:
        client?.lead_id ??
        client?.leadId ??
        client?.lead?.id ??
        client?.lead?.lead_id ??
        null,
      accountId: primaryAccountId ?? null,
      contactId: primaryContact?.id ?? null,
    }),
    [client, primaryAccountId, primaryContact]
  );

  const logCallRelatedTo = useMemo(() => {
    if (client?.company) {
      return client.company;
    }
    if (primaryAccountName) {
      return primaryAccountName;
    }
    if (client?.name) {
      return client.name;
    }
    return 'Client';
  }, [client, primaryAccountName]);

  const leadCount = lead ? 1 : 0;
  const opportunityCount = opportunities.length;
  const contactCount = contacts.length;
  const accountCount = accounts.length;

  const quickLinks = [
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: DollarSign,
      count: opportunityCount,
      accentClass: 'text-orange-500',
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: FileText,
      count: contactCount,
      accentClass: 'text-orange-500',
    },
    {
      id: 'accounts',
      label: 'Accounts',
      icon: ShoppingBag,
      count: accountCount,
      accentClass: 'text-gray-600',
    },
  ];

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return value;
    }

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);
    } catch (error) {
      return numericValue.toString();
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const { upcomingActivities, pastActivities } = useMemo(() => {
    if (!clientPayload?.client) {
      return EMPTY_ACTIVITY_RESULT;
    }

    const combined = { tasks: [], events: [], call_logs: [], emails: [] };
    const seen = {
      tasks: new Set(),
      events: new Set(),
      call_logs: new Set(),
      emails: new Set(),
    };
    const sources = [clientPayload.client, clientPayload.client.lead].filter(Boolean);

    sources.forEach((source) => {
      mergeActivityList(combined.tasks, source.tasks, seen.tasks, ['subject', 'due_date', 'dueDate']);
      mergeActivityList(
        combined.events,
        source.events,
        seen.events,
        ['subject', 'start_datetime', 'startDateTime']
      );
      mergeActivityList(
        combined.call_logs,
        source.call_logs || source.callLogs,
        seen.call_logs,
        ['subject', 'call_date_time', 'callDateTime']
      );
      mergeActivityList(
        combined.emails,
        source.emails,
        seen.emails,
        ['subject', 'sent_at', 'created_at', 'date']
      );
    });

    return buildActivityTimeline(combined);
  }, [clientPayload]);

  const showToastMessage = useCallback(
    (message, type = 'success') => {
      setToast({ message, type });
    },
    []
  );

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  const handleOpenLogCallForm = useCallback(() => {
    const now = new Date();
    setLogCallFormData({
      ...LOG_CALL_INITIAL_STATE,
      subject: client?.name ? `Call with ${client.name}` : '',
      callDateTime: toDatetimeLocal(now),
    });
    setShowNewTaskModal(false);
    setShowNewEventModal(false);
    setShowEmailModal(false);
    setShowLogCallForm(true);
  }, [client]);

  const handleLogCallInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setLogCallFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleLogCallCancel = useCallback(() => {
    setShowLogCallForm(false);
    setLogCallFormData({ ...LOG_CALL_INITIAL_STATE });
  }, []);

  const handleLogCallSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!logCallFormData.callDateTime) {
        showToastMessage('Please provide a valid call date and time.', 'error');
        return;
      }

      const formattedCallDateTime = formatDateTimeForApi(logCallFormData.callDateTime);
      if (!formattedCallDateTime) {
        showToastMessage('Invalid call date and time format.', 'error');
        return;
      }

      const payload = {
        lead_id: clientContext.leadId,
        client_id: clientContext.clientId,
        account_id: clientContext.accountId,
        contact_id: clientContext.contactId,
        subject: logCallFormData.subject,
        call_type: logCallFormData.callType,
        call_date_time: formattedCallDateTime,
        related_to: logCallRelatedTo,
        call_duration_minutes: logCallFormData.callDuration
          ? parseInt(logCallFormData.callDuration, 10)
          : null,
        comments: logCallFormData.comments || null,
        create_follow_up_task: !!logCallFormData.followUpTask,
        follow_up_due_date:
          logCallFormData.followUpTask && logCallFormData.followUpDueDate
            ? formatDateForApi(logCallFormData.followUpDueDate)
            : null,
        task_notes:
          logCallFormData.followUpTask && logCallFormData.followUpNotes
            ? logCallFormData.followUpNotes
            : null,
      };

      try {
        setLogCallSubmitting(true);
        const response = await axiosMethods.post('/call-logs', payload);
        showToastMessage(response?.message || 'Call log created successfully!', 'success');
        setLogCallFormData({ ...LOG_CALL_INITIAL_STATE });
        setShowLogCallForm(false);
        await fetchClientDetails({ silent: true });
      } catch (error) {
        const validationMessage = getFirstValidationMessage(error);
        showToastMessage(
          validationMessage ||
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            'Failed to create call log.',
          'error'
        );
        console.error('Error logging call:', error);
      } finally {
        setLogCallSubmitting(false);
      }
    },
    [clientContext, fetchClientDetails, logCallFormData, logCallRelatedTo, showToastMessage]
  );

  const handleOpenNewTaskModal = useCallback(() => {
    setTaskFormData(buildTaskFormDefaults(client, { primaryAccountName }));
    setShowLogCallForm(false);
    setShowNewEventModal(false);
    setShowEmailModal(false);
    setShowNewTaskModal(true);
  }, [client, primaryAccountName]);

  const handleTaskInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setTaskFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleTaskCancel = useCallback(() => {
    setShowNewTaskModal(false);
    setTaskFormData(buildTaskFormDefaults(client, { primaryAccountName }));
  }, [client, primaryAccountName]);

  const submitTaskForm = useCallback(
    async ({ keepOpen = false } = {}) => {
      const payload = {
        lead_id: clientContext.leadId,
        client_id: clientContext.clientId,
        account_id: clientContext.accountId,
        contact_id: clientContext.contactId,
        subject: taskFormData.subject,
        priority: taskFormData.priority || null,
        status: taskFormData.status || null,
        due_date: taskFormData.dueDate || null,
        comments: taskFormData.comments || null,
        reminder_set: !!taskFormData.reminderSet,
        reminder_datetime:
          taskFormData.reminderSet && taskFormData.reminderDateTime
            ? formatDateTimeForApi(taskFormData.reminderDateTime)
            : null,
        is_recurring: !!taskFormData.recurring,
        recurrence_type: taskFormData.recurring ? taskFormData.recurrenceType : null,
        recurrence_interval:
          taskFormData.recurring && taskFormData.recurrenceInterval
            ? parseInt(taskFormData.recurrenceInterval, 10)
            : null,
        recurrence_days_of_week:
          taskFormData.recurring &&
          Array.isArray(taskFormData.recurrenceDaysOfWeek) &&
          taskFormData.recurrenceDaysOfWeek.length
            ? taskFormData.recurrenceDaysOfWeek
            : null,
        recurrence_start_date:
          taskFormData.recurring && taskFormData.recurrenceStartDate
            ? formatDateTimeForApi(taskFormData.recurrenceStartDate)
            : null,
        recurrence_end_date:
          taskFormData.recurring && taskFormData.recurrenceEndDate
            ? formatDateTimeForApi(taskFormData.recurrenceEndDate)
            : null,
      };

      try {
        setTaskSubmitting(true);
        const response = await axiosMethods.post('/create-task', payload);
        const entityName = client?.name || client?.company || '';
        showToastMessage(
          response?.message || (entityName ? `Task created for ${entityName}` : 'Task created successfully!'),
          'success'
        );

        const defaults = buildTaskFormDefaults(client, { primaryAccountName });
        if (keepOpen) {
          setTaskFormData(defaults);
        } else {
          setShowNewTaskModal(false);
          setTaskFormData(defaults);
        }

        await fetchClientDetails({ silent: true });
      } catch (error) {
        const validationMessage = getFirstValidationMessage(error);
        showToastMessage(
          validationMessage ||
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            'Failed to create task.',
          'error'
        );
        console.error('Error saving task:', error);
      } finally {
        setTaskSubmitting(false);
      }
    },
    [client, clientContext, fetchClientDetails, primaryAccountName, showToastMessage, taskFormData]
  );

  const handleTaskSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      await submitTaskForm({ keepOpen: false });
    },
    [submitTaskForm]
  );

  const handleTaskSaveAndNew = useCallback(async () => {
    await submitTaskForm({ keepOpen: true });
  }, [submitTaskForm]);

  const handleOpenNewEventForm = useCallback(() => {
    setEventFormData(buildEventFormDefaults(client, { primaryAccountName }));
    setShowLogCallForm(false);
    setShowNewTaskModal(false);
    setShowEmailModal(false);
    setShowNewEventModal(true);
  }, [client, primaryAccountName]);

  const handleEventInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setEventFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleEventAttendeeChange = useCallback((index, field, fieldValue) => {
    setEventFormData((prev) => {
      const attendees = [...(prev.attendees || [])];
      if (!attendees[index]) {
        attendees[index] = createEmptyAttendee();
      }
      attendees[index] = {
        ...attendees[index],
        [field]: fieldValue,
      };
      return {
        ...prev,
        attendees,
      };
    });
  }, []);

  const handleAddEventAttendee = useCallback(() => {
    setEventFormData((prev) => ({
      ...prev,
      attendees: [...(prev.attendees || []), createEmptyAttendee()],
    }));
  }, []);

  const handleRemoveEventAttendee = useCallback((index) => {
    setEventFormData((prev) => {
      const attendees = [...(prev.attendees || [])];
      if (attendees.length <= 1) {
        return prev;
      }
      attendees.splice(index, 1);
      return {
        ...prev,
        attendees,
      };
    });
  }, []);

  const handleEventCancel = useCallback(() => {
    setShowNewEventModal(false);
    setEventFormData({ ...EVENT_FORM_INITIAL_STATE, attendees: [] });
  }, []);

  const handleEventSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!eventFormData.start_datetime || !eventFormData.end_datetime) {
        showToastMessage('Please provide valid start and end times.', 'error');
        return;
      }

      const startDateTime = formatDateTimeForApi(eventFormData.start_datetime);
      const endDateTime = formatDateTimeForApi(eventFormData.end_datetime);

      if (!startDateTime || !endDateTime) {
        showToastMessage('Please provide valid start and end times.', 'error');
        return;
      }

      if (new Date(eventFormData.end_datetime) <= new Date(eventFormData.start_datetime)) {
        showToastMessage('End time must be after the start time.', 'error');
        return;
      }

      const reminderDateTime =
        eventFormData.set_reminder && eventFormData.reminder_datetime
          ? formatDateTimeForApi(eventFormData.reminder_datetime)
          : null;

      const attendees = (eventFormData.attendees || [])
        .filter((attendee) => attendee.name || attendee.email || attendee.phone)
        .map((attendee) => ({
          name: attendee.name || null,
          email: attendee.email || null,
          phone: attendee.phone || null,
        }));

      const payload = {
        lead_id: clientContext.leadId,
        client_id: clientContext.clientId,
        account_id: clientContext.accountId,
        contact_id: clientContext.contactId,
        subject: eventFormData.subject,
        event_type: eventFormData.event_type,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        location: eventFormData.location || null,
        description: eventFormData.description || null,
        all_day: !!eventFormData.all_day,
        set_reminder: !!eventFormData.set_reminder,
        reminder_datetime: reminderDateTime,
        attendees_enabled: !!eventFormData.attendees_enabled,
        attendees,
      };

      try {
        setEventSubmitting(true);
        const response = await axiosMethods.post('/events', payload);
        const entityName = client?.name || client?.company || '';

        if (response?.success) {
          showToastMessage(
            response?.message ||
              (entityName ? `Event created for ${entityName}` : 'Event created successfully!'),
            'success'
          );
          setEventFormData({ ...EVENT_FORM_INITIAL_STATE, attendees: [] });
          setShowNewEventModal(false);
          await fetchClientDetails({ silent: true });
        } else {
          showToastMessage(response?.message || 'Failed to create event.', 'error');
        }
      } catch (error) {
        showToastMessage(
          error?.response?.data?.message || error?.response?.data?.error || 'Failed to create event.',
          'error'
        );
        console.error('Error creating event:', error);
      } finally {
        setEventSubmitting(false);
      }
    },
    [client, clientContext, eventFormData, fetchClientDetails, showToastMessage]
  );

  const handleOpenEmailModal = useCallback(() => {
    setEmailFormData(buildEmailFormDefaults(client, contacts));
    setEmailValidationErrors({});
    setEmailSubmitting(false);
    setShowLogCallForm(false);
    setShowNewTaskModal(false);
    setShowNewEventModal(false);
    setShowEmailModal(true);
  }, [client, contacts]);

  const handleEmailFieldChange = useCallback((field, value) => {
    setEmailFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setEmailValidationErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleEmailModalCancel = useCallback(() => {
    setShowEmailModal(false);
    setEmailSubmitting(false);
    setEmailValidationErrors({});
    setEmailFormData(buildEmailFormDefaults(client, contacts));
  }, [client, contacts]);

  const handleEmailSubmit = useCallback(() => {
    setEmailSubmitting(true);
    showToastMessage('Email modal submitted.', 'success');
    setShowEmailModal(false);
    setEmailSubmitting(false);
  }, [showToastMessage]);

  const activityActions = useMemo(
    () => [
      { id: 'new-task', label: 'New Task', icon: CheckSquare, action: handleOpenNewTaskModal },
      { id: 'log-call', label: 'Log a Call', icon: PhoneCall, action: handleOpenLogCallForm },
      { id: 'new-event', label: 'New Event', icon: CalendarPlus, action: handleOpenNewEventForm },
      { id: 'email', label: 'Email', icon: Mail, action: handleOpenEmailModal },
    ],
    [handleOpenEmailModal, handleOpenLogCallForm, handleOpenNewEventForm, handleOpenNewTaskModal]
  );

  if (loading) {
    return <SingleClientSkeleton />;
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-3">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-md shadow-sm border border-gray-200">
            <div className="p-6 text-center text-sm text-red-600">
              {fetchError}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-3">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-md shadow-sm border border-gray-200">
            <div className="p-6 text-center text-sm text-gray-600">
              Client record not found.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-3">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200">
          {/* Top Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{client?.name || 'Client'}</h1>
                <p className="text-sm text-gray-600">{summarySubtitle}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-start">

              <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button className="px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-950">
                New Opportunity
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Section - Details */}
              <div className="xl:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Account Name</label>
                    <p
                      className={`font-medium ${primaryAccountName ? 'text-gray-500 underline cursor-pointer' : 'text-gray-400'}`}
                    >
                      {primaryAccountName || 'No linked account'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Status</label>
                    <p className="text-gray-900">{client?.status || 'Not set'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Email</label>
                    {client?.email ? (
                      <a
                        href={`mailto:${client.email}`}
                        className="text-gray-500 underline flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        No email on record
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Phone</label>
                    {client?.phone ? (
                      <a href={`tel:${client.phone}`} className="text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        No phone on record
                      </span>
                    )}
                  </div>
                </div>

                {showFeedback && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Did you find these results useful?</span>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <ThumbsUp className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <ThumbsDown className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Section - Quick Links */}
              <div className="bg-white  p-4 border-l ">
                <div className="pb-3 mb-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    Related List Quick Links
                    <span className="w-4 h-4 bg-gray-400 rounded-full text-white text-xs flex items-center justify-center">?</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {quickLinks.map(({ id: quickLinkId, label, icon: LinkIcon, count, accentClass }) => (
                    <div key={quickLinkId} className="flex items-center gap-2 text-sm text-gray-700">
                      <LinkIcon className={`w-4 h-4 ${accentClass}`} />
                      <span className={count ? 'underline cursor-pointer' : 'text-gray-400'}>
                        {`${label} (${count})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
          <div className="space-y-6">
            {/* Accounts Section */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Accounts</h2>
                <p className="text-sm text-gray-600">
                  {accountCount
                    ? `${accountCount} Result${accountCount > 1 ? 's' : ''}`
                    : 'No linked accounts'}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Website
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accountCount ? (
                      accounts.map((account, index) => (
                        <tr key={account.id || `account-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-medium">
                            {account.name || 'Unnamed account'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {account.company || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {account.industry || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {account.website ? (
                              <a
                                href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 underline"
                              >
                                {account.website}
                              </a>
                            ) : (
                              <span className="text-gray-400">No website</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">
                          No accounts linked to this client yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contacts Section */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
                <p className="text-sm text-gray-600">
                  {contactCount
                    ? `${contactCount} Result${contactCount > 1 ? 's' : ''}`
                    : 'No contacts linked'}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Account Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contactCount ? (
                      contacts.map((contact, index) => (
                        <tr key={contact.id || `contact-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-gray-500 underline font-medium">{contact.name || 'Unnamed contact'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`font-medium ${contact.accountName && contact.accountName !== 'N/A'
                                ? 'text-gray-500 underline'
                                : 'text-gray-400'
                                }`}
                            >
                              {contact.accountName}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">{contact.title || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">{contact.phone || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {contact.email ? (
                              <a href={`mailto:${contact.email}`} className="text-gray-500 underline">{contact.email}</a>
                            ) : (
                              <span className="text-gray-400">No email</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">
                          No contacts linked to this client yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Opportunities Section */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Opportunities</h2>
                <p className="text-sm text-gray-600">
                  {opportunityCount
                    ? `${opportunityCount} Result${opportunityCount > 1 ? 's' : ''}`
                    : 'No opportunities linked'}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Expected Close
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {opportunityCount ? (
                      opportunities.map((opportunity, index) => (
                        <tr key={opportunity.id || `opportunity-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-medium">
                            {opportunity.title || 'Untitled opportunity'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {accountsById.get(opportunity.account_id)?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {opportunity.stage || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {formatCurrency(opportunity.amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {formatDate(opportunity.expected_close_date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {opportunity.status || 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
                          No opportunities linked to this client yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leads Section */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 ">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Leads</h2>
                <p className="text-sm text-gray-600">
                  {leadCount ? `${leadCount} Result` : 'No related leads'}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Lead Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lead ? (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            onClick={() => navigate(`/SingleLeadPage/${lead.id || client.id}`)}
                            className="text-gray-500 cursor-pointer underline font-medium"
                          >
                            {lead.name || client.name || 'Unnamed lead'}
                          </span>

                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{lead.interest || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{lead.company || client.company || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{lead.status || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{lead.phone || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {lead.email ? (
                            <a href={`mailto:${lead.email}`} className="text-gray-500 underline">{lead.email}</a>
                          ) : (
                            <span className="text-gray-400">No email</span>
                          )}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
                          No related leads found for this client.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-md shadow-sm border border-gray-200">
              {showLogCallForm ? (
                <CreateCallLog
                  leadData={client}
                  formData={logCallFormData}
                  onChange={handleLogCallInputChange}
                  onCancel={handleLogCallCancel}
                  onSubmit={handleLogCallSubmit}
                  isSubmitting={logCallSubmitting}
                  variant="panel"
                />
              ) : (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Activities</h2>
                    <p className="text-sm text-gray-600">Create follow ups and review the history for this client.</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-4 pt-6">
                      {activityActions.map(({ id, label, icon: Icon, action }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={action}
                          className="flex cursor-pointer flex-col items-center gap-2 text-xs font-semibold text-gray-600 transition hover:text-gray-900 focus:outline-none"
                        >
                          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-50 transition hover:border-blue-200 hover:bg-blue-50">
                            <Icon className="h-5 w-5" />
                          </span>
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                      <span className="text-xs font-semibold text-gray-600">
                        Only show activities with insights
                      </span>
                      <button
                        type="button"
                        onClick={() => setInsightsOnly((prev) => !prev)}
                        className={`relative cursor-pointer inline-flex h-6 w-11 items-center rounded-full transition ${insightsOnly ? 'bg-gray-900' : 'bg-gray-300'
                          }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${insightsOnly ? 'translate-x-5' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    <div className="border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setShowUpcoming((prev) => !prev)}
                        className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left transition hover:bg-gray-50"
                      >
                        <span className="text-sm font-semibold text-gray-900">Upcoming &amp; Overdue</span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transition ${showUpcoming ? '' : 'rotate-180'
                            }`}
                        />
                      </button>

                      {showUpcoming ? (
                        <div className="px-6 pb-6">
                          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <div className="px-4 py-5">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                                Upcoming &amp; Overdue
                              </p>
                              <div className="mt-4">
                                <ActivityTimelineList
                                  items={upcomingActivities}
                                  emptyTitle="No upcoming or overdue activities"
                                  emptyDescription="Log a call, schedule a task, or create an event to see it appear in this timeline."
                                />
                              </div>
                            </div>
                            <div className="border-t border-gray-100 px-4 py-5">
                              <p className="text-sm font-semibold text-gray-700">Past Activities</p>
                              <div className="mt-4">
                                <ActivityTimelineList
                                  items={pastActivities}
                                  emptyTitle="No past activities yet"
                                  emptyDescription="Completed tasks, meetings, and logged calls will display here."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className="mx-auto block mb-5 rounded-full bg-gray-900 px-6 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
                      >
                        Show All Activities
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateTask
        isOpen={showNewTaskModal}
        formData={taskFormData}
        onChange={handleTaskInputChange}
        onSubmit={handleTaskSubmit}
        onSaveAndNew={handleTaskSaveAndNew}
        onCancel={handleTaskCancel}
        isSubmitting={taskSubmitting}
      />

      <CreateNewEvent
        isOpen={showNewEventModal}
        leadData={client}
        formData={eventFormData}
        onChange={handleEventInputChange}
        onAttendeeChange={handleEventAttendeeChange}
        onAddAttendee={handleAddEventAttendee}
        onRemoveAttendee={handleRemoveEventAttendee}
        onCancel={handleEventCancel}
        onSubmit={handleEventSubmit}
        isSubmitting={eventSubmitting}
      />

      <Email
        isOpen={showEmailModal}
        leadName={client?.name}
        formData={emailFormData}
        validationErrors={emailValidationErrors}
        onFieldChange={handleEmailFieldChange}
        onSubmit={handleEmailSubmit}
        onCancel={handleEmailModalCancel}
        isSubmitting={emailSubmitting}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleToastClose}
        />
      )}
    </div>
  );
};

export default SingleClientPage;
