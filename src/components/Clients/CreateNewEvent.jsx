import React from 'react';
import { Loader2, X } from 'lucide-react';

const EVENT_TYPE_OPTIONS = ['Meeting', 'Call', 'Demo', 'Follow-up', 'Other'];

export default function CreateNewEvent({
    isOpen = false,
    leadData,
    formData,
    onChange,
    onAttendeeChange = () => {},
    onAddAttendee = () => {},
    onRemoveAttendee = () => {},
    onCancel,
    onSubmit,
    isSubmitting = false,
}) {
    const leadName = leadData?.name || '';
    const relatedEntity = leadData?.company || leadName || 'record';

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 px-4 py-8">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-md bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">New Event</h2>
                        <p className="text-sm text-gray-500">
                            Schedule time with {leadName || 'this lead'}.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full cursor-pointer p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="max-h-[80vh] overflow-y-auto px-6 py-6 space-y-8"
                >
                    <section className="space-y-4">
                        <header className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                                Event Information
                            </h3>
                            <span className="text-xs text-gray-400">
                                <span className="text-red-500">*</span> Required Information
                            </span>
                        </header>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                Subject
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={onChange}
                                    className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                                    placeholder={`Event with ${leadName || 'lead'}`}
                                    required
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                Event Type
                                <select
                                    name="event_type"
                                    value={formData.event_type}
                                    onChange={onChange}
                                    className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none cursor-pointer"
                                >
                                    {EVENT_TYPE_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            Assigned To
                            <input
                                type="text"
                                name="assignedTo"
                                disabled
                                value={formData.assignedTo}
                                onChange={onChange}
                                className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            Related To
                            <input
                                type="text"
                                name="relatedTo"
                                value={formData.relatedTo}
                                onChange={onChange}
                                className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                                placeholder={relatedEntity}
                            />
                        </label>
                    </section>

                    {!formData.all_day && (
                        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                Start
                                <input
                                    type="datetime-local"
                                    name="start_datetime"
                                    value={formData.start_datetime}
                                    onChange={onChange}
                                    className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                                    required
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                End
                                <input
                                    type="datetime-local"
                                    name="end_datetime"
                                    value={formData.end_datetime}
                                    onChange={onChange}
                                    className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                                    required
                                />
                            </label>
                        </section>
                    )}

                    <section className="space-y-4">
                        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                name="all_day"
                                checked={formData.all_day}
                                onChange={onChange}
                                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            />
                            All-day event
                        </label>

                        {formData.all_day && (
                            <p className="-mt-2 text-xs text-gray-500">
                                This event will be marked as an all-day event. Start and end times are not required.
                            </p>
                        )}

                        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            Location
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={onChange}
                                className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                                placeholder="Office HQ, Zoom, etc."
                            />
                        </label>

                        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            Description
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={onChange}
                                className="min-h-[120px] rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                                placeholder="Agenda, goals, and talking points..."
                            />
                        </label>
                    </section>

                    <section className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                name="set_reminder"
                                checked={formData.set_reminder}
                                onChange={onChange}
                                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            />
                            Set reminder
                        </label>
                        {formData.set_reminder && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                    Reminder Date &amp; Time
                                    <input
                                        type="datetime-local"
                                        name="reminder_datetime"
                                        value={formData.reminder_datetime}
                                        onChange={onChange}
                                        className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                                        required
                                    />
                                </label>
                            </div>
                        )}
                    </section>

                    <section className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                name="attendees_enabled"
                                checked={formData.attendees_enabled}
                                onChange={onChange}
                                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            />
                            Include attendees
                        </label>

                        {formData.attendees_enabled && (
                            <div className="space-y-4">
                                {formData.attendees?.length ? (
                                    formData.attendees.map((attendee, index) => (
                                        <div
                                            key={`attendee-${index}`}
                                            className="space-y-3 rounded-lg border border-gray-200 bg-white px-4 py-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    Attendee {index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveAttendee(index)}
                                                    className="text-xs cursor-pointer font-semibold text-red-500 transition hover:text-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                                    Name
                                                    <input
                                                        type="text"
                                                        value={attendee?.name || ''}
                                                        onChange={(event) =>
                                                            onAttendeeChange(index, 'name', event.target.value)
                                                        }
                                                        className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                                                        placeholder="Ali Khan"
                                                        autoComplete="off"
                                                    />
                                                </label>
                                                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                                    Email
                                                    <input
                                                        type="email"
                                                        value={attendee?.email || ''}
                                                        onChange={(event) =>
                                                            onAttendeeChange(index, 'email', event.target.value)
                                                        }
                                                        className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                                                        placeholder="ali@example.com"
                                                        autoComplete="off"
                                                    />
                                                </label>
                                                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                                    Phone
                                                    <input
                                                        type="tel"
                                                        value={attendee?.phone || ''}
                                                        onChange={(event) =>
                                                            onAttendeeChange(index, 'phone', event.target.value)
                                                        }
                                                        className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
                                                        placeholder="+92..."
                                                        autoComplete="off"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="rounded border border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                                        No attendees added yet. Use "Add attendee" to include participants.
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={onAddAttendee}
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
                                >
                                    Add attendee
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="flex flex-col gap-3 text-xs text-gray-500">
                        <p>
                            The event will be associated with{' '}
                            <span className="font-semibold text-gray-700">{relatedEntity}</span>.
                        </p>
                    </section>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gray-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}