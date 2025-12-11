import React from 'react';
import { Loader2, X } from 'lucide-react';

const RECURRENCE_TYPE_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Custom'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SectionHeader = ({ title }) => (
    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
);

const FieldLabel = ({ label, required = false, children }) => (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        <span className="flex items-center gap-1">
            {label}
            {required ? <span className="text-red-500">*</span> : null}
        </span>
        {children}
    </label>
);

const FieldHint = ({ children }) =>
    children ? <p className="text-xs text-gray-500">{children}</p> : null;

const ModalFrame = ({ title, subtitle, onClose, children }) => (
    <div className="relative w-full max-w-5xl overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {subtitle ? (
                    <p className="text-sm text-gray-500">{subtitle}</p>
                ) : null}
            </div>
            <button
                type="button"
                onClick={onClose}
                className="rounded-full cursor-pointer p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
        {children}
    </div>
);

const CheckboxWithLabel = ({ label, name, checked, onChange }) => (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        {label}
    </label>
);

const NewTaskModal = ({
    isOpen,
    formData,
    onChange,
    onSubmit,
    onSaveAndNew,
    onCancel,
    isSubmitting = false,
}) => {
    const handleRecurrenceTypeChange = (event) => {
        const { value } = event.target;
        onChange(event);
        if (value !== 'Weekly' && Array.isArray(formData.recurrenceDaysOfWeek) && formData.recurrenceDaysOfWeek.length) {
            onChange({
                target: {
                    name: 'recurrenceDaysOfWeek',
                    value: [],
                    type: 'custom',
                },
            });
        }
    };

    const handleRecurrenceDaysChange = (event) => {
        const { value, checked } = event.target;
        const currentDays = Array.isArray(formData.recurrenceDaysOfWeek) ? formData.recurrenceDaysOfWeek : [];
        const updatedDays = checked
            ? [...currentDays, value].filter((day, index, array) => array.indexOf(day) === index)
            : currentDays.filter((day) => day !== value);

        onChange({
            target: {
                name: 'recurrenceDaysOfWeek',
                value: updatedDays,
                type: 'custom',
            },
        });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 px-4 py-8">
            <ModalFrame
                title="New Task"
                subtitle="Fill in the task details below."
                onClose={onCancel}
            >
                <form
                    onSubmit={onSubmit}
                    className="max-h-[80vh] overflow-y-auto px-6 py-6 space-y-8"
                >
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <SectionHeader title="Task Information" />
                            <span className="text-xs text-gray-400">
                                <span className="text-red-500">*</span> Required Information
                            </span>
                        </div>
                        <div className="grid gap-4 ">
                            <FieldLabel label="Subject" required>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={onChange}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                    required
                                />
                            </FieldLabel>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FieldLabel label="Assigned To" required>
                                <input
                                    type="text"
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    disabled
                                    onChange={onChange}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                    required
                                />
                                <FieldHint>Person responsible for this task.</FieldHint>
                            </FieldLabel>
                            <FieldLabel label="Due Date">
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={onChange}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                />
                            </FieldLabel>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FieldLabel label="Name">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={onChange}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                />
                                <FieldHint>Contact or lead connected to this task.</FieldHint>
                            </FieldLabel>
                            <FieldLabel label="Related To">
                                <input
                                    type="text"
                                    name="relatedTo"
                                    value={formData.relatedTo}
                                    onChange={onChange}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                />
                                <FieldHint>Account or deal associated with this task.</FieldHint>
                            </FieldLabel>
                        </div>

                        <FieldLabel label="Comments">
                            <textarea
                                name="comments"
                                value={formData.comments}
                                onChange={onChange}
                                className="min-h-[120px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                placeholder="Add any context or next steps..."
                            />
                            <FieldHint>
                                Tip: Type Control + period to insert quick text.
                            </FieldHint>
                        </FieldLabel>
                    </section>

                    <section className="space-y-4">
                        <SectionHeader title="Additional Information" />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FieldLabel label="Priority" required>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={onChange}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                    required
                                >
                                    <option value="High">High</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Low">Low</option>
                                </select>
                            </FieldLabel>
                            <FieldLabel label="Status" required>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={onChange}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                    required
                                >
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Deferred">Deferred</option>
                                </select>
                            </FieldLabel>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <SectionHeader title="Other Information" />
                        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                            <CheckboxWithLabel
                                label="Reminder Set"
                                name="reminderSet"
                                checked={formData.reminderSet}
                                onChange={onChange}
                            />
                            {formData.reminderSet ? (
                                <div className="grid gap-4 ">
                                    <FieldLabel label="Reminder Date & Time">
                                        <input
                                            type="datetime-local"
                                            name="reminderDateTime"
                                            value={formData.reminderDateTime}
                                            onChange={onChange}
                                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                        />
                                    </FieldLabel>

                                </div>
                            ) : null}
                            <CheckboxWithLabel
                                label="Create Recurring Series of Tasks"
                                name="recurring"
                                checked={formData.recurring}
                                onChange={onChange}
                            />
                            {formData.recurring ? (
                                <div className="space-y-4 rounded-lg border border-dashed border-gray-300 bg-white p-4">
                                    <FieldLabel label="Recurrence Type" required>
                                        <select
                                            name="recurrenceType"
                                            value={formData.recurrenceType}
                                            onChange={handleRecurrenceTypeChange}
                                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                            required
                                        >
                                            {RECURRENCE_TYPE_OPTIONS.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </FieldLabel>
                                    <FieldLabel label="Repeat Every" required>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="1"
                                                name="recurrenceInterval"
                                                value={formData.recurrenceInterval}
                                                onChange={onChange}
                                                className="w-24 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                                required
                                            />
                                            <span className="text-sm text-gray-500">
                                                {formData.recurrenceType === 'Weekly'
                                                    ? 'week(s)'
                                                    : formData.recurrenceType === 'Monthly'
                                                    ? 'month(s)'
                                                    : formData.recurrenceType === 'Daily'
                                                    ? 'day(s)'
                                                    : 'cycle(s)'}
                                            </span>
                                        </div>
                                        <FieldHint>Defines how often the task repeats.</FieldHint>
                                    </FieldLabel>
                                    {formData.recurrenceType === 'Weekly' ? (
                                        <FieldLabel label="Recurrence Days of Week">
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {WEEKDAYS.map((day) => (
                                                    <label
                                                        key={day}
                                                        className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            value={day}
                                                            checked={Array.isArray(formData.recurrenceDaysOfWeek) && formData.recurrenceDaysOfWeek.includes(day)}
                                                            onChange={handleRecurrenceDaysChange}
                                                            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                                        />
                                                        {day}
                                                    </label>
                                                ))}
                                            </div>
                                            <FieldHint>Select one or more days for the weekly schedule.</FieldHint>
                                        </FieldLabel>
                                    ) : null}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <FieldLabel label="Recurrence Start" required>
                                            <input
                                                type="datetime-local"
                                                name="recurrenceStartDate"
                                                value={formData.recurrenceStartDate || ''}
                                                onChange={onChange}
                                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                                required
                                            />
                                        </FieldLabel>
                                        <FieldLabel label="Recurrence Ends">
                                            <input
                                                type="datetime-local"
                                                name="recurrenceEndDate"
                                                value={formData.recurrenceEndDate || ''}
                                                onChange={onChange}
                                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none"
                                            />
                                            <FieldHint>Leave empty for an open-ended series.</FieldHint>
                                        </FieldLabel>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </section>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-full border cursor-pointer border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        {onSaveAndNew ? (
                            <button
                                type="button"
                                onClick={onSaveAndNew}
                                disabled={isSubmitting}
                                className="rounded-full border cursor-pointer border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting ? 'Saving...' : 'Save & New'}
                            </button>
                        ) : null}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-gray-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </form>
            </ModalFrame>
        </div>
    );
};

export default NewTaskModal;