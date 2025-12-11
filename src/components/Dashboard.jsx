import React, { useState } from 'react';
import { Users, MessageSquare, Calendar, FileText, BarChart3, Zap, Mail, TrendingUp, CheckCircle, AlertTriangle, DollarSign, Clock, Eye, ArrowUpRight, ArrowDownRight, LineChart, FolderOpen, Target, Briefcase } from 'lucide-react';

const Dashboard = ({ userRole = 'User', activeSection = 'dashboard' }) => {
    const getSectionContent = () => {
        switch (activeSection) {
            case 'clients':
                return <ClientsSection />;
            case 'campaigns':
                return <CampaignsSection />;
            case 'leads':
                return <LeadsSection />;
            case 'analytics':
                return <AnalyticsSection />;
            case 'content':
                return <ContentSection />;
            case 'team':
                return <TeamSection />;
            case 'invoicing':
                return <InvoicingSection />;
            case 'reports':
                return <ReportsSection />;
            default:
                return <DashboardContent userRole={userRole} />;
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-full mx-auto">
                {getSectionContent()}
            </div>
        </div>
    );
};

const DashboardContent = ({ userRole }) => {
    const [activeTab, setActiveTab] = useState('7D');

    const agencyStats = [
        { title: 'Active Clients', value: '24', change: '+3 this month', trend: 'up', icon: 'Users', detail: '18 Active Projects' },
        { title: 'Active Campaigns', value: '42', change: '+8 campaigns', trend: 'up', icon: 'Target', detail: '28 Running' },
        { title: 'Total Revenue', value: '$48,500', change: '+18%', trend: 'up', icon: 'DollarSign', detail: 'This month' },
        { title: 'Pending Tasks', value: '67', change: '12 overdue', trend: 'down', icon: 'AlertTriangle', detail: 'Need attention' },
        { title: 'Leads Generated', value: '156', change: '+22% this week', trend: 'up', icon: 'TrendingUp', detail: '89 Qualified' },
        { title: 'Email Campaigns', value: '18', change: 'This month', trend: 'neutral', icon: 'Mail', detail: 'Open rate 34%' },
        { title: 'Content Calendar', value: '89', change: 'Posts scheduled', trend: 'up', icon: 'Calendar', detail: '45 pending review' },
        { title: 'Client Satisfaction', value: '4.8/5', change: '+0.2 this month', trend: 'up', icon: 'CheckCircle', detail: 'From 22 reviews' },
    ];

    const iconMap = {
        Users, Target, DollarSign, AlertTriangle, TrendingUp, Mail, Calendar, CheckCircle, Zap, Clock, LineChart, FolderOpen, Briefcase,
    };

    const getIcon = (iconName) => iconMap[iconName] || Users;

    const recentClients = [
        { name: 'Fashion Hub Store', project: 'Social Media Marketing', status: 'Active', revenue: '$3,500/mo', startDate: '2 weeks ago' },
        { name: 'Tech Startup Inc', project: 'SEO & Content Strategy', status: 'Active', revenue: '$4,200/mo', startDate: '1 month ago' },
        { name: 'E-commerce Pro', project: 'PPC Campaign Management', status: 'Onboarding', revenue: '$2,800/mo', startDate: 'Today' },
        { name: 'Beauty Brands Co', project: 'Email Marketing Automation', status: 'Active', revenue: '$1,900/mo', startDate: '3 weeks ago' },
    ];

    const upcomingTasks = [
        { task: 'Client Strategy Call - Tech Startup', dueDate: 'Tomorrow 10 AM', priority: 'High', assignee: 'Sarah' },
        { task: 'SEO Audit Report - Fashion Hub', dueDate: 'In 2 days', priority: 'Medium', assignee: 'John' },
        { task: 'Content Calendar Review - Beauty Brands', dueDate: 'In 3 days', priority: 'Medium', assignee: 'Emma' },
        { task: 'PPC Campaign Setup - E-commerce Pro', dueDate: 'Tomorrow 2 PM', priority: 'High', assignee: 'Mike' },
    ];

    const campaignPerformance = [
        { name: 'Social Media - Q4', clients: 8, budget: '$12,500', impressions: '245K', ctr: '3.2%', roi: '420%' },
        { name: 'Email Nurture - Active', clients: 12, budget: '$4,200', impressions: '89K', ctr: '5.1%', roi: '580%' },
        { name: 'SEO Strategy - Long Term', clients: 5, budget: '$8,900', impressions: '156K', ctr: '2.8%', roi: '340%' },
        { name: 'PPC Ads - Seasonal', clients: 6, budget: '$15,600', impressions: '520K', ctr: '4.5%', roi: '510%' },
    ];

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-6">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight font-serif">
                    Agency Dashboard
                </h1>
                <p className="text-gray-500 mt-2">Manage clients, campaigns, and grow your digital marketing business</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {agencyStats.map((stat, index) => {
                    const IconComponent = getIcon(stat.icon);
                    const bgColor = stat.trend === 'up' ? 'bg-emerald-50' :
                                   stat.trend === 'down' ? 'bg-red-50' :
                                   'bg-gray-50';
                    const textColor = stat.trend === 'up' ? 'text-emerald-600' :
                                     stat.trend === 'down' ? 'text-red-600' :
                                     'text-gray-600';
                    
                    return (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200 group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                {stat.trend !== 'neutral' && (
                                    <div className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg ${bgColor} ${textColor}`}>
                                        {stat.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                        {stat.change}
                                    </div>
                                )}
                            </div>

                            <h3 className="text-sm font-medium text-gray-600 mb-3">{stat.title}</h3>
                            <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                            <p className="text-sm text-gray-500 font-medium">{stat.detail}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
                            <p className="text-sm text-gray-500 mt-1">Track agency revenue over time</p>
                        </div>
                        <div className="flex gap-2">
                            {['7D', '30D', '90D'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setActiveTab(period)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === period
                                        ? 'bg-black text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-72 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <LineChart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Revenue chart will appear here</p>
                        </div>
                    </div>
                </div>

                {/* Client Summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Client Overview</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Active Clients</p>
                                <p className="text-xs text-gray-500 mt-1">24 total</p>
                                <p className="text-xs text-gray-400 mt-2">18 in projects</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Campaigns Running</p>
                                <p className="text-xs text-gray-500 mt-1">42 campaigns</p>
                                <p className="text-xs text-gray-400 mt-2">28 active now</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Avg Client ROI</p>
                                <p className="text-xs text-gray-500 mt-1">475% this month</p>
                                <p className="text-xs text-gray-400 mt-2">+12% improvement</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Clients */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-8">Recent Clients & Projects</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-300">
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Client Name</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Project</th>
                                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Revenue</th>
                                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Started</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentClients.map((client, idx) => (
                                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                                <Users className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold text-gray-900">{client.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-gray-700 text-sm">{client.project}</td>
                                    <td className="py-5 px-6 text-center">
                                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 text-center font-semibold text-gray-900">{client.revenue}</td>
                                    <td className="py-5 px-6 text-center text-gray-700 text-sm">{client.startDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Campaign Performance */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-8">Campaign Performance</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-300">
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Campaign Name</th>
                                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Clients</th>
                                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Budget</th>
                                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Impressions</th>
                                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">CTR</th>
                                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">ROI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaignPerformance.map((campaign, idx) => (
                                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                                <Target className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold text-gray-900">{campaign.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-center font-semibold text-gray-900">{campaign.clients}</td>
                                    <td className="py-5 px-6 text-center font-semibold text-gray-900">{campaign.budget}</td>
                                    <td className="py-5 px-6 text-center text-gray-700">{campaign.impressions}</td>
                                    <td className="py-5 px-6 text-center">
                                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                            {campaign.ctr}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                        <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                            {campaign.roi}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-8">Upcoming Tasks</h2>
                <div className="space-y-4">
                    {upcomingTasks.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{item.task}</p>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    {item.dueDate}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {item.priority}
                                </span>
                                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">{item.assignee}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ClientsSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Client Management</h2>
        <p className="text-gray-600 mt-3">Manage all your clients, projects, and communications</p>
    </div>
);

const CampaignsSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Campaign Management</h2>
        <p className="text-gray-600 mt-3">Create and manage all your marketing campaigns</p>
    </div>
);

const LeadsSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Lead Management</h2>
        <p className="text-gray-600 mt-3">Track and nurture your leads automatically</p>
    </div>
);

const AnalyticsSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h2>
        <p className="text-gray-600 mt-3">Detailed analytics from all your campaigns</p>
    </div>
);

const ContentSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Content Management</h2>
        <p className="text-gray-600 mt-3">Plan, create, and schedule content</p>
    </div>
);

const TeamSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Team Management</h2>
        <p className="text-gray-600 mt-3">Manage team members and their roles</p>
    </div>
);

const InvoicingSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Invoicing & Billing</h2>
        <p className="text-gray-600 mt-3">Manage invoices and client billing</p>
    </div>
);

const ReportsSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Reports</h2>
        <p className="text-gray-600 mt-3">Generate comprehensive reports for clients</p>
    </div>
);

export default Dashboard;