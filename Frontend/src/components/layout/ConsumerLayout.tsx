import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ConsumerLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { label: 'Shop', to: '/shop', icon: Leaf },
        { label: 'My Orders', to: '/consumer/orders', icon: Package },
    ];

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/shop" className="flex items-center gap-2">
                            <Leaf className="text-green-600" size={24} />
                            <h1 className="text-xl font-bold text-gray-800">
                                Farm<span className="text-amber-500">Direct</span>
                            </h1>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(link.to)
                                            ? 'bg-green-50 text-green-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-green-700'
                                        }
                  `}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right: Cart + User */}
                        <div className="flex items-center gap-3">
                            <Link
                                to="/cart"
                                className="relative p-2 text-gray-600 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                            >
                                <ShoppingCart size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User avatar / logout */}
                            <div className="hidden md:flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                                </div>
                                <span className="text-sm text-gray-700 font-medium max-w-[100px] truncate">
                                    {user?.name?.split(' ')[0] || 'User'}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden text-gray-500 hover:text-gray-700 p-1"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive(link.to)
                                                ? 'bg-green-50 text-green-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        <Icon size={18} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg w-full text-sm font-medium"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Page Content */}
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default ConsumerLayout;
