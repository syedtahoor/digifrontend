import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function CreateCallLog({
    leadData,
    formData,
    onChange,
    onCancel,
    onSubmit,
    isSubmitting = false,
    variant = 'card',
}) {
    const leadName = leadData?.name || '';
    const relatedTo = leadData?.company || leadName || 'Lead';
    const isPanel = variant === 'panel';

    const containerClasses = isPanel
        ? 'flex flex-col'
        : 'overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm';
    const headerClasses = isPanel
        ? 'flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-3 py-5'
        : 'flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-3 py-4';
    const formClasses = isPanel ? 'space-y-6 px-3 py-6' : 'space-y-6 px-4 py-6';

    return (
        <div className={containerClasses}>
            <div className={headerClasses}>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex h-10 cursor-pointer w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-base font-bold text-gray-900">Log a Call</h2>
                    <p className="text-xs text-gray-500">
                        Capture call details for {leadName || 'this lead'}.
                    </p>
                </div>
            </div>
            <form onSubmit={onSubmit} className={formClasses}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                        Subject
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={onChange}
                            className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 "
                            placeholder="e.g., Discovery Call"
                            required
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                        Call Type
                        <select
                            name="callType"
                            value={formData.callType}
                            onChange={onChange}
                            className="rounded border cursor-pointer border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-black "
                        >
                            <option value="Outbound">Outbound</option>
                            <option value="Inbound">Inbound</option>
                            <option value="Missed">Missed</option>
                        </select>
                    </label>
                </div>
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Related To
                    <input
                        type="text"
                        value={relatedTo}
                        readOnly
                        className="rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-normal text-gray-600"
                    />
                </label>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                        Call Duration (minutes)
                        <input
                            type="number"
                            name="callDuration"
                            min="0"
                            value={formData.callDuration}
                            onChange={onChange}
                            className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 "
                            placeholder="e.g., 15"
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                        Call Date and Time
                        <input
                            type="datetime-local"
                            name="callDateTime"
                            value={formData.callDateTime}
                            onChange={onChange}
                            className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 "
                            required
                        />
                    </label>
                </div>
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Comments
                    <textarea
                        name="comments"
                        value={formData.comments}
                        onChange={onChange}
                        className="min-h-[120px] rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 "
                        placeholder="Summarize the conversation and next steps..."
                    />
                </label>
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                        <input
                            type="checkbox"
                            name="followUpTask"
                            checked={formData.followUpTask}
                            onChange={onChange}
                            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        Create follow-up task
                    </label>
                    {formData.followUpTask && (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                Due Date
                                <input
                                    type="date"
                                    name="followUpDueDate"
                                    value={formData.followUpDueDate}
                                    onChange={onChange}
                                    className="rounded border cursor-pointer border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 "
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                                Task Notes
                                <input
                                    type="text"
                                    name="followUpNotes"
                                    value={formData.followUpNotes}
                                    onChange={onChange}
                                    className="rounded border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900 focus:border-gray-900 "
                                    placeholder="e.g., Schedule product demo"
                                />
                            </label>
                        </div>
                    )}
                </div>
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
                        className="rounded-full cursor-pointer bg-gray-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? 'Logging...' : 'Log Call'}
                    </button>
                </div>
            </form>
        </div>
    );
}
