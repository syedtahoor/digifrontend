import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosMethods from '../../../axiosConfig';
import ConvertLeadModal from '../../components/Leads/ConvertLeadModal';
import NewTaskModal from './NewTaskModal';
import NewEvent from './NewEvent';
import SendEmailModal from './SendEmailModal';
import LeadPageContent from './LeadPageContent';

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

const STATUSES = [
    'new',
    'contacted',
    'qualified',
    'proposalsent',
    'disqualified',
    'converted',
];

const STATUS_LABELS = [
    'New - Not Contacted',
    'Contacted - Working',
    'Qualified',
    'Proposal Sent',
    'Disqualified',
    'Converted',
];

const FIELD_MAPPING = {
    Name: 'name',
    Email: 'email',
    Phone: 'phone',
    Company: 'company',
    Industry: 'industry',
    Status: 'status',
    Interest: 'interest',
    LeadPriority: 'lead_priority',
    ResponseScore: 'response_score',
    Notes: 'notes',
    LastContactedAt: 'last_contacted_at',
    ExpectedDealValue: 'expected_deal_value',
    ExpectedClosingDate: 'expected_closing_date',
    AccountNumber: 'account_number',
    AccountMethod: 'account_method',
    AccountName: 'account_name',
    BankName: 'bank_name',
    AccountCurrency: 'account_currency',
    Source: 'source',
    ConvertedAt: 'converted_at',
};

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

const buildTaskFormDefaults = (lead) => {
    const now = new Date();
    return {
        ...TASK_FORM_INITIAL_STATE,
        subject: lead?.name ? `Follow up with ${lead.name}` : '',
        assignedTo: TASK_FORM_INITIAL_STATE.assignedTo,
        name: lead?.name || '',
        relatedTo: lead?.company || '',
        dueDate: toDateInput(now),
        reminderDateTime: toDatetimeLocal(now),
        recurrenceStartDate: toDatetimeLocal(now),
        recurrenceEndDate: '',
    };
};

const buildEventFormDefaults = (lead) => {
    const start = new Date();
    const remainder = start.getMinutes() % 30;

    if (remainder !== 0) {
        start.setMinutes(start.getMinutes() + (30 - remainder), 0, 0);
    }

    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const reminder = new Date(start.getTime() - 15 * 60 * 1000);

    return {
        ...EVENT_FORM_INITIAL_STATE,
        subject: lead?.name ? `Event with ${lead.name}` : '',
        relatedTo: lead?.company || lead?.name || '',
        start_datetime: toDatetimeLocal(start),
        end_datetime: toDatetimeLocal(end),
        reminder_datetime: toDatetimeLocal(reminder),
    };
};

const buildEmailFormDefaults = (lead) => ({
    ...EMAIL_FORM_INITIAL_STATE,
    to: lead?.email?.trim() || '',
    subject: lead?.name ? `Follow up with ${lead.name}` : '',
});

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

