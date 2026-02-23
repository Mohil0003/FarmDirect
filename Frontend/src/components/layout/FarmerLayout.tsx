import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    IndianRupee,
    LogOut,
    Menu,
    X,
    Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/farmer' },
    { icon: Package, label: 'My Products', to: '/products' },
    { icon: ShoppingCart, label: 'Orders', to: '/orders' },
    { icon: IndianRupee, label: 'Revenue', to: '/revenue' },
];

const FarmerLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        if (path === '/farmer') return location.pathname === '/farmer';
        return location.pathname.startsWith(path);
    };

    const currentPageLabel = navItems.find((item) => isActive(item.to))?.label || 'Farmer';

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:translate-x-0
                `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                        <Link to="/farmer" className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-primary-dark tracking-tight">
                                Farm<span className="text-secondary">Direct</span>
                            </h1>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.to);
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                                        ${active
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-200'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-green-700'
                                        }
                                    `}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                                {user?.name?.charAt(0)?.toUpperCase() || 'F'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Farmer'}</p>
                                <p className="text-xs text-gray-500">Farmer Account</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="md:hidden text-gray-500 hover:text-gray-700 p-1"
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">{currentPageLabel}</h2>
                        <span className="text-sm text-gray-500 hidden sm:inline">
                            Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}!
                        </span>
                    </div>
                    <Link
                        to="/products/new"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Product</span>
                    </Link>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default FarmerLayout;
