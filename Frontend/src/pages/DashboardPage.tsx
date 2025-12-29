import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Menu, 
  X, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';

const DashboardPage = ({ userType }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle Sidebar for Mobile
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-primary-bg font-sans">
      
      {/* 1. SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-center border-b border-gray-100">
            <h1 className="text-2xl font-bold text-primary-dark tracking-tight">
              Farm<span className="text-secondary">Direct</span>
            </h1>
          </div>

          {/* Navigation Links */}
         <nav className="flex-1 px-4 py-6 space-y-2">
      
      {/* SHARED LINKS (Everyone sees these) */}
      <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />

      {/* FARMER SPECIFIC LINKS */}
      {userType === 'Farmer' && (
        <>
          <NavItem icon={<Package size={20} />} label="My Crops" />
          <NavItem icon={<DollarSign size={20} />} label="My Sales" />
        </>
      )}

      {/* ADMIN SPECIFIC LINKS */}
      {userType === 'Admin' && (
        <>
          <NavItem icon={<Users size={20} />} label="Manage Users" />
          <NavItem icon={<TrendingUp size={20} />} label="Platform Stats" />
        </>
      )}

    </nav>

          {/* User Profile (Bottom) */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main">John Doe</p>
                <p className="text-xs text-text-muted">Farmer Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <button onClick={toggleSidebar} className="md:hidden text-gray-500">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <h2 className="text-xl font-semibold text-primary-dark">Dashboard Overview</h2>
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
            + Add Product
          </button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Revenue" 
              value="$12,450" 
              icon={<DollarSign className="text-primary" />} 
              trend="+12%" 
            />
            <StatCard 
              title="Active Orders" 
              value="24" 
              icon={<ShoppingCart className="text-secondary" />} 
              trend="+4 New" 
            />
            <StatCard 
              title="Total Products" 
              value="156" 
              icon={<Package className="text-blue-500" />} 
              trend="In Stock" 
            />
          </div>

          {/* Recent Orders Table Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-text-muted text-sm">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-4 font-medium text-primary">#ORD-001</td>
                    <td className="py-4">Sarah Smith</td>
                    <td className="py-4">$45.00</td>
                    <td className="py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Completed</span></td>
                  </tr>
                  <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-4 font-medium text-primary">#ORD-002</td>
                    <td className="py-4">Mike Jones</td>
                    <td className="py-4">$120.50</td>
                    <td className="py-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
    
  );
};

// --- Helper Components (Keep file clean) ---

const NavItem = ({ icon, label, active = false }) => (
  <a href="#" className={`
    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
    ${active 
      ? 'bg-primary-light/20 text-primary-dark font-medium' 
      : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}
  `}>
    {icon}
    <span>{label}</span>
  </a>
);

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-text-muted mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
        <TrendingUp size={12} /> {trend}
      </p>
    </div>
    <div className="p-3 bg-gray-50 rounded-full">
      {icon}
    </div>
  </div>
);

export default DashboardPage;