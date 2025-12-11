import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone,
    Mail,
    MessageCircle,
    Plus,
    Copy,
    Loader2,
    ChevronDown,
    ChevronRight,
    Briefcase,
    Zap,
    Target,
    BriefcaseBusiness,
    DatabaseZap,
    Factory,
    MessageSquareReply,
    TrendingUp,
    Calendar,
    CheckSquare,
    Pencil,
    AlertCircle,
    X,
    Check,
    FileText,
    Download,
    List,
    Trash2
} from 'lucide-react';
import LogCallForm from './LogCallForm';

const overlayStyles = `
@keyframes fadeIn {
from { opacity: 0; transform: scale(0.95); }
to { opacity: 1; transform: scale(1); }
}`;

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

const SkeletonLoader = () => (
    <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-gray-300 rounded"></div>
            <div className="flex-1">
                <div className="h-6 bg-gray-300 rounded w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-300 rounded"></div>
            ))}
        </div>
    </div>
);

const ACTIVITY_TYPE_STYLES = {
    task: {
        icon: CheckSquare,
        ringClass: 'border-green-200 bg-green-50 text-green-600',
        lineClass: 'bg-green-200',
        overdueRingClass: 'border-red-200 bg-red-50 text-red-600',
        overdueLineClass: 'bg-red-200',
        pastRingClass: 'border-gray-200 bg-gray-50 text-gray-400',
        pastLineClass: 'bg-gray-200',
        labels: {
            upcoming: 'You have an upcoming Task',
            overdue: 'This task is overdue',
            past: 'You had a Task',
        },
    },
    event: {
        icon: Calendar,
        ringClass: 'border-pink-200 bg-pink-50 text-pink-600',
        lineClass: 'bg-pink-200',
        overdueRingClass: 'border-red-200 bg-red-50 text-red-600',
        overdueLineClass: 'bg-red-200',
        pastRingClass: 'border-gray-200 bg-gray-50 text-gray-400',
        pastLineClass: 'bg-gray-200',
        labels: {
            upcoming: 'You have an upcoming Event',
            overdue: 'This event has passed',
            past: 'You had an Event',
        },
    },
    call: {
        icon: Phone,
        ringClass: 'border-blue-200 bg-blue-50 text-blue-600',
        lineClass: 'bg-blue-200',
        overdueRingClass: 'border-blue-200 bg-blue-50 text-blue-600',
        overdueLineClass: 'bg-blue-200',
        pastRingClass: 'border-gray-200 bg-gray-50 text-gray-400',
        pastLineClass: 'bg-gray-200',
        labels: {
            upcoming: 'Call scheduled',
            overdue: 'Missed call',
            past: 'You logged a Call',
        },
    },
    email: {
        icon: Mail,
        ringClass: 'border-purple-200 bg-purple-50 text-purple-600',
        lineClass: 'bg-purple-200',
        overdueRingClass: 'border-purple-200 bg-purple-50 text-purple-600',
        overdueLineClass: 'bg-purple-200',
        pastRingClass: 'border-gray-200 bg-gray-50 text-gray-400',
        pastLineClass: 'bg-gray-200',
        labels: {
            upcoming: 'Email scheduled',
            overdue: 'Email overdue',
            past: 'You sent an Email',
        },
    },
    default: {
        icon: MessageCircle,
        ringClass: 'border-gray-200 bg-gray-50 text-gray-500',
        lineClass: 'bg-gray-200',
        overdueRingClass: 'border-red-200 bg-red-50 text-red-600',
        overdueLineClass: 'bg-red-200',
        pastRingClass: 'border-gray-200 bg-gray-50 text-gray-400',
        pastLineClass: 'bg-gray-200',
        labels: {
            upcoming: 'Scheduled activity',
            overdue: 'This activity is overdue',
            past: 'You had an activity',
        },
    },
};

const getActivityConfig = (type) => ACTIVITY_TYPE_STYLES[type] || ACTIVITY_TYPE_STYLES.default;

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

const sanitizeFileName = (value) => {
    if (!value) {
        return 'lead';
    }

    const normalized = value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return normalized || 'lead';
};

const formatLeadExportValue = (value) => {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        try {
            return JSON.stringify(value);
        } catch (error) {
            console.error('Failed to stringify lead value for export:', error);
            return 'N/A';
        }
    }

    const stringValue = String(value);
    const trimmed = stringValue.trim();
    if (trimmed === '') {
        return 'N/A';
    }

    return trimmed.replace(/\r?\n|\r/g, ' ');
};

const buildLeadExportEntries = (lead) => {
    if (!lead || typeof lead !== 'object') {
        return [];
    }

    return Object.entries(lead)
        .filter(([, value]) => typeof value !== 'function')
        .map(([key, value]) => [key, formatLeadExportValue(value)]);
};

const buildCsvFromLead = (lead) => {
    const entries = buildLeadExportEntries(lead);
    const escapeCsvValue = (value) => `"${String(value).replace(/"/g, '""')}"`;

    const rows = [['Field', 'Value'], ...entries];
    return rows
        .map((row) => row.map(escapeCsvValue).join(','))
        .join('\r\n');
};

const escapePdfText = (text) =>
    text
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');

