'use client';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Tenant, Property } from '@/types';
import { Users, Plus, Edit2, Trash2, Phone, Mail, Calendar, Building2, X, UserCheck, UserX, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

export default function TenantsPage() {
    const { user } = useAuth();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        property_id: '',
        monthly_rent: '',
        lease_start_date: '',
        is_active: true,
    });

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Load properties
            const { data: propertiesData } = await supabase
                .from('properties')
                .select('*')
                .eq('user_id', user.id)
                .order('name');

            setProperties(propertiesData || []);

            // Load tenants with property info
            const { data: tenantsData, error } = await supabase
                .from('tenants')
                .select(`
          *,
          property:properties(*)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTenants(tenantsData || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            if (editingTenant) {
                // Update existing tenant
                const { error } = await supabase
                    .from('tenants')
                    .update({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        email: formData.email || null,
                        property_id: formData.property_id,
                        monthly_rent: parseFloat(formData.monthly_rent),
                        lease_start_date: formData.lease_start_date,
                        is_active: formData.is_active,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingTenant.id)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                // Create new tenant
                const { error } = await supabase
                    .from('tenants')
                    .insert({
                        user_id: user.id,
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        email: formData.email || null,
                        property_id: formData.property_id,
                        monthly_rent: parseFloat(formData.monthly_rent),
                        lease_start_date: formData.lease_start_date,
                        is_active: formData.is_active,
                    });

                if (error) throw error;
            }

            setShowModal(false);
            setEditingTenant(null);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error saving tenant:', error);
            alert('Error saving tenant. Please try again.');
        }
    };

    const handleEdit = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setFormData({
            first_name: tenant.first_name,
            last_name: tenant.last_name,
            phone: tenant.phone,
            email: tenant.email || '',
            property_id: tenant.property_id,
            monthly_rent: tenant.monthly_rent.toString(),
            lease_start_date: tenant.lease_start_date,
            is_active: tenant.is_active,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tenant? This will also delete all associated rent payments.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('tenants')
                .delete()
                .eq('id', id)
                .eq('user_id', user!.id);

            if (error) throw error;
            loadData();
        } catch (error) {
            console.error('Error deleting tenant:', error);
            alert('Error deleting tenant. Please try again.');
        }
    };

    const toggleActiveStatus = async (tenant: Tenant) => {
        try {
            const { error } = await supabase
                .from('tenants')
                .update({
                    is_active: !tenant.is_active,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', tenant.id)
                .eq('user_id', user!.id);

            if (error) throw error;
            loadData();
        } catch (error) {
            console.error('Error updating tenant status:', error);
            alert('Error updating tenant status. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            property_id: '',
            monthly_rent: '',
            lease_start_date: '',
            is_active: true,
        });
    };

    const openAddModal = () => {
        setEditingTenant(null);
        resetForm();
        setShowModal(true);
    };

    if (loading) {
        return (
            <ProtectedLayout>
                <div className="space-y-4">
                    <div className="skeleton h-12 w-full"></div>
                    <div className="skeleton h-32 w-full"></div>
                </div>
            </ProtectedLayout>
        );
    }

    return (
        <ProtectedLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Tenants</h1>
                        <p className="text-slate-600 mt-1">
                            {tenants.filter(t => t.is_active).length} active tenants
                        </p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary flex items-center space-x-2">
                        <Plus className="w-5 h-5" />
                        <span>Add Tenant</span>
                    </button>
                </div>

                {/* Check if properties exist */}
                {properties.length === 0 ? (
                    <div className="card text-center py-12">
                        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No properties found</h3>
                        <p className="text-slate-600 mb-6">You need to add properties before adding tenants</p>
                        <a href="/properties" className="btn btn-primary inline-flex items-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span>Add Property</span>
                        </a>
                    </div>
                ) : tenants.length === 0 ? (
                    <div className="card text-center py-12">
                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No tenants yet</h3>
                        <p className="text-slate-600 mb-6">Add your first tenant to get started</p>
                        <button onClick={openAddModal} className="btn btn-primary inline-flex items-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span>Add Tenant</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tenants.map((tenant) => (
                            <div key={tenant.id} className={`card hover:shadow-lg transition-shadow ${!tenant.is_active ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className={`w-12 h-12 ${tenant.is_active ? 'bg-purple-100' : 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
                                                <Users className={`w-6 h-6 ${tenant.is_active ? 'text-purple-600' : 'text-slate-400'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                        {tenant.first_name} {tenant.last_name}
                                                    </h3>
                                                    {tenant.is_active ? (
                                                        <span className="badge badge-success">Active</span>
                                                    ) : (
                                                        <span className="badge bg-slate-100 text-slate-600">Inactive</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-sm text-slate-600 mt-1">
                                                    <Building2 className="w-4 h-4 mr-1" />
                                                    {tenant.property?.name || 'Unknown Property'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-slate-600">
                                                <Phone className="w-4 h-4 mr-2" />
                                                {tenant.phone}
                                            </div>
                                            {tenant.email && (
                                                <div className="flex items-center text-sm text-slate-600">
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    {tenant.email}
                                                </div>
                                            )}
                                            <div className="flex items-center text-sm text-slate-600">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Lease started: {format(new Date(tenant.lease_start_date), 'MMM dd, yyyy')}
                                            </div>
                                            <div className="flex items-center p-3 bg-slate-50 rounded-lg mt-2">
                                                <IndianRupee className="w-5 h-5 text-slate-600 mr-1" />
                                                <span className="text-lg font-bold text-slate-900">
                                                    {tenant.monthly_rent.toLocaleString('en-IN')}
                                                </span>
                                                <span className="text-sm text-slate-600 ml-2">/month</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 ml-4">
                                        <button
                                            onClick={() => toggleActiveStatus(tenant)}
                                            className={`p-2 rounded-lg transition-colors ${tenant.is_active
                                                    ? 'hover:bg-warning-50 text-warning-600'
                                                    : 'hover:bg-success-50 text-success-600'
                                                }`}
                                            title={tenant.is_active ? 'Mark as inactive' : 'Mark as active'}
                                        >
                                            {tenant.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(tenant)}
                                            className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tenant.id)}
                                            className="p-2 hover:bg-danger-50 text-danger-600 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingTenant ? 'Edit Tenant' : 'Add Tenant'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="label">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        placeholder="e.g., John"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        placeholder="e.g., Doe"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label">Property</label>
                                    <select
                                        required
                                        className="input"
                                        value={formData.property_id}
                                        onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                                    >
                                        <option value="">Select a property</option>
                                        {properties.map((property) => (
                                            <option key={property.id} value={property.id}>
                                                {property.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="input"
                                        placeholder="e.g., +91 9876543210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label">Email (Optional)</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="e.g., john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label">Monthly Rent (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="input"
                                        placeholder="e.g., 15000"
                                        value={formData.monthly_rent}
                                        onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label">Lease Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input"
                                        value={formData.lease_start_date}
                                        onChange={(e) => setFormData({ ...formData, lease_start_date: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        className="w-5 h-5 text-primary-600 rounded"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
                                        Active tenant (generates monthly rent payments)
                                    </label>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary flex-1">
                                        {editingTenant ? 'Update' : 'Add'} Tenant
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    );
}
