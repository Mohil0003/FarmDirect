import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, FolderTree, X, Save } from 'lucide-react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import Pagination from '../components/common/Pagination';
import type { CategoryResponse, CategoryCreateDto } from '../models/apiTypes';

const CategoryManagementPage = () => {


    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
    const [formData, setFormData] = useState<CategoryCreateDto>({ categoryName: '', description: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const data = await getAllCategories();
            setCategories(data);
        } catch (err: any) {
            showErrorToast(err.message || 'Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({ categoryName: '', description: '' });
        setShowModal(true);
    };

    const openEditModal = (category: CategoryResponse) => {
        setEditingCategory(category);
        setFormData({ categoryName: category.categoryName, description: category.description || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.categoryName.trim()) return;

        try {
            setIsSaving(true);
            if (editingCategory) {
                await updateCategory(editingCategory.categoryId, formData);
                showSuccessToast('Category updated successfully');
            } else {
                await createCategory(formData);
                showSuccessToast('Category created successfully');
            }
            setShowModal(false);
            await loadCategories();
        } catch (err: any) {
            showErrorToast(err.message || 'Failed to save category');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete category "${name}"? Products in this category may be affected.`)) return;
        try {
            await deleteCategory(id);
            showSuccessToast(`Category "${name}" deleted`);
            await loadCategories();
        } catch (err: any) {
            showErrorToast(err.message || 'Failed to delete category');
        }
    };

    // Pagination logic
    const totalItems = categories.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCategories = categories.slice(startIndex, startIndex + itemsPerPage);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={48} />
            </div>
        );
    }

    return (
        <div className="py-2">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <FolderTree className="text-green-600" size={32} />
                                Category Management
                            </h1>
                            <p className="text-gray-500 mt-1">{categories.length} categories total</p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md"
                    >
                        <Plus size={20} />
                        Add Category
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {categories.length === 0 ? (
                        <div className="text-center py-16">
                            <FolderTree className="mx-auto text-gray-300 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No categories yet</h3>
                            <p className="text-gray-400 mb-6">Create your first product category to get started</p>
                            <button onClick={openAddModal} className="px-5 py-2. bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
                                Add Category
                            </button>
                        </div>
                    ) : (
                        <>
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedCategories.map((cat) => (
                                    <tr key={cat.categoryId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{cat.categoryId}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-800">{cat.categoryName}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                                            {cat.description || <span className="text-gray-400 italic">No description</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(cat)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.categoryId, cat.categoryName)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
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
                        </>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                                    <input
                                        type="text"
                                        value={formData.categoryName}
                                        onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        placeholder="e.g. Fruits, Vegetables..."
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        rows={3}
                                        placeholder="Optional description..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        {editingCategory ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryManagementPage;