const buildPdfFromLead = (lead) => {
    const encoder = new TextEncoder();
    const entries = buildLeadExportEntries(lead);
    const lines = [
        'Lead Export',
        `Generated: ${new Date().toLocaleString()}`,
        ''
    ];

    if (entries.length > 0) {
        entries.forEach(([field, value]) => {
            lines.push(`${field}: ${value}`);
        });
    } else {
        lines.push('No lead details available.');
    }

    let content = 'BT\n/F1 12 Tf\n72 720 Td\n';
    lines.forEach((line, index) => {
        const safeLine = escapePdfText(line);
        if (index === 0) {
            content += `(${safeLine}) Tj\n`;
        } else {
            content += `0 -16 Td\n(${safeLine}) Tj\n`;
        }
    });
    content += 'ET';

    const contentLength = encoder.encode(content).length;
    const header = '%PDF-1.4\n';
    const parts = [header];
    const offsets = [0];

    let currentOffset = encoder.encode(header).length;

    const addObject = (body) => {
        const index = offsets.length;
        offsets.push(currentOffset);
        const objectString = `${index} 0 obj\n${body}\nendobj\n`;
        parts.push(objectString);
        currentOffset += encoder.encode(objectString).length;
        return index;
    };

    addObject('<< /Type /Catalog /Pages 2 0 R >>');
    addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    addObject('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
    addObject(`<< /Length ${contentLength} >>\nstream\n${content}\nendstream`);
    addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    const xrefOffset = currentOffset;
    let xref = 'xref\n';
    xref += `0 ${offsets.length}\n`;
    xref += '0000000000 65535 f \n';
    for (let i = 1; i < offsets.length; i++) {
        const padded = offsets[i].toString().padStart(10, '0');
        xref += `${padded} 00000 n \n`;
    }
    xref += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    parts.push(xref);

    return parts.join('');
};

const formatRelativeLabel = (date) => {
    if (!date) {
        return '';
    }
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffMs = startOfDate.getTime() - startOfToday.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

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
        .find((value) => value !== undefined && value !== null && value !== '');

    const base = primary ?? 'unknown';
    const normalizedFallback =
        fallback !== undefined && fallback !== null && fallback !== '' ? fallback : 0;

    return `${prefix}-${String(base)}-${String(normalizedFallback)}`;
};

const buildLeadActivities = (leadData) => {
    if (!leadData) {
        return EMPTY_ACTIVITY_RESULT;
    }

    const nowTime = Date.now();
    const activities = [];

    safeArray(leadData.tasks).forEach((task, index) => {
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

    safeArray(leadData.events).forEach((event, index) => {
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

    safeArray(leadData.call_logs).forEach((call, index) => {
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

    safeArray(leadData.emails).forEach((email, index) => {
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

const buildOverlayGradient = (color, alpha) =>
    `linear-gradient(90deg, ${color} 0%, ${color} 50%, rgba(255,255,255,${alpha}) 100%)`;

const MAX_ACTIVITY_ITEMS = 3;

const STATUS_BUTTON_CONFIG = [
    {
        paddingClass: 'px-12',
        marginClass: '',
        extraClass: '',
        clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)',
        borderRadius: '20px 0 0 20px',
        defaultTextClass: 'text-gray-600 cursor-pointer',
        colors: {
            active: '#181819',
            completed: '#047857',
            default: '#eaeaea',
        },
    },
    {
        paddingClass: 'px-12',
        marginClass: '-ml-2',
        extraClass: 'overflow-hidden',
        clipPath:
            'polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 7% 50%)',
        defaultTextClass: 'text-gray-700 cursor-pointer',
        colors: {
            active: '#181819',
            completed: '#047857',
            default: '#eaeaea',
        },
        overlay: {
            widthClass: 'w-6',
            clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
            highlightAlpha: 0.3,
            dimAlpha: 0.2,
            colors: {
                active: '#181819',
                completed: '#047857',
                default: '#eaeaea',
            },
        },
    },
    {
        paddingClass: 'px-12',
        marginClass: '-ml-2',
        extraClass: 'overflow-hidden',
        clipPath:
            'polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 10% 50%)',
        defaultTextClass: 'text-gray-700 cursor-pointer',
        colors: {
            active: '#181819',
            completed: '#047857',
            default: '#eaeaea',
        },
        overlay: {
            widthClass: 'w-6',
            clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
            highlightAlpha: 0.3,
            dimAlpha: 0.2,
            colors: {
                active: '#181819',
                completed: '#047857',
                default: '#eaeaea',
            },
        },
    },
    {
        paddingClass: 'px-12',
        marginClass: '-ml-2',
        extraClass: 'overflow-hidden',
        clipPath:
            'polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 8% 50%)',
        defaultTextClass: 'text-gray-700 cursor-pointer',
        colors: {
            active: '#181819',
            completed: '#047857',
            default: '#eaeaea',
        },
        overlay: {
            widthClass: 'w-6',
            clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
            highlightAlpha: 0.3,
            dimAlpha: 0.2,
            colors: {
                active: '#181819',
                completed: '#047857',
                default: '#eaeaea',
            },
        },
    },
    {
        paddingClass: 'px-12',
        marginClass: '-ml-2',
        extraClass: 'overflow-hidden',
        clipPath:
            'polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 9% 50%)',
        defaultTextClass: 'text-gray-700 cursor-pointer',
        colors: {
            active: '#e0142c',
            completed: '#047857',
            default: '#eaeaea',
        },
        overlay: {
            widthClass: 'w-6',
            clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
            highlightAlpha: 0.3,
            dimAlpha: 0.2,
            colors: {
                active: '#e0142c',
                completed: '#047857',
                default: '#eaeaea',
            },
        },
    },
    {
        paddingClass: 'px-16',
        marginClass: '-ml-2',
        extraClass: '',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 8% 50%)',
        borderRadius: '0 20px 20px 0',
        defaultTextClass: 'text-gray-600 cursor-pointer',
        colors: {
            active: '#047857',
            completed: '#047857',
            default: '#eaeaea',
        },
    },
];

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

                // Color mapping based on activity type
                const iconBgColor =
                    item.type === 'task' ? 'bg-green-500' :
                        item.type === 'event' ? 'bg-pink-500' :
                            item.type === 'call' ? 'bg-blue-400' :
                                item.type === 'email' ? 'bg-purple-500' :
                                    'bg-gray-400';

                return (
                    <li key={item.id || `${item.type}-${index}`} className="flex gap-0 group hover:bg-gray-50">
                        {/* Left chevron and timeline */}
                        <div className="relative flex items-start pt-4 pl-1">
                            <button
                                type="button"
                                aria-label="Toggle activity details"
                                className="text-gray-400 transition hover:text-gray-600 z-10"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Icon with timeline */}
                        <div className="relative flex flex-col items-center pt-3 px-2">
                            <div className={`flex h-9 w-9 items-center justify-center rounded ${iconBgColor} text-white z-10`}>
                                <IconComponent className="h-5 w-5" />
                            </div>
                            {!isLast && (
                                <div className={`absolute top-12 bottom-0 w-0.5 ${iconBgColor}`} style={{ left: '50%', transform: 'translateX(-50%)' }} />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex items-start justify-between py-3 pr-4 border-b border-gray-100">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">{item.title}</p>
                                <p className="mt-0.5 text-xs text-gray-600">{item.description}</p>
                                {item.meta?.length ? (
                                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                                        {item.meta.map((meta, metaIndex) => (
                                            <span key={`${item.id || index}-meta-${metaIndex}`}>{meta}</span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            {/* Right side date/time */}
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

const LeadPageContent = ({
    error,
    leadData,
    toast,
    onToastClose = () => { },
    loading = false,
    statusLabels = [],
    statuses = [],
    activeStatus = 0,
    statusChanged = false,
    updating = false,
    handleStatusChange = () => { },
    handleUpdateStatus = () => { },
    openSections = {},
    setOpenSections = () => { },
    editingField,
    setEditingField = () => { },
    editValue = '',
    setEditValue = () => { },
    handleFieldUpdate = () => { },
    showLogCallForm = false,
    logCallFormData = {},
    handleLogCallInputChange = () => { },
    handleLogCallCancel = () => { },
    handleLogCallSubmit = () => { },
    logCallSubmitting = false,
    activeTab = 'activity',
    setActiveTab = () => { },
    insightsOnly = false,
    setInsightsOnly = () => { },
    showUpcoming = true,
    setShowUpcoming = () => { },
    onOpenNewTask = () => { },
    onOpenLogCall = () => { },
    onOpenNewEvent = () => { },
    onOpenEmailModal = () => { },
    showConversionOverlay = false,
    onConversionOverlayClose = () => { },
    duplicates = [],
    clonedFrom = null,
    duplicatesLoading = false,
    onCloneLead = () => { },
    cloning = false,
    onDeleteLead = () => { },
    deletingLead = false,
}) => {

    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [shouldScrollActivity, setShouldScrollActivity] = useState(false);
    const [isActivityMoreOpen, setIsActivityMoreOpen] = useState(false);
    const moreMenuRef = useRef(null);
    const activitySectionRef = useRef(null);
    const activityMoreRef = useRef(null);
    const [exportMenuOpen, setExportMenuOpen] = useState(null);

    useEffect(() => {
        if (!isMoreMenuOpen) {
            setExportMenuOpen((prev) => (prev === 'header' ? null : prev));
            return;
        }

        const handlePointerDown = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setIsMoreMenuOpen(false);
                setExportMenuOpen(null);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsMoreMenuOpen(false);
                setExportMenuOpen(null);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMoreMenuOpen]);

    useEffect(() => {
        setIsMoreMenuOpen(false);
        setIsActivityMoreOpen(false);
        setExportMenuOpen(null);
    }, [leadData?.id]);

    useEffect(() => {
        if (!isActivityMoreOpen) {
            setExportMenuOpen((prev) => (prev === 'activity' ? null : prev));
            return;
        }

        const handlePointerDown = (event) => {
            if (activityMoreRef.current && !activityMoreRef.current.contains(event.target)) {
                setIsActivityMoreOpen(false);
                setExportMenuOpen(null);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsActivityMoreOpen(false);
                setExportMenuOpen(null);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isActivityMoreOpen]);

    useEffect(() => {
        if (shouldScrollActivity && activeTab === 'activity') {
            if (activitySectionRef.current) {
                activitySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            setShouldScrollActivity(false);
        }
    }, [shouldScrollActivity, activeTab]);

    const handleToggleMoreMenu = useCallback(() => {
        setIsActivityMoreOpen(false);
        setExportMenuOpen(null);
        setIsMoreMenuOpen((prev) => !prev);
    }, []);

    const handleToggleActivityMoreMenu = useCallback(() => {
        setIsMoreMenuOpen(false);
        setExportMenuOpen(null);
        setIsActivityMoreOpen((prev) => !prev);
    }, []);

    const handleToggleExportOptions = useCallback((source) => {
        setExportMenuOpen((prev) => (prev === source ? null : source));
    }, []);

    const handleAddNote = useCallback(() => {
        setIsMoreMenuOpen(false);
        setIsActivityMoreOpen(false);
        setExportMenuOpen(null);
        setActiveTab('details');
        setOpenSections((prev) => ({ ...prev, About: true }));
        setEditingField('About-Notes');
        setEditValue(leadData?.notes || '');
    }, [leadData, setActiveTab, setOpenSections, setEditingField, setEditValue]);

    const handleExportLeadData = useCallback(
        (format) => {
            if (!leadData) {
                return;
            }

            const normalizedFormat = typeof format === 'string' ? format.toLowerCase() : '';
            const fileBase = sanitizeFileName(leadData?.name || 'lead');

            const triggerDownload = (blob, extension) => {
                const fileName = `${fileBase}-data.${extension}`;
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            };

            try {
                if (normalizedFormat === 'json') {
                    const jsonString = JSON.stringify(leadData, null, 2);
                    triggerDownload(new Blob([jsonString], { type: 'application/json' }), 'json');
                } else if (normalizedFormat === 'csv') {
                    const csvString = buildCsvFromLead(leadData);
                    triggerDownload(new Blob([csvString], { type: 'text/csv' }), 'csv');
                } else if (normalizedFormat === 'pdf') {
                    const pdfString = buildPdfFromLead(leadData);
                    triggerDownload(new Blob([pdfString], { type: 'application/pdf' }), 'pdf');
                } else {
                    console.warn(`Unsupported export format requested: ${format}`);
                }
            } catch (exportError) {
                console.error('Failed to export lead data:', exportError);
            } finally {
                setIsMoreMenuOpen(false);
                setIsActivityMoreOpen(false);
                setExportMenuOpen(null);
            }
        },
        [leadData]
    );

    const handleShowActivityFeed = useCallback(() => {
        setIsMoreMenuOpen(false);
        setIsActivityMoreOpen(false);
        setExportMenuOpen(null);
        setActiveTab('activity');
        setShouldScrollActivity(true);
    }, [setActiveTab]);

    const handleDeleteLeadClick = useCallback(() => {
        setIsMoreMenuOpen(false);
        setIsActivityMoreOpen(false);
        setExportMenuOpen(null);
        if (typeof onDeleteLead === 'function' && leadData?.id) {
            onDeleteLead(leadData.id);
        }
    }, [onDeleteLead, leadData]);

    const normalizedStatusLabel = useMemo(
        () => statusLabels[activeStatus] || leadData?.status || 'N/A',
        [statusLabels, activeStatus, leadData?.status]
    );

    const detailSections = useMemo(() => {
        const leadCurrency =
            leadData?.account_currency ||
            leadData?.currency ||
            leadData?.lead_currency ||
            leadData?.currency_type ||
            '';

        const leadAddress = [
            leadData?.address,
            leadData?.city,
            leadData?.state,
            leadData?.country
        ]
            .filter(Boolean)
            .join(', ');

        return [
            {
                title: 'About',
                fields: [
                    { label: 'Name', value: leadData?.name },
                    { label: 'Company', value: leadData?.company },
                    { label: 'Industry', value: leadData?.industry },
                    { label: 'interest', value: leadData?.interest },
                    { label: 'Notes', value: leadData?.notes, isMultiline: true },
                    { label: 'Lead Status', value: normalizedStatusLabel },
                    { label: 'Lead Account Method', value: leadData?.account_method },
                    { label: 'Lead Account Number', value: leadData?.account_number },
                    { label: 'Lead Account Name', value: leadData?.account_name },
                    { label: 'Lead Currency', value: leadCurrency },
                    { label: 'Bank Name (if)', value: leadData?.bank_name }
                ]
            },
            {
                title: 'Get in Touch',
                fields: [
                    { label: 'Name', value: leadAddress || leadData?.name },
                    { label: 'Phone', value: leadData?.phone },
                    { label: 'Email', value: leadData?.email }
                ]
            }
        ];
    }, [leadData, normalizedStatusLabel]);

    const activityActions = useMemo(
        () => [
            { label: 'New Task', icon: CheckSquare, onClick: onOpenNewTask },
            { label: 'Log a Call', icon: Phone, onClick: onOpenLogCall },
            { label: 'New Event', icon: Calendar, onClick: onOpenNewEvent },
            { label: 'Email', icon: Mail, onClick: onOpenEmailModal },
            { label: 'More', icon: Plus, menu: true }
        ],
        [onOpenNewTask, onOpenLogCall, onOpenNewEvent, onOpenEmailModal]
    );

    const { upcomingActivities, pastActivities } = useMemo(
        () => buildLeadActivities(leadData),
        [leadData]
    );

    const limitedUpcomingActivities = useMemo(
        () => upcomingActivities.slice(0, MAX_ACTIVITY_ITEMS),
        [upcomingActivities]
    );

    const limitedPastActivities = useMemo(
        () => pastActivities.slice(0, MAX_ACTIVITY_ITEMS),
        [pastActivities]
    );

    const duplicateSummary = useMemo(() => {
        const safeDuplicates = !duplicatesLoading && Array.isArray(duplicates) ? duplicates : [];
        const uniqueMap = new Map();

        safeDuplicates.forEach((item) => {
            if (item && typeof item === 'object' && item.id) {
                uniqueMap.set(item.id, item);
            }
        });

        if (
            clonedFrom &&
            typeof clonedFrom === 'object' &&
            clonedFrom.id &&
            clonedFrom.id !== leadData?.id &&
            !uniqueMap.has(clonedFrom.id)
        ) {
            uniqueMap.set(clonedFrom.id, clonedFrom);
        }

        const items = Array.from(uniqueMap.values());
        const isCloneLead =
            typeof leadData?.name === 'string' &&
            leadData.name.toLowerCase().includes('(copy');
        const clones = items.filter((item) => {
            const name = typeof item?.name === 'string' ? item.name.toLowerCase() : '';
            return name.includes('(copy');
        });

        let origin = null;
        if (isCloneLead) {
            origin =
                items.find((item) => {
                    const name = typeof item?.name === 'string' ? item.name.toLowerCase() : '';
                    return !name.includes('(copy');
                }) || (clonedFrom && clonedFrom.id !== leadData?.id ? clonedFrom : null);
        }

        return {
            items,
            clones,
            origin,
            isCloneLead,
        };
    }, [clonedFrom, duplicates, duplicatesLoading, leadData?.id, leadData?.name]);

    const duplicateEntries = duplicateSummary.items.filter(
        (item) => item && item.id && item.id !== leadData?.id
    );

    const prioritizedDuplicates = [...duplicateEntries];
    if (duplicateSummary.origin && duplicateSummary.origin.id) {
        prioritizedDuplicates.sort((a, b) => {
            if (a?.id === duplicateSummary.origin.id) return -1;
            if (b?.id === duplicateSummary.origin.id) return 1;
            return 0;
        });
    }

    const duplicatesToDisplay = prioritizedDuplicates.slice(0, 3);
    const duplicatesOverflow = Math.max(prioritizedDuplicates.length - duplicatesToDisplay.length, 0);

    const hasDuplicateMatches =
        duplicateSummary.items.length > 0 ||
        (duplicateSummary.isCloneLead && !!duplicateSummary.origin);

    const duplicateBannerStyles = hasDuplicateMatches
        ? { container: 'border-blue-100 bg-blue-50', icon: 'bg-blue-100 text-blue-600' }
        : { container: 'border-red-100 bg-white', icon: 'bg-yellow-100 text-yellow-600' };

    const duplicatesBannerMessage = (() => {
        if (
            duplicateSummary.isCloneLead &&
            duplicateSummary.origin &&
            duplicateSummary.origin.id &&
            duplicateSummary.origin.id !== leadData?.id
        ) {
            const originLabel =
                duplicateSummary.origin.name ||
                duplicateSummary.origin.email ||
                `Lead #${duplicateSummary.origin.id}`;

            return (
                <>
                    This lead was cloned from{' '}
                    <Link
                        to={`/SingleLeadPage/${duplicateSummary.origin.id}`}
                        state={{ fromDuplicate: leadData?.id }}
                        className="font-semibold text-gray-900 underline"
                    >
                        {originLabel}
                    </Link>
                    .
                </>
            );
        }

        if (duplicatesLoading) {
            return <>Checking for duplicate leads...</>;
        }

        if (duplicateSummary.items.length > 0) {
            const clonesCount = duplicateSummary.clones.length;
            const count = clonesCount > 0 ? clonesCount : duplicateSummary.items.length;
            const noun =
                clonesCount > 0
                    ? `cloned version${count > 1 ? 's' : ''}`
                    : `potential duplicate${count > 1 ? 's' : ''}`;

            return (
                <>
                    We found {count} {noun} of this lead.
                </>
            );
        }

        return <>We found no potential duplicates of this Lead.</>;
    })();

    const duplicateLinkItems = duplicatesToDisplay.map((duplicate) => {
        const duplicateName =
            duplicate?.name ||
            duplicate?.email ||
            (duplicate?.id ? `Lead #${duplicate.id}` : 'View record');

        const isOrigin =
            duplicateSummary.origin && duplicateSummary.origin.id === duplicate?.id;
        const name = typeof duplicate?.name === 'string' ? duplicate.name.toLowerCase() : '';
        const badgeLabel = isOrigin ? 'Original' : name.includes('(copy') ? 'Clone' : 'Duplicate';

        return (
            <Link
                key={duplicate.id}
                to={`/SingleLeadPage/${duplicate.id}`}
                state={{ fromDuplicate: leadData?.id }}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
            >
                <span>{duplicateName}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    {badgeLabel}
                </span>
            </Link>
        );
    });

    const duplicateChipsContent = duplicatesLoading ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="h-6 w-28 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
        </div>
    ) : duplicateLinkItems.length > 0 ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
            {duplicateLinkItems}
            {duplicatesOverflow > 0 && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                    +{duplicatesOverflow} more
                </span>
            )}
        </div>
    ) : null;

    const activityContent = showLogCallForm ? (
        <LogCallForm
            leadData={leadData}
            formData={logCallFormData}
            onChange={handleLogCallInputChange}
            onCancel={handleLogCallCancel}
            onSubmit={handleLogCallSubmit}
            isSubmitting={logCallSubmitting}
        />
    ) : (
        <>
            {/* Right Column - Now on Top */}
            <div className="flex gap-6">
                <div className="flex-1">
                    <div className={`rounded-lg border ${duplicateBannerStyles.container} px-5 py-4 shadow-sm`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-start gap-3 sm:flex-1">
                                <span
                                    className={`mt-0.5 flex h-6 w-7 items-center justify-center rounded-full ${duplicateBannerStyles.icon}`}
                                >
                                    <AlertCircle className="h-5 w-5" />
                                </span>
                                <p className="text-sm leading-5 text-gray-800">
                                    {duplicatesBannerMessage}
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                                {duplicateChipsContent}
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Tabs */}
                <div className="flex gap-0 border-b border-gray-200 px-6 pt-4">
                    {['activity', 'details', 'chatter', 'news'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 pb-3 cursor-pointer text-sm font-semibold capitalize transition ${activeTab === tab
                                ? 'border-b-2 border-gray-900 text-gray-900'
                                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="p-6">
                        <div className="space-y-4 animate-pulse">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-10 w-32 rounded bg-gray-200"></div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'activity' ? (
                    <div ref={activitySectionRef} className="flex flex-col" id="lead-activity-feed">
                        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-4 pt-6">
                            {activityActions.map(({ label, icon, onClick, menu }) => {
                                const isMenu = Boolean(menu);
                                const handleClick = () => {
                                    if (isMenu) {
                                        handleToggleActivityMoreMenu();
                                    } else if (onClick) {
                                        onClick();
                                    }
                                };

                                return (
                                    <div
                                        key={label}
                                        className="relative flex flex-col items-center"
                                        ref={isMenu ? activityMoreRef : null}
                                    >
                                        <button
                                            type="button"
                                            onClick={handleClick}
                                            className="flex cursor-pointer flex-col items-center gap-2 text-xs font-semibold text-gray-600 transition hover:text-gray-900 focus:outline-none"
                                        >
                                            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-50 transition hover:border-blue-200 hover:bg-blue-50">
                                                {React.createElement(icon, { className: 'h-5 w-5' })}
                                            </span>
                                            {label}
                                        </button>

                                        {isMenu && isActivityMoreOpen && (
                                            <div
                                                className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                                                role="menu"
                                                aria-label="Additional lead actions"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={handleAddNote}
                                                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                                                    role="menuitem"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    Add Note
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleExportOptions('activity')}
                                                        className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                                                        role="menuitem"
                                                        aria-haspopup="menu"
                                                        aria-expanded={exportMenuOpen === 'activity'}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Download className="h-4 w-4" />
                                                            Export Lead Data
                                                        </span>
                                                        <ChevronRight
                                                            className={`h-4 w-4 text-gray-400 transition ${exportMenuOpen === 'activity' ? 'rotate-90' : ''
                                                                }`}
                                                        />
                                                    </button>
                                                    {exportMenuOpen === 'activity' && (
                                                        <div
                                                            className="flex flex-col gap-1 border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-600"
                                                            role="menu"
                                                            aria-label="Select export format"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => handleExportLeadData('json')}
                                                                className="flex w-full cursor-pointer items-center justify-between rounded bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                <span>JSON</span>
                                                                <span className="text-gray-400">.json</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleExportLeadData('csv')}
                                                                className="flex w-full cursor-pointer items-center justify-between rounded bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                <span>CSV</span>
                                                                <span className="text-gray-400">.csv</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleExportLeadData('pdf')}
                                                                className="flex w-full cursor-pointer items-center justify-between rounded bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                <span>PDF</span>
                                                                <span className="text-gray-400">.pdf</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleShowActivityFeed}
                                                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                                                    role="menuitem"
                                                >
                                                    <List className="h-4 w-4" />
                                                    Activity Feed
                                                </button>
                                                <div className="my-1 border-t border-gray-100" />
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteLeadClick}
                                                    disabled={deletingLead}
                                                    className={`flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold transition ${deletingLead ? 'cursor-not-allowed text-red-300' : 'text-red-600 hover:bg-red-50'}`}
                                                    role="menuitem"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {deletingLead ? 'Deleting...' : 'Delete Lead'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                                                    items={limitedUpcomingActivities}
                                                    emptyTitle="No upcoming or overdue activities"
                                                    emptyDescription="Log a call, schedule a task, or create an event to see it appear in this timeline."
                                                />
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-100 px-4 py-5">
                                            <p className="text-sm font-semibold text-gray-700">Past Activities</p>
                                            <div className="mt-4">
                                                <ActivityTimelineList
                                                    items={limitedPastActivities}
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
                                className="mx-auto cursor-pointer block mb-5 rounded-full bg-gray-900 px-6 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
                            >
                                Show All Activities
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        {activeTab === 'details' ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div className="rounded border border-gray-200 bg-gray-50 p-4">
                                        <p className="mb-1 text-xs text-gray-600">Interest Level</p>
                                        <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                            <Zap className="h-4 w-4 text-yellow-500" />
                                            {leadData?.interest || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-4">
                                        <p className="mb-1 text-xs text-gray-600">Lead Priority</p>
                                        <p className="flex items-center gap-2 text-sm font-bold text-red-600">
                                            <Target className="h-4 w-4" />
                                            {leadData?.lead_priority || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div className="rounded border border-green-200 bg-green-50 p-4">
                                        <p className="mb-1 text-xs text-gray-600">Expected Deal Value</p>
                                        <p className="flex items-center gap-2 text-sm font-bold text-green-700">
                                            <TrendingUp className="h-4 w-4" />
                                            {leadData?.expected_deal_value
                                                ? `${parseFloat(leadData.expected_deal_value).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="rounded border border-blue-200 bg-blue-50 p-4">
                                        <p className="mb-1 text-xs text-gray-600">Expected Closing Date</p>
                                        <p className="flex items-center gap-2 text-sm font-bold text-blue-700">
                                            <Briefcase className="h-4 w-4" />
                                            {leadData?.expected_closing_date
                                                ? new Date(leadData.expected_closing_date).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded border border-gray-200 bg-gray-50 p-4">
                                    <p className="mb-2 text-xs text-gray-600">Notes</p>
                                    <p className="text-sm text-gray-900">{leadData?.notes || 'No notes'}</p>
                                </div>
                            </div>
                        ) : activeTab === 'chatter' ? (
                            <div className="space-y-4">
                                <h1>Not Available</h1>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h1>Not Available</h1>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded border border-red-300">
                    <p className="text-red-600 font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 relative ">
            {/* ? FIXED: Changed leadData?.lead?.client to leadData?.client */}
            {(showConversionOverlay && leadData?.status === 'converted' && leadData?.client) && (
                <>
                    <style>{overlayStyles}</style>
                    <div className="absolute  inset-0 backdrop-blur-xs z-50 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center opacity-5">
                            <svg className="w-96 h-96 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <div className="relative border border-gray-300 bg-white rounded-md shadow-2xl p-5 -mt-[42rem] max-w-3xl w-full mx-4" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <button
                                type="button"
                                onClick={onConversionOverlayClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                                aria-label="Dismiss conversion details"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-950 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your lead has been converted</h2>
                            </div>

                            {/* ? FIXED: All paths updated */}
                            <div className="grid grid-cols-3 gap-2 mb-8">
                                {/* Account Card */}
                                <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all hover:border-gray-300">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center shadow-md">
                                            <Briefcase className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-base font-bold text-gray-900 mb-3">
                                            {leadData?.client?.accounts?.[0]?.name || "Not Available"}
                                        </p>
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">industry</span>
                                                <span className="font-semibold text-gray-700">
                                                    {leadData?.client?.accounts?.[0]?.industry || "Not Available"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Bank Name:</span>
                                                <span className="font-semibold text-gray-700">
                                                    {leadData?.client?.accounts?.[0]?.bank_name || "Not Available"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Account Name:</span>
                                                <span className="font-semibold text-gray-700">
                                                    {leadData?.client?.accounts?.[0]?.account_name || "Not Available"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Account Currency:</span>
                                                <span className="font-semibold text-gray-700">
                                                    {leadData?.client?.accounts?.[0]?.account_currency || "Not Available"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Card */}
                                <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all hover:border-gray-300">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center shadow-md">
                                            <Phone className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-base font-bold text-gray-900 mb-3">
                                            {leadData?.client?.accounts[0]?.contacts?.[0]?.name || "Not Available"}
                                        </p>
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Email:</span>
                                                <span className="font-semibold text-gray-700">
                                                    {leadData?.client?.accounts[0]?.contacts?.[0]?.email || "Not Available"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Phone Number:</span>
                                                <span className="font-semibold text-gray-700">
                                                    {leadData?.client?.accounts[0]?.contacts?.[0]?.phone || "Not Available"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Converted At:</span>
                                                <span className="font-semibold text-gray-700">
                                                    {leadData?.client?.accounts?.[0]?.contacts?.[0]?.converted_at
                                                        ? new Date(leadData.client.accounts[0].contacts[0].converted_at)
                                                            .toLocaleString('en-US', {
                                                                dateStyle: 'medium',
                                                                timeStyle: 'short',
                                                            })
                                                        : "Not Available"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Opportunity Card */}
                                {leadData?.client?.opportunities?.length > 0 && (

                                    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all hover:border-gray-300">
                                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center shadow-md">
                                                <TrendingUp className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opportunity</h3>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-base font-bold text-gray-900 mb-3">
                                                {leadData?.client?.opportunities?.[0]?.title || "Not Available"}-OppLead
                                            </p>
                                            <div className="space-y-1.5 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Stage:</span>
                                                    <span className="font-semibold text-gray-700">
                                                        {leadData?.client?.opportunities?.[0]?.stage || "Not Available"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Amount:</span>
                                                    <span className="font-semibold text-gray-700">
                                                        {leadData?.client?.opportunities?.[0]?.amount || "Not Available"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Status:</span>
                                                    <span className="font-semibold text-gray-700">
                                                        {leadData?.client?.opportunities?.[0]?.status || "Not Available"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Expected Close Date</span>
                                                    <span className="font-semibold text-gray-700">
                                                        {leadData?.client?.opportunities?.[0]?.expected_close_date
                                                            ? new Date(leadData.client.opportunities[0].expected_close_date).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })
                                                            : 'No expected date'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>


                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>This lead is now locked and cannot be modified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* Toast Display */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={onToastClose}
                />
            )}
            {/* Header */}
            <div className="bg-white border-b border-gray-300 px-5 py-5">
                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-t from-gray-800 to-gray-950 rounded-full text-white font-bold flex items-center justify-center text-sm">
                                    {/* ? FIXED: leadData?.lead?.name to leadData?.name */}
                                    {leadData?.name?.charAt(0)?.toUpperCase() || 'L'}
                                </div>

                                <div>
                                    {/* ? FIXED: leadData?.lead?.name to leadData?.name */}
                                    <h1 className="text-xl font-bold text-black">{leadData?.name || 'N/A'}</h1>
                                    <p className="text-gray-600 text-xs">Lead</p>
                                </div>
                            </div>
                            <div className="relative flex items-center gap-1" ref={moreMenuRef}>
                                <button
                                    type="button"
                                    onClick={onCloneLead}
                                    disabled={cloning}
                                    aria-busy={cloning}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {cloning ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    {cloning ? 'Cloning...' : 'Clone Lead'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleToggleMoreMenu}
                                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    aria-label="More actions"
                                    aria-haspopup="menu"
                                    aria-expanded={isMoreMenuOpen}
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {isMoreMenuOpen && (
                                    <div
                                        className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                                        role="menu"
                                        aria-label="Lead actions"
                                    >
                                        <button
                                            type="button"
                                            onClick={handleAddNote}
                                            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                                            role="menuitem"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Add Note
                                        </button>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleExportOptions('header')}
                                                className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                                                role="menuitem"
                                                aria-haspopup="menu"
                                                aria-expanded={exportMenuOpen === 'header'}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Export Lead Data
                                                </span>
                                                <ChevronRight
                                                    className={`h-4 w-4 text-gray-400 transition ${exportMenuOpen === 'header' ? 'rotate-90' : ''
                                                        }`}
                                                />
                                            </button>
                                            {exportMenuOpen === 'header' && (
                                                <div
                                                    className="flex flex-col gap-1 border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-600"
                                                    role="menu"
                                                    aria-label="Select export format"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleExportLeadData('json')}
                                                        className="flex w-full cursor-pointer items-center justify-between rounded bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        <span>JSON</span>
                                                        <span className="text-gray-400">.json</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleExportLeadData('csv')}
                                                        className="flex w-full cursor-pointer items-center justify-between rounded bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        <span>CSV</span>
                                                        <span className="text-gray-400">.csv</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleExportLeadData('pdf')}
                                                        className="flex w-full cursor-pointer items-center justify-between rounded bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        <span>PDF</span>
                                                        <span className="text-gray-400">.pdf</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleShowActivityFeed}
                                            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                                            role="menuitem"
                                        >
                                            <List className="h-4 w-4" />
                                            Activity Feed
                                        </button>
                                        <div className="my-1 border-t border-gray-100" />
                                        <button
                                            type="button"
                                            onClick={handleDeleteLeadClick}
                                            disabled={deletingLead}
                                            className={`flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold transition ${deletingLead ? 'cursor-not-allowed text-red-300' : 'text-red-600 hover:bg-red-50'}`}
                                            role="menuitem"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {deletingLead ? 'Deleting...' : 'Delete Lead'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Info - These were already correct ? */}
                        <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-gray-50 p-4 rounded">
                            <div className="flex items-center gap-1">
                                <BriefcaseBusiness className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-gray-600">Company:</span>
                                <span className="font-semibold text-gray-900 ml-2">{leadData?.company || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Factory className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-gray-600">Industry:</span>
                                <span className="font-semibold text-gray-900 ml-2">{leadData?.industry || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-gray-600" />
                                <span className="font-semibold text-gray-900">{leadData?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-gray-600" />
                                <span className="font-semibold text-gray-900">{leadData?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <DatabaseZap className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-gray-600">Source:</span>
                                <span className="font-semibold text-gray-900 ml-2">{leadData?.source || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageSquareReply className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-gray-600">Response Score:</span>
                                <span className="font-semibold text-green-600 ml-2">{leadData?.response_score || 0}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-gray-600">Expected Deal Value:</span>
                                <span className="font-semibold text-gray-900 ml-2">
                                    {leadData?.expected_deal_value
                                        ? `$${parseFloat(leadData.expected_deal_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-gray-600">Expected Closing Date:</span>
                                <span className="font-semibold text-gray-900 ml-2">
                                    {leadData?.expected_closing_date
                                        ? new Date(leadData.expected_closing_date).toLocaleDateString('en-US', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Status Bar */}
                        <div className="w-full max-w-full mx-auto bg-gray-50 mt-8 p-2 rounded-full">
                            <div className="flex items-center justify-between flex-wrap gap-0">
                                {STATUS_BUTTON_CONFIG.map((config, index) => {
                                    const label = statusLabels[index] ?? '';
                                    const state =
                                        activeStatus === index
                                            ? 'active'
                                            : activeStatus > index
                                                ? 'completed'
                                                : 'default';

                                    const statusKey = (statuses[index] ?? '').toString().toLowerCase();
                                    const currentLeadStatus = (leadData?.status ?? '').toString().toLowerCase();
                                    const isConvertedLead = currentLeadStatus === 'converted';
                                    const isConvertedButton = statusKey === 'converted';
                                    const isDisabled = activeStatus > index || (isConvertedLead && isConvertedButton);

                                    const baseClasses = [
                                        'relative',
                                        config.extraClass,
                                        config.marginClass,
                                        config.paddingClass,
                                        'py-3',
                                        'text-xs',
                                        'font-medium',
                                        'transition-all',
                                        'whitespace-nowrap',
                                        'flex',
                                        'items-center',
                                        'justify-center',
                                    ]
                                        .filter(Boolean)
                                        .join(' ');

                                    const stateClass =
                                        state === 'active'
                                            ? 'text-white shadow-md'
                                            : state === 'completed'
                                                ? 'text-white opacity-50'
                                                : config.defaultTextClass;

                                    const interactionClass = isDisabled ? 'cursor-not-allowed' : 'cursor-pointer';

                                    const className = [baseClasses, stateClass, interactionClass]
                                        .filter(Boolean)
                                        .join(' ');

                                    const style = {
                                        background: config.colors[state] ?? config.colors.default,
                                        clipPath: config.clipPath,
                                        ...(config.borderRadius ? { borderRadius: config.borderRadius } : {}),
                                    };

                                    const overlayConfig = config.overlay;
                                    const overlay = overlayConfig
                                        ? (
                                            <span
                                                className={`pointer-events-none absolute inset-y-0 right-0 ${overlayConfig.widthClass}`}
                                                style={{
                                                    background: buildOverlayGradient(
                                                        overlayConfig.colors?.[state] ??
                                                        overlayConfig.colors?.default ??
                                                        config.colors[state],
                                                        state === 'default'
                                                            ? overlayConfig.dimAlpha
                                                            : overlayConfig.highlightAlpha
                                                    ),
                                                    clipPath: overlayConfig.clipPath,
                                                }}
                                            />
                                        )
                                        : null;

                                    return (
                                        <button
                                            key={`status-${index}`}
                                            type="button"
                                            onClick={() => handleStatusChange(index)}
                                            disabled={isDisabled}
                                            className={className}
                                            style={style}
                                        >
                                            <span className="relative z-10">{label}</span>
                                            {overlay}
                                        </button>
                                    );
                                })}

                                {/* Update Status Button */}
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={!statusChanged || updating}
                                    className={`cursor-pointer px-14 ml-3 py-3 text-white text-xs font-medium whitespace-nowrap rounded-full transition-all ${statusChanged
                                        ? 'bg-[#181819] hover:bg-[#000] shadow-md'
                                        : 'bg-gray-400 cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    {updating ? 'Updating...' : statusChanged ? 'Update Status' : '? Mark Status'}
                                </button>
                            </div>
                        </div>

                    </>
                )}
            </div>

            {/* Main Content */}
            <div className="mt-6 px-3 flex flex-col gap-3 xl:flex-row ">

                {/* Details Column */}
                <div className="w-full xl:w-[650px] flex-shrink-0 mb-10">
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        {detailSections.map((section, sectionIdx) => (
                            <div
                                key={section.title}
                                className={sectionIdx !== 0 ? 'border-t border-gray-200' : ''}
                            >
                                <div
                                    className="flex items-center justify-between bg-gray-50 px-6 py-4 cursor-pointer"
                                    onClick={() => setOpenSections(prev => ({
                                        ...prev,
                                        [section.title]: !prev[section.title]
                                    }))}
                                >
                                    <div className="flex items-center gap-2">
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition ${(openSections[section.title] ?? true) ? '' : 'rotate-180'}`} />
                                        <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                                    </div>
                                </div>
                                {(openSections[section.title] ?? true) && (
                                    <div>
                                        {section.fields.map((field, fieldIdx) => {
                                            const nonEditableFields = ["Lead Status", "Lead Account Method", "Lead Currency"];
                                            const isNonEditable = nonEditableFields.includes(field.label);
                                            const valueText =
                                                field?.value === null || field?.value === undefined || field?.value === ''
                                                    ? 'N/A'
                                                    : field.value;
                                            const isEmpty = valueText === 'N/A';
                                            return (
                                                <div
                                                    key={`${section.title}-${field.label}`}
                                                    className={`flex items-start gap-4 px-6 py-3 ${fieldIdx !== section.fields.length - 1 ? 'border-b border-gray-100' : ''
                                                        }`}
                                                >
                                                    <span className="w-28 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        {field.label}
                                                    </span>
                                                    {editingField === `${section.title}-${field.label}` ? (
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onBlur={() => {
                                                                handleFieldUpdate(field.label, editValue);
                                                                setEditingField(null);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleFieldUpdate(field.label, editValue);
                                                                    setEditingField(null);
                                                                }
                                                            }}
                                                            className="flex-1 text-sm font-medium rounded px-2 py-1 focus:outline-none border-0"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className={`flex-1 text-sm font-medium leading-5 ${isEmpty ? 'text-gray-400' : 'text-gray-900'} ${field.isMultiline ? 'whitespace-pre-wrap' : 'break-words'}`}>
                                                            {valueText}
                                                        </span>
                                                    )}

                                                    {!isNonEditable && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingField(`${section.title}-${field.label}`);
                                                                setEditValue(field.value || '');
                                                            }}
                                                            className="flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
                                                            aria-label={`Edit ${field.label}`}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}

                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Column */}
                <div className="min-w-0 flex-1 space-y-2 mb-10">
                    {activityContent}

                </div>
            </div>
        </div>
    );
};

export default React.memo(LeadPageContent);
