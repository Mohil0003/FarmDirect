import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  TrendingUp, 
  Search, 
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  // Mock Data for "Pending Farmer Approvals"
  const [farmers, setFarmers] = useState([
    { id: 1, name: 'Ramesh Patel', location: 'Gujarat', status: 'Pending', type: 'Organic' },
    { id: 2, name: 'Suresh Kumar', location: 'Punjab', status: 'Pending', type: 'Dairy' },
    { id: 3, name: 'Green Valley', location: 'Maharashtra', status: 'Active', type: 'Vegetables' },
  ]);

  const handleApprove = (id) => {
    setFarmers(farmers.map(f => f.id === id ? { ...f, status: 'Active' } : f));
  };

  const handleReject = (id) => {
    setFarmers(farmers.map(f => f.id === id ? { ...f, status: 'Rejected' } : f));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-text-main">
      
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-8 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary" size={28} />
          <h1 className="text-xl font-bold text-gray-800">Admin<span className="text-primary">Panel</span></h1>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-gray-500">Super Admin</span>
           <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">A</div>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        
        {/* 1. Platform Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value="1,240" icon={<Users className="text-blue-500" />} change="+12% this week" />
          <StatCard title="Total Revenue" value="₹45.2L" icon={<TrendingUp className="text-green-500" />} change="+5% this month" />
          <StatCard title="Pending Approvals" value="18" icon={<AlertCircle className="text-orange-500" />} change="Requires Action" />
          <StatCard title="Active Products" value="856" icon={<CheckCircle className="text-purple-500" />} change="Live on store" />
        </div>

        {/* 2. Main Content: Farmer Verification Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Table Header */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Farmer Verification Requests</h2>
              <p className="text-sm text-gray-500">Approve or reject new farmer registrations.</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search name..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none w-64"
              />
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Farmer Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Farming Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {farmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{farmer.name}</td>
                    <td className="px-6 py-4 text-gray-600">{farmer.location}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {farmer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={farmer.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {farmer.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(farmer.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleReject(farmer.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Reject">
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-500">
            Showing latest 3 requests
          </div>
        </div>

      </main>
    </div>
  );
};

// --- Helper Components ---

const StatCard = ({ title, value, icon, change }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    </div>
    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
      {change}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: 'bg-orange-100 text-orange-700',
    Active: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export default AdminDashboard;