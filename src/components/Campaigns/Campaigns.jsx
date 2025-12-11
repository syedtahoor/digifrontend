import React, { useState } from 'react';
import { Mail, Search, Share2, TrendingUp, BarChart3, Users, Clock, CheckCircle2 } from 'lucide-react';

export default function CampaignSelector() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const campaigns = [
    {
      id: 'google-ads',
      title: 'Google Ads Campaign',
      description: 'Create and manage search, display, and shopping campaigns',
      icon: Search,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-50',
      borderColor: 'border-blue-200',
      stats: { active: 12, pending: 3, budget: '$2,450' }
    },
    {
      id: 'meta-ads',
      title: 'Meta Ads Campaign',
      description: 'Launch Facebook and Instagram advertising campaigns',
      icon: Share2,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-50',
      borderColor: 'border-indigo-200',
      stats: { active: 8, pending: 2, budget: '$1,890' }
    },
    {
      id: 'email',
      title: 'Email Campaign',
      description: 'Design and send targeted email marketing campaigns',
      icon: Mail,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-50',
      borderColor: 'border-green-200',
      stats: { active: 15, pending: 5, budget: '$890' }
    },
    {
      id: 'linkedin',
      title: 'LinkedIn Ads',
      description: 'B2B advertising and lead generation campaigns',
      icon: Users,
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-50',
      borderColor: 'border-cyan-200',
      stats: { active: 6, pending: 1, budget: '$3,200' }
    }
  ];

  const recentActivity = [
    { campaign: 'Summer Sale Email', status: 'Sent', time: '2 hours ago' },
    { campaign: 'Google Search - Shoes', status: 'Active', time: '5 hours ago' },
    { campaign: 'Meta Brand Awareness', status: 'Reviewing', time: '1 day ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Campaign Manager</h1>
          <p className="text-gray-600">Select a campaign type to get started</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
                <p className="text-2xl font-semibold text-gray-900">41</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">11</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                <p className="text-2xl font-semibold text-gray-900">$8.4K</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">3.8%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {campaigns.map((campaign) => {
            const Icon = campaign.icon;
            return (
              <button
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign.id)}
                className={`bg-white rounded-lg border-2 ${
                  selectedCampaign === campaign.id ? campaign.borderColor : 'border-gray-200'
                } p-6 text-left transition-all duration-200 ${campaign.hoverColor} hover:border-gray-300 hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${campaign.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {campaign.stats.active} Active
                    </span>
                    {campaign.stats.pending > 0 && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        {campaign.stats.pending} Pending
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Monthly Budget</span>
                  <span className="text-sm font-semibold text-gray-900">{campaign.stats.budget}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.campaign}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'Active' ? 'bg-green-100 text-green-700' :
                  activity.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Create Campaign CTA */}
        {selectedCampaign && (
          <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 hover:bg-blue-700 transition-colors cursor-pointer">
            <span className="font-medium">Create {campaigns.find(c => c.id === selectedCampaign)?.title}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}