export default function LeadPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { clonedFrom } = location.state || {};
    const leadId = useMemo(() => location.pathname.split('/').pop(), [location.pathname]);

    const [activeStatus, setActiveStatus] = useState(0);
    const [activeTab, setActiveTab] = useState('activity');
    const [leadData, setLeadData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusChanged, setStatusChanged] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState(null);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [openSections, setOpenSections] = useState({});
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
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
    const [emailFormData, setEmailFormData] = useState(() => buildEmailFormDefaults(null));
    const [emailValidationErrors, setEmailValidationErrors] = useState({});
    const [emailSubmitting, setEmailSubmitting] = useState(false);
    const [insightsOnly, setInsightsOnly] = useState(false);
    const [showUpcoming, setShowUpcoming] = useState(true);
    const [showConversionOverlay, setShowConversionOverlay] = useState(false);
    const [leadDuplicates, setLeadDuplicates] = useState([]);
    const [duplicatesLoading, setDuplicatesLoading] = useState(false);
    const [cloning, setCloning] = useState(false);
    const [deletingLead, setDeletingLead] = useState(false);

    const statuses = STATUSES;
    const statusLabels = STATUS_LABELS;
    const logCallRelatedTo = useMemo(() => {
        if (leadData?.company) {
            return leadData.company;
        }
        if (leadData?.name) {
            return leadData.name;
        }
        return 'Lead';
    }, [leadData]);

    const loadLeadDuplicates = useCallback(async (currentLeadId) => {
        setDuplicatesLoading(true);

        if (!currentLeadId) {
            setLeadDuplicates([]);
            setDuplicatesLoading(false);
            return;
        }

        try {
            const duplicateResponse = await axiosMethods.post('/leads/find-duplicates', {
                lead_id: currentLeadId,
            });

            const duplicates =
                duplicateResponse.data?.data?.duplicates ||
                duplicateResponse.data?.duplicates ||
                [];

            setLeadDuplicates(Array.isArray(duplicates) ? duplicates : []);
        } catch (error) {
            console.error('Lead duplicate fetch failed:', error);
            setLeadDuplicates([]);
        } finally {
            setDuplicatesLoading(false);
        }
    }, []);

    const fetchLeadData = useCallback(async () => {
        if (!leadId) {
            setError('Lead ID missing from URL');
            return;
        }

        try {
            setLoading(true);
            const response = await axiosMethods.post('/getSingleLeadData', {
                lead_id: leadId,
            });

            const leadInfo = response.data?.data?.lead || response.data?.lead || response;

            setLeadData(leadInfo);
            loadLeadDuplicates(leadInfo?.id);

            if (leadInfo?.status) {
                const statusIndex = statuses.findIndex(
                    (status) => status.toLowerCase() === leadInfo.status.toLowerCase()
                );
                if (statusIndex !== -1) {
                    setActiveStatus(statusIndex);
                }
            }

            setError(null);
        } catch (err) {
            console.error('Lead data fetch failed:', err);
            console.error('Error details:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to Load Leads');
            setLeadDuplicates([]);
            setDuplicatesLoading(false);
        } finally {
            setLoading(false);
        }
    }, [leadId, statuses, loadLeadDuplicates]);

    useEffect(() => {
        setLeadDuplicates([]);
        setDuplicatesLoading(false);
    }, [leadId]);

    useEffect(() => {
        fetchLeadData();
    }, [fetchLeadData]);

    const handleCloneLead = useCallback(async () => {
        if (!leadData) {
            setToast({
                message: 'Lead data not available to clone.',
                type: 'error',
            });
            return;
        }

        const email = typeof leadData.email === 'string' ? leadData.email.trim() : '';
        if (!email) {
            setToast({
                message: 'Email is required on the lead before cloning.',
                type: 'error',
            });
            return;
        }

        const normalizedStatus = (() => {
            const status = typeof leadData.status === 'string' ? leadData.status.toLowerCase() : '';
            return STATUSES.includes(status) ? status : 'new';
        })();

        const normalizedPriority = (() => {
            const priority = typeof leadData.lead_priority === 'string' ? leadData.lead_priority.toLowerCase() : '';
            return ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
        })();

        const normalizedAccountMethod = (() => {
            const method = typeof leadData.account_method === 'string' ? leadData.account_method.toLowerCase() : '';
            return ['paypal', 'bank'].includes(method) ? method : null;
        })();

        const bankName =
            typeof leadData.bank_name === 'string' ? leadData.bank_name.trim() : leadData.bank_name || null;

        if (normalizedAccountMethod === 'bank' && !bankName) {
            setToast({
                message: 'Bank name is required to clone a lead with bank details.',
                type: 'error',
            });
            return;
        }

        const parsedResponseScore = (() => {
            const value = leadData.response_score;
            if (value === undefined || value === null) {
                return null;
            }
            const normalized = typeof value === 'string' ? value.trim() : value;
            if (normalized === '') {
                return null;
            }
            const numericValue = Number(normalized);
            return Number.isFinite(numericValue) ? numericValue : null;
        })();

        const parsedDealValue = (() => {
            const value = leadData.expected_deal_value;
            if (value === undefined || value === null) {
                return null;
            }
            const normalized = typeof value === 'string' ? value.trim() : value;
            if (normalized === '') {
                return null;
            }
            const numericValue = Number(normalized);
            return Number.isFinite(numericValue) ? numericValue : null;
        })();

        const payload = {
            name: leadData.name ? `${leadData.name} (Copy)` : 'Cloned Lead',
            email,
            phone: leadData.phone || null,
            company: leadData.company || null,
            industry: leadData.industry || null,
            source: leadData.source || null,
            status: normalizedStatus,
            interest: leadData.interest || null,
            lead_priority: normalizedPriority,
            response_score: parsedResponseScore,
            notes: leadData.notes || null,
            expected_deal_value: parsedDealValue,
            expected_closing_date: leadData.expected_closing_date || null,
            account_number: leadData.account_number || null,
            account_currency: leadData.account_currency || null,
            account_method: normalizedAccountMethod,
            account_name: leadData.account_name || null,
            bank_name: normalizedAccountMethod === 'bank' ? bankName : null,
        };

        if (
            payload.expected_closing_date &&
            typeof payload.expected_closing_date === 'string' &&
            payload.expected_closing_date.includes('T')
        ) {
            payload.expected_closing_date = payload.expected_closing_date.split('T')[0];
        }

        setCloning(true);

        try {
            const response = await axiosMethods.post('/leads', payload);
            const newLead = response.data?.data || response.data;

            setToast({
                message: 'Lead cloned successfully.',
                type: 'success',
            });

            if (newLead?.id) {
                navigate(`/SingleLeadPage/${newLead.id}`, {
                    state: {
                        clonedFrom: {
                            id: leadData?.id,
                            name: leadData?.name || null,
                            email: leadData?.email || null,
                        },
                    },
                });
            } else {
                await fetchLeadData();
            }
        } catch (err) {
            console.error('Clone lead failed:', err);

            const errorResponse = err.response?.data;
            let errorMessage = 'Failed to clone lead.';
            if (errorResponse?.errors) {
                const firstError = Object.values(errorResponse.errors)[0];
                if (Array.isArray(firstError) && firstError[0]) {
                    errorMessage = firstError[0];
                }
            } else if (errorResponse?.message) {
                errorMessage = errorResponse.message;
            }

            setToast({
                message: errorMessage,
                type: 'error',
            });
        } finally {
            setCloning(false);
        }
    }, [fetchLeadData, leadData, navigate]);

    const handleDeleteLead = useCallback(async () => {
        if (!leadData?.id || deletingLead) {
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to delete this lead? This action cannot be undone.'
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingLead(true);
            const response = await axiosMethods.delete(`/leads/${leadData.id}`);

            if (response?.success) {
                setToast({
                    message: 'Lead deleted successfully',
                    type: 'success',
                });

                setTimeout(() => {
                    navigate('/leads');
                }, 1200);
            } else {
                setToast({
                    message: response?.message || 'Unable to delete lead. Please try again.',
                    type: 'error',
                });
            }
        } catch (error) {
            console.error('Failed to delete lead:', error);
            const message =
                error?.response?.data?.message ||
                getFirstValidationMessage(error) ||
                error?.message ||
                'An unexpected error occurred while deleting the lead.';

            setToast({
                message,
                type: 'error',
            });
        } finally {
            setDeletingLead(false);
        }
    }, [leadData, deletingLead, navigate]);

    const handleOpenLogCallForm = useCallback(() => {
        const now = new Date();
        setLogCallFormData({
            ...LOG_CALL_INITIAL_STATE,
            subject: leadData?.name ? `Call with ${leadData.name}` : '',
            callDateTime: toDatetimeLocal(now),
        });
        setShowNewEventModal(false);
        setShowNewTaskModal(false);
        setShowLogCallForm(true);
    }, [leadData]);

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

    const handleLogCallSubmit = useCallback(async (event) => {
        event.preventDefault();

        if (!logCallFormData.callDateTime) {
            setToast({
                message: 'Please provide a valid call date and time.',
                type: 'error',
            });
            return;
        }

        const formattedCallDateTime = formatDateTimeForApi(logCallFormData.callDateTime);
        if (!formattedCallDateTime) {
            setToast({
                message: 'Invalid call date and time format.',
                type: 'error',
            });
            return;
        }

        const payload = {
            lead_id: leadId,
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
            setToast({
                message: response?.message || 'Call log created successfully!',
                type: 'success',
            });
            setLogCallFormData({ ...LOG_CALL_INITIAL_STATE });
            setShowLogCallForm(false);
            fetchLeadData();
        } catch (err) {
            const validationMessage = getFirstValidationMessage(err);
            const errorMessage =
                validationMessage ||
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Failed to create call log.';
            setToast({
                message: errorMessage,
                type: 'error',
            });
            console.error('Error logging call:', err);
        } finally {
            setLogCallSubmitting(false);
        }
    }, [fetchLeadData, leadId, logCallFormData, logCallRelatedTo]);

    const handleOpenNewEventForm = useCallback(() => {
        setEventFormData((prev) => ({
            ...buildEventFormDefaults(leadData),
            attendees: prev.attendees?.length ? prev.attendees : [createEmptyAttendee()],
        }));
        setShowLogCallForm(false);
        setShowNewTaskModal(false);
        setShowNewEventModal(true);
    }, [leadData]);

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

            if (!leadId) {
                setToast({
                    message: 'Missing lead context. Please reload and try again.',
                    type: 'error',
                });
                return;
            }

            if (!eventFormData.start_datetime || !eventFormData.end_datetime) {
                setToast({
                    message: 'Please provide valid start and end times.',
                    type: 'error',
                });
                return;
            }

            const startDateTime = formatDateTimeForApi(eventFormData.start_datetime);
            const endDateTime = formatDateTimeForApi(eventFormData.end_datetime);

            if (!startDateTime || !endDateTime) {
                setToast({
                    message: 'Please provide valid start and end times.',
                    type: 'error',
                });
                return;
            }

            if (new Date(eventFormData.end_datetime) <= new Date(eventFormData.start_datetime)) {
                setToast({
                    message: 'End time must be after the start time.',
                    type: 'error',
                });
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

            const clientId =
                leadData?.client_id ??
                leadData?.client?.id ??
                leadData?.client?.client_id ??
                null;
            const accountId =
                leadData?.account_id ??
                leadData?.client?.accounts?.[0]?.id ??
                null;
            const contactId =
                leadData?.contact_id ??
                leadData?.client?.accounts?.[0]?.contacts?.[0]?.id ??
                null;

            const payload = {
                lead_id: leadId,
                client_id: clientId,
                account_id: accountId,
                contact_id: contactId,
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

                if (response?.success) {
                    const toastLeadName =
                        leadData?.name ||
                        leadData?.client?.name ||
                        leadData?.company ||
                        '';
                    setToast({
                        message: response?.message || (toastLeadName ? `Event created for ${toastLeadName}` : 'Event created successfully!'),
                        type: 'success',
                    });
                    setEventFormData({ ...EVENT_FORM_INITIAL_STATE, attendees: [] });
                    setShowNewEventModal(false);
                    fetchLeadData();
                } else {
                    setToast({
                        message: response?.message || 'Failed to create event.',
                        type: 'error',
                    });
                }
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    'Failed to create event.';
                setToast({
                    message: errorMessage,
                    type: 'error',
                });
                console.error('Error creating event:', err);
            } finally {
                setEventSubmitting(false);
            }
        },
        [eventFormData, fetchLeadData, leadData, leadId]
    );

    const handleOpenEmailModal = useCallback(() => {
        setEmailFormData(buildEmailFormDefaults(leadData));
        setEmailValidationErrors({});
        setEmailSubmitting(false);
        setShowLogCallForm(false);
        setShowNewTaskModal(false);
        setShowNewEventModal(false);
        setShowEmailModal(true);
    }, [leadData]);

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
        setEmailFormData(buildEmailFormDefaults(leadData));
    }, [leadData]);

    const handleEmailSubmit = useCallback(() => {
        setToast({
            message: 'Email modal submitted.',
            type: 'success',
        });
        setShowEmailModal(false);
    }, [setToast]);

    const handleOpenNewTaskModal = useCallback(() => {
        setTaskFormData(buildTaskFormDefaults(leadData));
        setShowLogCallForm(false);
        setShowNewEventModal(false);
        setShowNewTaskModal(true);
    }, [leadData]);

    const handleTaskInputChange = useCallback((event) => {
        const { name, value, type, checked } = event.target;
        setTaskFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    const handleTaskCancel = useCallback(() => {
        setShowNewTaskModal(false);
        setTaskFormData(buildTaskFormDefaults(leadData));
    }, [leadData]);

    const submitTaskForm = useCallback(
        async ({ keepOpen }) => {
            if (!leadId) {
                setToast({
                    message: 'Missing lead context. Please reload and try again.',
                    type: 'error',
                });
                return;
            }

            const clientId =
                leadData?.client_id ??
                leadData?.client?.id ??
                leadData?.client?.client_id ??
                null;
            const accountId =
                leadData?.account_id ??
                leadData?.client?.accounts?.[0]?.id ??
                null;
            const contactId =
                leadData?.contact_id ??
                leadData?.client?.accounts?.[0]?.contacts?.[0]?.id ??
                null;

            const payload = {
                lead_id: leadId,
                client_id: clientId,
                account_id: accountId,
                contact_id: contactId,
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

                const toastLeadName =
                    leadData?.name || leadData?.client?.name || leadData?.company || '';
                setToast({
                    message:
                        toastLeadName?.length
                            ? `Task created for ${toastLeadName}`
                            : response?.message || 'Task created successfully!',
                    type: 'success',
                });

                if (keepOpen) {
                    setTaskFormData(buildTaskFormDefaults(leadData));
                } else {
                    setShowNewTaskModal(false);
                    setTaskFormData(buildTaskFormDefaults(leadData));
                }

                fetchLeadData();
            } catch (err) {
                const validationMessage = getFirstValidationMessage(err);
                const errorMessage =
                    validationMessage ||
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    'Failed to create task.';
                setToast({
                    message: errorMessage,
                    type: 'error',
                });
                console.error('Error saving task:', err);
            } finally {
                setTaskSubmitting(false);
            }
        },
        [fetchLeadData, leadData, leadId, taskFormData]
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

    const handleFieldUpdate = useCallback(
        async (field, value) => {
            const mappedField = FIELD_MAPPING[field];

            if (!mappedField) {
                setToast({
                    message: 'Invalid field name',
                    type: 'error',
                });
                return;
            }

            try {
                const response = await axiosMethods.post('/updateLeadData', {
                    lead_id: leadId,
                    field: mappedField,
                    value,
                });

                if (response.success) {
                    setToast({
                        message: `Field '${field}' updated successfully!`,
                        type: 'success',
                    });
                    fetchLeadData();
                } else {
                    setToast({
                        message: response.message || 'Something went wrong.',
                        type: 'error',
                    });
                }
            } catch (err) {
                setToast({
                    message: 'An error occurred while updating the field.',
                    type: 'error',
                });
                console.error('Error updating field:', err);
            }
        },
        [fetchLeadData, leadId]
    );

    const handleStatusChange = useCallback((statusIndex) => {
        setActiveStatus(statusIndex);
        setStatusChanged(true);
    }, []);

    const handleUpdateStatus = useCallback(async () => {
        if (statuses[activeStatus] === 'converted') {
            setShowConvertModal(true);
            return;
        }

        if (statuses[activeStatus] === leadData?.status) {
            setToast({
                message: 'Status already the same',
                type: 'success',
            });
            setStatusChanged(false);
            return;
        }

        try {
            setUpdating(true);
            await axiosMethods.post('/updateLeadStatus', {
                lead_id: leadId,
                status: statuses[activeStatus],
            });
            setStatusChanged(false);
            fetchLeadData();
            setToast({
                message: 'Status Updated!',
                type: 'success',
            });
        } catch (err) {
            console.error('Update failed:', err);
            setToast({
                message: err.response?.data?.message || 'Failed to update status.',
                type: 'error',
            });
        } finally {
            setUpdating(false);
        }
    }, [activeStatus, fetchLeadData, leadData?.status, leadId, statuses]);

    const handleConvertLead = useCallback(
        async (conversionPayload) => {
            try {
                setUpdating(true);
                const payload = {
                    ...(conversionPayload || {}),
                    lead_id: conversionPayload?.lead_id || leadId,
                };
                await axiosMethods.post('/updateLeadStatus', payload);
                setShowConvertModal(false);
                setStatusChanged(false);
                await fetchLeadData();

                setShowConversionOverlay(true);

                setToast({
                    message: 'Lead Converted Successfully!',
                    type: 'success',
                });
            } catch (err) {
                console.error('Convert failed:', err);
                setToast({
                    message: err.response?.data?.message || 'Failed to convert lead.',
                    type: 'error',
                });
            } finally {
                setUpdating(false);
            }
        },
        [fetchLeadData, leadId]
    );

    const handleToastClose = useCallback(() => {
        setToast(null);
    }, []);

    const handleConversionOverlayClose = useCallback(() => {
        setShowConversionOverlay(false);
    }, []);

    const convertModalCancel = useCallback(() => {
        setShowConvertModal(false);
        setStatusChanged(false);

        if (leadData?.status) {
            const statusIndex = statuses.findIndex(
                (status) => status.toLowerCase() === leadData.status.toLowerCase()
            );
            if (statusIndex !== -1) {
                setActiveStatus(statusIndex);
            }
        }
    }, [leadData?.status, statuses]);

    return (
        <>
            <LeadPageContent
                error={error}
                leadData={leadData}
                toast={toast}
                onToastClose={handleToastClose}
                loading={loading}
                statusLabels={statusLabels}
                statuses={statuses}
                activeStatus={activeStatus}
                statusChanged={statusChanged}
                updating={updating}
                handleStatusChange={handleStatusChange}
                handleUpdateStatus={handleUpdateStatus}
                openSections={openSections}
                setOpenSections={setOpenSections}
                editingField={editingField}
                setEditingField={setEditingField}
                editValue={editValue}
                setEditValue={setEditValue}
                handleFieldUpdate={handleFieldUpdate}
                showLogCallForm={showLogCallForm}
                logCallFormData={logCallFormData}
                handleLogCallInputChange={handleLogCallInputChange}
                handleLogCallCancel={handleLogCallCancel}
                handleLogCallSubmit={handleLogCallSubmit}
                logCallSubmitting={logCallSubmitting}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                insightsOnly={insightsOnly}
                setInsightsOnly={setInsightsOnly}
                showUpcoming={showUpcoming}
                setShowUpcoming={setShowUpcoming}
                onOpenNewTask={handleOpenNewTaskModal}
                onOpenLogCall={handleOpenLogCallForm}
                onOpenNewEvent={handleOpenNewEventForm}
                onOpenEmailModal={handleOpenEmailModal}
                showConversionOverlay={showConversionOverlay}
                onConversionOverlayClose={handleConversionOverlayClose}
                duplicates={leadDuplicates}
                clonedFrom={clonedFrom}
                duplicatesLoading={duplicatesLoading}
                onCloneLead={handleCloneLead}
                cloning={cloning}
                onDeleteLead={handleDeleteLead}
                deletingLead={deletingLead}
            />

            <NewTaskModal
                isOpen={showNewTaskModal}
                formData={taskFormData}
                onChange={handleTaskInputChange}
                onSubmit={handleTaskSubmit}
                onSaveAndNew={handleTaskSaveAndNew}
                onCancel={handleTaskCancel}
                isSubmitting={taskSubmitting}
            />

            <NewEvent
                isOpen={showNewEventModal}
                leadData={leadData}
                formData={eventFormData}
                onChange={handleEventInputChange}
                onAttendeeChange={handleEventAttendeeChange}
                onAddAttendee={handleAddEventAttendee}
                onRemoveAttendee={handleRemoveEventAttendee}
                onCancel={handleEventCancel}
                onSubmit={handleEventSubmit}
                isSubmitting={eventSubmitting}
            />

            <SendEmailModal
                isOpen={showEmailModal}
                leadName={leadData?.name}
                formData={emailFormData}
                validationErrors={emailValidationErrors}
                onFieldChange={handleEmailFieldChange}
                onSubmit={handleEmailSubmit}
                onCancel={handleEmailModalCancel}
                isSubmitting={emailSubmitting}
            />

            {showConvertModal && (
                <ConvertLeadModal
                    leadData={leadData}
                    leadId={leadId}
                    isSubmitting={updating}
                    onConvert={handleConvertLead}
                    onCancel={convertModalCancel}
                />
            )}
        </>
    );
}
















