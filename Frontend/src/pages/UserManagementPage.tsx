import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Users, UserCheck, Sprout, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { getAllUsers } from '../services/userService';
import type { UserResponse } from '../models/apiTypes';
import Pagination from '../components/common/Pagination';

type RoleFilter = 'All' | 'Farmer' | 'Consumer' | 'Admin';

const tabs: { label: string; value: RoleFilter; icon: React.ReactNode; color: string }[] = [
    { label: 'All Users', value: 'All', icon: <Users size={16} />, color: 'green' },
    { label: 'Farmers', value: 'Farmer', icon: <Sprout size={16} />, color: 'blue' },
    { label: 'Consumers', value: 'Consumer', icon: <UserCheck size={16} />, color: 'purple' },
    { label: 'Admins', value: 'Admin', icon: <ShieldCheck size={16} />, color: 'amber' },
];

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<RoleFilter>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        let result = users;
        if (activeTab !== 'All') {
            result = result.filter((u) => u.role === activeTab);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (u) =>
                    u.fullName.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    u.phoneNumber?.toLowerCase().includes(q) ||
                    u.role.toLowerCase().includes(q)
            );
        }
        return result;
    }, [users, activeTab, searchQuery]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    // Pagination logic
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const roleCounts = useMemo(() => {
        return {
            All: users.length,
            Farmer: users.filter((u) => u.role === 'Farmer').length,
            Consumer: users.filter((u) => u.role === 'Consumer').length,
            Admin: users.filter((u) => u.role === 'Admin').length,
        };
    }, [users]);

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'Farmer':
                return 'bg-blue-100 text-blue-700';
            case 'Consumer':
                return 'bg-purple-100 text-purple-700';
            case 'Admin':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-green-600" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <p className="text-red-600 mb-2">{error}</p>
                <button onClick={loadUsers} className="text-red-700 hover:underline text-sm font-medium">
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <p className="text-sm text-gray-500 mt-1">{users.length} registered users</p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                </div>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.value
                                ? 'bg-green-600 text-white shadow-md shadow-green-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700'
                            }
            `}
                    >
                        {tab.icon}
                        {tab.label}
                        <span
                            className={`
              ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold
              ${activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
            `}
                        >
                            {roleCounts[tab.value]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="mx-auto text-gray-300 mb-4" size={64} />
                        <h3 className="text-xl font-semibold text-gray-600 mb-1">No users found</h3>
                        <p className="text-gray-400 text-sm">
                            {searchQuery ? 'Try a different search term' : `No ${activeTab !== 'All' ? activeTab.toLowerCase() + 's' : 'users'} registered yet`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedUsers.map((u) => (
                                    <tr key={u.userId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${u.role === 'Farmer'
                                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                            : u.role === 'Admin'
                                                                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                                                                : 'bg-gradient-to-br from-purple-500 to-violet-600'
                                                        }`}
                                                >
                                                    {u.fullName?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{u.fullName}</p>
                                                    <p className="text-xs text-gray-400">ID: #{u.userId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700 flex items-center gap-1.5">
                                                    <Mail size={13} className="text-gray-400" />
                                                    {u.email}
                                                </p>
                                                {u.phoneNumber && (
                                                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                        <Phone size={13} className="text-gray-400" />
                                                        {u.phoneNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                                <Calendar size={13} className="text-gray-400" />
                                                {u.createdAt
                                                    ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })
                                                    : 'N/A'}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            totalItems={totalItems}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagementPage;
