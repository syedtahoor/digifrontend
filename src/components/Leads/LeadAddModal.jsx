import React, { useState } from 'react';
import { X, User, Mail, Phone, Briefcase, Building2, TrendingUp, Star, FileText, Zap } from 'lucide-react';
import axiosMethods from '../../../axiosConfig';

export default function LeadFormModal({ isOpen, onClose, onSuccess, fetchInitialLeads }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    company: '',
    industry: '',
    interest: '',
    source: 'website',
    status: 'new',
    lead_priority: 'medium',
    response_score: '',
    notes: '',
    expected_deal_value: '',
    expected_closing_date: '',
    account_number: '',       // ADD THIS
    account_currency: '',     // ADD THIS
    account_method: '',       // ADD THIS
    account_name: '',         // ADD THIS
    bank_name: '',           // ADD THIS
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!formData.name || !formData.email) {
      setError('Name and Email are required');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosMethods.post('/leads', formData);

      if (response.success) {
        // Form reset
        setFormData({
          name: '',
          email: '',
          phone: '',
          title: '',
          company: '',
          industry: '',
          source: 'website',
          status: 'new',
          lead_priority: 'medium',
          interest: '',
          response_score: '',
          notes: '',
          expected_deal_value: '',
          expected_closing_date: '',
          account_number: '',       // ADD THIS
          account_currency: '',     // ADD THIS
          account_method: '',       // ADD THIS
          account_name: '',         // ADD THIS
          bank_name: '',           // ADD THIS
        });

        // Parent ko notify karo
        onSuccess(response.data);
        fetchInitialLeads();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding lead');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 shadow-xl bg-opacity-50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm border border-gray-300 shadow-2xl max-w-5xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Lead</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new lead</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 bg-gray-100 p-1 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                Lead Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Marketing Manager"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information Section */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Acme Inc."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="Technology"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Details Section */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                Lead Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-4 cursor-pointer py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all text-gray-700"
                  >
                    <option value="website">Website</option>
                    <option value="ad campaign">Ad Campaign</option>
                    <option value="forms">Forms</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 cursor-pointer border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all text-gray-700"
                  >
                    <option value="new">New - Not Contacted</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified - Client Agree</option>
                    <option value="converted">Converted - Deal Closed</option>
                    <option value="proposalsent">Proposal Sent to Client</option>
                    <option value="disqualified">Disqualified - Not Converted</option>
                  </select>
                </div>
              </div>
            </div>

            {/* // Step 3: Add Input Field (after industry field, before Lead Details Section) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lead Interest</label>
              <div className="relative">
                <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  placeholder="e.g., Software Solutions, Consulting"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Priority & Score Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  name="lead_priority"
                  value={formData.lead_priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border cursor-pointer border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all text-gray-700"
                >
                  <option value="low">🔴 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟢 High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Score</label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    name="response_score"
                    value={formData.response_score}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="0-100"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Deal Value & Closing Date Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Deal Value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    name="expected_deal_value"
                    value={formData.expected_deal_value}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Closing Date</label>
                <input
                  type="date"
                  name="expected_closing_date"
                  value={formData.expected_closing_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all text-gray-700"
                />
              </div>
            </div>

            {/* Account Information Section */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                Account Details (optional for now)
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Currency</label>
                  <select
                    name="account_currency"
                    value={formData.account_currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border cursor-pointer border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all text-gray-700"
                  >
                    <option value="">Select Currency</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="PKR">PKR - Pakistani Rupee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    name="account_method"
                    value={formData.account_method}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border cursor-pointer border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all text-gray-700"
                  >
                    <option value="">Select Method</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                  <input
                    type="text"
                    name="account_name"
                    value={formData.account_name}
                    onChange={handleChange}
                    placeholder="Account holder name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Conditional Bank Name Field */}
              {formData.account_method === 'bank' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                  />
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes or comments about the lead..."
                  rows="7"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:gray-700 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-3 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r cursor-pointer from-black to-gray-900 hover:from-black hover:to-black disabled:from-gray-400 disabled:to-gray-500 text-white py-3.5 px-6 rounded-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? 'Adding...' : 'Add Lead'}
          </button>
        </div>

      </div>
    </div>
  );
}