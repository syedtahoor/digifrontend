import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Mail, Bold, Italic, Underline, Link2, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, ChevronDown } from 'lucide-react';

const inputBaseClass =
    'w-full border-0 border-b border-gray-300 px-2 py-2 text-sm text-gray-900 outline-none transition-colors duration-150 focus:border-gray-800 bg-transparent placeholder:text-gray-400';

const labelClass = 'text-xs font-medium text-gray-700 mb-1 block';

function Email({
    isOpen,
    leadName,
    formData,
    validationErrors = {},
    onFieldChange,
    onSubmit,
    onCancel,
    isSubmitting,
    defaultFromLabel,
}) {
    const [activeFormats, setActiveFormats] = useState({});
    const bodyRef = useRef(null);

    useEffect(() => {
        if (isOpen && bodyRef.current && formData.body) {
            bodyRef.current.innerHTML = formData.body;
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (field) => (event) => {
        onFieldChange(field, event.target.value);
    };

    const applyFormat = (command, value = null) => {
        if (bodyRef.current) {
            bodyRef.current.focus();
            document.execCommand(command, false, value);
            updateActiveFormats();
            onFieldChange('body', bodyRef.current.innerHTML);
        }
    };

    const updateActiveFormats = () => {
        try {
            const formats = {
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
            };
            setActiveFormats(formats);
        } catch (e) {
            // Ignore errors
        }
    };

    const insertLink = () => {
        const url = prompt('Enter URL (e.g., https://example.com):');
        if (url) {
            applyFormat('createLink', url);
        }
    };

    const handleBodyInput = (e) => {
        onFieldChange('body', e.currentTarget.innerHTML);
        updateActiveFormats();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.from || !formData.to || !formData.subject) {
            alert('Please fill in all required fields (From, To, Subject)');
            return;
        }

        const bodyContent = bodyRef.current ? bodyRef.current.innerHTML : formData.body;
        if (!bodyContent || bodyContent.trim() === '' || bodyContent === '<br>') {
            alert('Please add email body content');
            return;
        }

        onSubmit();
    };

    const ToolbarButton = ({ icon: Icon, onClick, active, title }) => (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            title={title}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
                active ? 'bg-blue-50 text-gray-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon className="h-4 w-4" />
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm  px-4">
            <div className="relative flex w-full max-w-5xl border border-gray-300 flex-col overflow-hidden bg-white shadow-2xl max-h-[95vh]" style={{ borderRadius: '0.25rem' }}>
                {/* Salesforce-style Header */}
                <div className="flex  items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                New Email
                            </h2>
                            <p className="text-xs text-gray-600">
                                To: {leadName || 'Lead'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full p-1 cursor-pointer text-gray-500 transition-colors bg-gray-100 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-1 min-h-0 flex-col bg-white">
                    <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
                        {/* From Field */}
                        <div className="mb-3">
                            <label className={labelClass}>From *</label>
                            <input
                                type="email"
                                value={formData.from || ''}
                                onChange={handleChange('from')}
                                className={inputBaseClass}
                                placeholder={defaultFromLabel || 'you@company.com'}
                            />
                            {validationErrors.from && (
                                <p className="text-xs text-red-600 mt-1">{validationErrors.from}</p>
                            )}
                        </div>

                        {/* To Field */}
                        <div className="mb-3">
                            <label className={labelClass}>To *</label>
                            <input
                                type="text"
                                value={formData.to || ''}
                                onChange={handleChange('to')}
                                className={inputBaseClass}
                                placeholder="recipient@example.com"
                            />
                            {validationErrors.to && (
                                <p className="text-xs text-red-600 mt-1">{validationErrors.to}</p>
                            )}
                        </div>

                        {/* Cc Field */}
                        {/* <div className="mb-3">
                            <label className={labelClass}>Cc</label>
                            <input
                                type="text"
                                value={formData.cc || ''}
                                onChange={handleChange('cc')}
                                className={inputBaseClass}
                                placeholder="Optional"
                            />
                        </div> */}

                        {/* Bcc Field */}
                        {/* <div className="mb-3">
                            <label className={labelClass}>Bcc</label>
                            <input
                                type="text"
                                value={formData.bcc || ''}
                                onChange={handleChange('bcc')}
                                className={inputBaseClass}
                                placeholder="Optional"
                            />
                        </div> */}

                        {/* Subject Field */}
                        <div className="mb-3">
                            <label className={labelClass}>Subject *</label>
                            <input
                                type="text"
                                value={formData.subject || ''}
                                onChange={handleChange('subject')}
                                className={inputBaseClass}
                                placeholder="Enter subject"
                            />
                            {validationErrors.subject && (
                                <p className="text-xs text-red-600 mt-1">{validationErrors.subject}</p>
                            )}
                        </div>

                        {/* Body Field */}
                        <div className="mb-3">
                            <label className={labelClass}>Body</label>
                            
                            {/* Salesforce-style Toolbar */}
                            <div className="flex items-center gap-0.5 border border-gray-300 bg-gray-50 px-2 py-1 mb-0" style={{ borderBottom: 'none' }}>
                                <select
                                    onChange={(e) => {
                                        applyFormat('fontSize', e.target.value);
                                        e.target.value = '';
                                    }}
                                    className="text-xs border-0 rounded px-1.5 py-1 bg-white cursor-pointer text-gray-700"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Font Size</option>
                                    <option value="1">10pt</option>
                                    <option value="2">12pt</option>
                                    <option value="3">14pt</option>
                                    <option value="4">18pt</option>
                                    <option value="5">24pt</option>
                                </select>
                                
                                <div className="h-5 w-px bg-gray-300 mx-1"></div>
                                
                                <ToolbarButton
                                    icon={Bold}
                                    onClick={() => applyFormat('bold')}
                                    active={activeFormats.bold}
                                    title="Bold"
                                />
                                <ToolbarButton
                                    icon={Italic}
                                    onClick={() => applyFormat('italic')}
                                    active={activeFormats.italic}
                                    title="Italic"
                                />
                                <ToolbarButton
                                    icon={Underline}
                                    onClick={() => applyFormat('underline')}
                                    active={activeFormats.underline}
                                    title="Underline"
                                />
                                
                                <div className="h-5 w-px bg-gray-300 mx-1"></div>
                                
                                <ToolbarButton
                                    icon={AlignLeft}
                                    onClick={() => applyFormat('justifyLeft')}
                                    title="Align Left"
                                />
                                <ToolbarButton
                                    icon={AlignCenter}
                                    onClick={() => applyFormat('justifyCenter')}
                                    title="Center"
                                />
                                <ToolbarButton
                                    icon={AlignRight}
                                    onClick={() => applyFormat('justifyRight')}
                                    title="Align Right"
                                />
                                
                                <div className="h-5 w-px bg-gray-300 mx-1"></div>
                                
                                <ToolbarButton
                                    icon={List}
                                    onClick={() => applyFormat('insertUnorderedList')}
                                    title="Bullet List"
                                />
                                <ToolbarButton
                                    icon={ListOrdered}
                                    onClick={() => applyFormat('insertOrderedList')}
                                    title="Numbered List"
                                />
                                
                                <div className="h-5 w-px bg-gray-300 mx-1"></div>
                                
                                <ToolbarButton
                                    icon={Link2}
                                    onClick={insertLink}
                                    title="Insert Link"
                                />
                                
                                <input
                                    type="color"
                                    onChange={(e) => applyFormat('foreColor', e.target.value)}
                                    className="w-6 h-6 rounded border-0 cursor-pointer ml-1"
                                    title="Text Color"
                                />
                            </div>

                            {/* Editor */}
                            <div
                                ref={bodyRef}
                                contentEditable
                                onInput={handleBodyInput}
                                onMouseUp={updateActiveFormats}
                                onKeyUp={updateActiveFormats}
                                suppressContentEditableWarning
                                className="w-full min-h-[280px] border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors duration-150 focus:border-gray-800 overflow-y-auto bg-white"
                                style={{ maxHeight: '350px' }}
                            />
                            
                            {validationErrors.body && (
                                <p className="text-xs text-red-600 mt-1">{validationErrors.body}</p>
                            )}
                        </div>
                    </div>

                    {/* Salesforce-style Footer */}
                    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="text-xs text-gray-600">
                            Email will be logged to activity timeline
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="rounded border cursor-pointer border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="inline-flex cursor-pointer items-center gap-2 rounded bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Send
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Email;