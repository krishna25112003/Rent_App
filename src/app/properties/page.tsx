'use client';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Property, Tenant, RentPayment } from '@/types';
import { Building2, Plus, Edit2, Trash2, MapPin, X, Home, Store, Users, IndianRupee, Phone, Mail, Calendar, CheckCircle, XCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';

export default function PropertiesPage() {
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [showTenantModal, setShowTenantModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));

    const [propertyForm, setPropertyForm] = useState({
        name: '',
        address: '',
        property_type: 'residential' as 'residential' | 'commercial',
    });

    const [tenantForm, setTenantForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        monthly_rent: '',
        lease_start_date: '',
        is_active: true,
    });

    const [paymentData, setPaymentData] = useState({
        paid_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'upi' as const,
        notes: '',
    });

    useEffect(() => {
        if (user) {
            loadProperties();
        }
    }, [user]);

    useEffect(() => {
        if (selectedProperty) {
            loadPropertyDetails();
        }
    }, [selectedProperty, selectedMonth]);

    const loadProperties = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProperties(data || []);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPropertyDetails = async () => {
        if (!selectedProperty || !user) return;

        try {
            // Load tenants
            const { data: tenantsData, error: tenantsError } = await supabase
                .from('tenants')
                .select('*')
                .eq('property_id', selectedProperty.id)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (tenantsError) throw tenantsError;
            setTenants(tenantsData || []);

            // Load selected month's rent payments
            const monthStr = format(selectedMonth, 'yyyy-MM-01');
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('rent_payments')
                .select(`
          *,
          tenant:tenants(*)
        `)
                .eq('property_id', selectedProperty.id)
                .eq('user_id', user.id)
                .eq('month', monthStr);

            if (paymentsError) throw paymentsError;
            setRentPayments(paymentsData || []);

            // Auto-generate rent for active tenants if it doesn't exist
            const activeTenants = tenantsData?.filter(t => t.is_active) || [];
            const existingPaymentTenantIds = paymentsData?.map(p => p.tenant_id) || [];
            const tenantsNeedingPayment = activeTenants.filter(t => !existingPaymentTenantIds.includes(t.id));

            if (tenantsNeedingPayment.length > 0) {
                // Generate rent for tenants that don't have a payment record
                const newPayments = tenantsNeedingPayment.map(tenant => ({
                    user_id: user.id,
                    property_id: selectedProperty.id,
                    tenant_id: tenant.id,
                    month: monthStr,
                    amount: tenant.monthly_rent,
                    status: 'pending' as const,
                }));

                const { error: insertError } = await supabase
                    .from('rent_payments')
                    .insert(newPayments);

                if (insertError) {
                    console.error('Error auto-generating rent:', insertError);
                } else {
                    // Reload payments to show the newly generated ones
                    const { data: updatedPayments } = await supabase
                        .from('rent_payments')
                        .select(`
                            *,
                            tenant:tenants(*)
                        `)
                        .eq('property_id', selectedProperty.id)
                        .eq('user_id', user.id)
                        .eq('month', monthStr);

                    setRentPayments(updatedPayments || []);
                }
            }
        } catch (error) {
            console.error('Error loading property details:', error);
        }
    };

    const handlePropertySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            if (editingProperty) {
                const { error } = await supabase
                    .from('properties')
                    .update({
                        name: propertyForm.name,
                        address: propertyForm.address,
                        property_type: propertyForm.property_type,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingProperty.id)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('properties')
                    .insert({
                        user_id: user.id,
                        name: propertyForm.name,
                        address: propertyForm.address,
                        property_type: propertyForm.property_type,
                    });

                if (error) throw error;
            }

            setShowPropertyModal(false);
            setEditingProperty(null);
            resetPropertyForm();
            loadProperties();
        } catch (error) {
            console.error('Error saving property:', error);
            alert('Error saving property. Please try again.');
        }
    };

    const handleTenantSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedProperty) return;

        try {
            if (editingTenant) {
                const { error } = await supabase
                    .from('tenants')
                    .update({
                        first_name: tenantForm.first_name,
                        last_name: tenantForm.last_name,
                        phone: tenantForm.phone,
                        email: tenantForm.email || null,
                        monthly_rent: parseFloat(tenantForm.monthly_rent),
                        lease_start_date: tenantForm.lease_start_date,
                        is_active: tenantForm.is_active,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingTenant.id)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('tenants')
                    .insert({
                        user_id: user.id,
                        property_id: selectedProperty.id,
                        first_name: tenantForm.first_name,
                        last_name: tenantForm.last_name,
                        phone: tenantForm.phone,
                        email: tenantForm.email || null,
                        monthly_rent: parseFloat(tenantForm.monthly_rent),
                        lease_start_date: tenantForm.lease_start_date,
                        is_active: tenantForm.is_active,
                    });

                if (error) throw error;
            }

            setShowTenantModal(false);
            setEditingTenant(null);
            resetTenantForm();
            loadPropertyDetails();
        } catch (error) {
            console.error('Error saving tenant:', error);
            alert('Error saving tenant. Please try again.');
        }
    };

    const markAsPaid = (payment: RentPayment) => {
        setSelectedPayment(payment);
        setPaymentData({
            paid_date: format(new Date(), 'yyyy-MM-dd'),
            payment_method: 'upi',
            notes: '',
        });
        setShowPaymentModal(true);
    };

    const confirmPayment = async () => {
        if (!selectedPayment || !user) return;

        try {
            const { error } = await supabase
                .from('rent_payments')
                .update({
                    status: 'paid',
                    paid_date: paymentData.paid_date,
                    payment_method: paymentData.payment_method,
                    notes: paymentData.notes || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', selectedPayment.id)
                .eq('user_id', user.id);

            if (error) throw error;

            setShowPaymentModal(false);
            setSelectedPayment(null);
            loadPropertyDetails();
        } catch (error) {
            console.error('Error marking payment as paid:', error);
            alert('Error updating payment. Please try again.');
        }
    };

    const markAsPending = async (paymentId: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('rent_payments')
                .update({
                    status: 'pending',
                    paid_date: null,
                    payment_method: null,
                    notes: null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', paymentId)
                .eq('user_id', user.id);

            if (error) throw error;
            loadPropertyDetails();
        } catch (error) {
            console.error('Error marking payment as pending:', error);
            alert('Error updating payment. Please try again.');
        }
    };

    const handleDeleteProperty = async (id: string) => {
        if (!confirm('Are you sure? This will delete all tenants and payments for this property.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', id)
                .eq('user_id', user!.id);

            if (error) throw error;
            setSelectedProperty(null);
            loadProperties();
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Error deleting property. Please try again.');
        }
    };

    const handleDeleteTenant = async (id: string) => {
        if (!confirm('Are you sure? This will delete all rent payments for this tenant.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('tenants')
                .delete()
                .eq('id', id)
                .eq('user_id', user!.id);

            if (error) throw error;
            loadPropertyDetails();
        } catch (error) {
            console.error('Error deleting tenant:', error);
            alert('Error deleting tenant. Please try again.');
        }
    };

    const resetPropertyForm = () => {
        setPropertyForm({ name: '', address: '', property_type: 'residential' });
    };

    const resetTenantForm = () => {
        setTenantForm({
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            monthly_rent: '',
            lease_start_date: '',
            is_active: true,
        });
    };

    const openAddPropertyModal = () => {
        setEditingProperty(null);
        resetPropertyForm();
        setShowPropertyModal(true);
    };

    const openEditPropertyModal = (property: Property) => {
        setEditingProperty(property);
        setPropertyForm({
            name: property.name,
            address: property.address,
            property_type: (property.property_type as 'residential' | 'commercial') || 'residential',
        });
        setShowPropertyModal(true);
    };

    const openAddTenantModal = () => {
        setEditingTenant(null);
        resetTenantForm();
        setShowTenantModal(true);
    };

    const openEditTenantModal = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setTenantForm({
            first_name: tenant.first_name,
            last_name: tenant.last_name,
            phone: tenant.phone,
            email: tenant.email || '',
            monthly_rent: tenant.monthly_rent.toString(),
            lease_start_date: tenant.lease_start_date,
            is_active: tenant.is_active,
        });
        setShowTenantModal(true);
    };

    // Property List View
    if (!selectedProperty) {
        return (
            <ProtectedLayout>
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">My Properties</h1>
                            <p className="text-slate-600 mt-1">{properties.length} total properties</p>
                        </div>
                        <button onClick={openAddPropertyModal} className="btn btn-primary flex items-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span>Add Property</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            <div className="skeleton h-32 w-full"></div>
                            <div className="skeleton h-32 w-full"></div>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="card text-center py-12">
                            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No properties yet</h3>
                            <p className="text-slate-600 mb-6">Add your first property to start managing rent</p>
                            <button onClick={openAddPropertyModal} className="btn btn-primary inline-flex items-center space-x-2">
                                <Plus className="w-5 h-5" />
                                <span>Add Property</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {properties.map((property) => (
                                <div
                                    key={property.id}
                                    onClick={() => setSelectedProperty(property)}
                                    className="card hover:shadow-xl transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${property.property_type === 'commercial' ? 'bg-purple-100' : 'bg-blue-100'
                                                }`}>
                                                {property.property_type === 'commercial' ? (
                                                    <Store className={`w-7 h-7 ${property.property_type === 'commercial' ? 'text-purple-600' : 'text-blue-600'}`} />
                                                ) : (
                                                    <Home className="w-7 h-7 text-blue-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                                                    {property.name}
                                                </h3>
                                                <span className={`text-xs px-2 py-1 rounded-full ${property.property_type === 'commercial'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {property.property_type === 'commercial' ? 'Commercial' : 'Residential'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start text-sm text-slate-600 mb-3">
                                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{property.address}</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-sm text-slate-500">Click to view tenants & manage rent</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Property Modal */}
                    {showPropertyModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {editingProperty ? 'Edit Property' : 'Add Property'}
                                    </h2>
                                    <button onClick={() => setShowPropertyModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handlePropertySubmit} className="space-y-4">
                                    <div>
                                        <label className="label">Property Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setPropertyForm({ ...propertyForm, property_type: 'residential' })}
                                                className={`p-4 rounded-xl border-2 transition-all ${propertyForm.property_type === 'residential'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <Home className={`w-8 h-8 mx-auto mb-2 ${propertyForm.property_type === 'residential' ? 'text-blue-600' : 'text-slate-400'
                                                    }`} />
                                                <p className={`text-sm font-medium ${propertyForm.property_type === 'residential' ? 'text-blue-900' : 'text-slate-600'
                                                    }`}>
                                                    Residential
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">House, Apartment</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPropertyForm({ ...propertyForm, property_type: 'commercial' })}
                                                className={`p-4 rounded-xl border-2 transition-all ${propertyForm.property_type === 'commercial'
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <Store className={`w-8 h-8 mx-auto mb-2 ${propertyForm.property_type === 'commercial' ? 'text-purple-600' : 'text-slate-400'
                                                    }`} />
                                                <p className={`text-sm font-medium ${propertyForm.property_type === 'commercial' ? 'text-purple-900' : 'text-slate-600'
                                                    }`}>
                                                    Commercial
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">Shop, Store, Office</p>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Property Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="input"
                                            placeholder="e.g., Main Street Shop or My House"
                                            value={propertyForm.name}
                                            onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Address</label>
                                        <textarea
                                            required
                                            className="input min-h-[80px]"
                                            placeholder="Enter full address"
                                            value={propertyForm.address}
                                            onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button type="button" onClick={() => setShowPropertyModal(false)} className="btn btn-secondary flex-1">
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary flex-1">
                                            {editingProperty ? 'Update' : 'Add'} Property
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

    // Property Detail View
    return (
        <ProtectedLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Back Button & Header */}
                <div>
                    <button
                        onClick={() => setSelectedProperty(null)}
                        className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Properties</span>
                    </button>

                    <div className="card">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${selectedProperty.property_type === 'commercial' ? 'bg-purple-100' : 'bg-blue-100'
                                    }`}>
                                    {selectedProperty.property_type === 'commercial' ? (
                                        <Store className="w-8 h-8 text-purple-600" />
                                    ) : (
                                        <Home className="w-8 h-8 text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">{selectedProperty.name}</h1>
                                    <div className="flex items-center text-sm text-slate-600 mt-1">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {selectedProperty.address}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${selectedProperty.property_type === 'commercial'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {selectedProperty.property_type === 'commercial' ? 'Commercial Property' : 'Residential Property'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => openEditPropertyModal(selectedProperty)}
                                    className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteProperty(selectedProperty.id)}
                                    className="p-2 hover:bg-danger-50 text-danger-600 rounded-lg"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-primary-600" />
                            <span className="text-lg font-semibold text-slate-900">
                                {format(selectedMonth, 'MMMM yyyy')}
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    {format(selectedMonth, 'yyyy-MM') !== format(new Date(), 'yyyy-MM') && (
                        <button
                            onClick={() => setSelectedMonth(startOfMonth(new Date()))}
                            className="w-full mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Back to Current Month
                        </button>
                    )}
                </div>

                {/* Tenants Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center">
                            <Users className="w-6 h-6 mr-2" />
                            Tenants ({tenants.length})
                        </h2>
                        <button onClick={openAddTenantModal} className="btn btn-primary flex items-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span>Add Tenant</span>
                        </button>
                    </div>

                    {tenants.length === 0 ? (
                        <div className="card text-center py-8">
                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 mb-4">No tenants in this property</p>
                            <button onClick={openAddTenantModal} className="btn btn-primary inline-flex items-center space-x-2">
                                <Plus className="w-5 h-5" />
                                <span>Add First Tenant</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tenants.map((tenant) => {
                                const payment = rentPayments.find(p => p.tenant_id === tenant.id);
                                return (
                                    <div key={tenant.id} className="card">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="text-lg font-bold text-slate-900">
                                                        {tenant.first_name} {tenant.last_name}
                                                    </h3>
                                                    {tenant.is_active ? (
                                                        <span className="badge badge-success">Active</span>
                                                    ) : (
                                                        <span className="badge bg-slate-100 text-slate-600">Inactive</span>
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-sm text-slate-600">
                                                    <div className="flex items-center">
                                                        <Phone className="w-4 h-4 mr-2" />
                                                        {tenant.phone}
                                                    </div>
                                                    {tenant.email && (
                                                        <div className="flex items-center">
                                                            <Mail className="w-4 h-4 mr-2" />
                                                            {tenant.email}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        Since {format(new Date(tenant.lease_start_date), 'MMM dd, yyyy')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center mt-3 p-3 bg-slate-50 rounded-lg">
                                                    <IndianRupee className="w-5 h-5 text-slate-600 mr-1" />
                                                    <span className="text-xl font-bold text-slate-900">
                                                        {tenant.monthly_rent.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-sm text-slate-600 ml-2">/month</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-2 ml-4">
                                                <button
                                                    onClick={() => openEditTenantModal(tenant)}
                                                    className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTenant(tenant.id)}
                                                    className="p-2 hover:bg-danger-50 text-danger-600 rounded-lg"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Current Month Payment Status */}
                                        {payment && (
                                            <div className={`p-4 rounded-xl border-2 ${payment.status === 'paid'
                                                ? 'bg-success-50 border-success-200'
                                                : 'bg-warning-50 border-warning-200'
                                                }`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700">
                                                            {format(selectedMonth, 'MMMM yyyy')} Rent
                                                        </p>
                                                        {payment.status === 'paid' ? (
                                                            <div className="flex items-center text-success-700 mt-1">
                                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                                <span className="font-semibold">Paid</span>
                                                                {payment.paid_date && (
                                                                    <span className="text-sm ml-2">
                                                                        on {format(new Date(payment.paid_date), 'dd MMM')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center text-warning-700 mt-1">
                                                                <XCircle className="w-5 h-5 mr-2" />
                                                                <span className="font-semibold">Pending</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {payment.status === 'pending' ? (
                                                        <button
                                                            onClick={() => markAsPaid(payment)}
                                                            className="btn btn-success"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => markAsPending(payment.id)}
                                                            className="btn btn-secondary"
                                                        >
                                                            Undo
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Tenant Modal */}
                {showTenantModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingTenant ? 'Edit Tenant' : 'Add Tenant'}
                                </h2>
                                <button onClick={() => setShowTenantModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleTenantSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="input"
                                            placeholder="John"
                                            value={tenantForm.first_name}
                                            onChange={(e) => setTenantForm({ ...tenantForm, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="input"
                                            placeholder="Doe"
                                            value={tenantForm.last_name}
                                            onChange={(e) => setTenantForm({ ...tenantForm, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="input"
                                        placeholder="+91 9876543210"
                                        value={tenantForm.phone}
                                        onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label">Email (Optional)</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="john@example.com"
                                        value={tenantForm.email}
                                        onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
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
                                        placeholder="15000"
                                        value={tenantForm.monthly_rent}
                                        onChange={(e) => setTenantForm({ ...tenantForm, monthly_rent: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label">Lease Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input"
                                        value={tenantForm.lease_start_date}
                                        onChange={(e) => setTenantForm({ ...tenantForm, lease_start_date: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        className="w-5 h-5 text-primary-600 rounded"
                                        checked={tenantForm.is_active}
                                        onChange={(e) => setTenantForm({ ...tenantForm, is_active: e.target.checked })}
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
                                        Active tenant (generates monthly rent)
                                    </label>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowTenantModal(false)} className="btn btn-secondary flex-1">
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

                {/* Property Edit Modal */}
                {showPropertyModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Edit Property</h2>
                                <button onClick={() => setShowPropertyModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handlePropertySubmit} className="space-y-4">
                                <div>
                                    <label className="label">Property Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPropertyForm({ ...propertyForm, property_type: 'residential' })}
                                            className={`p-4 rounded-xl border-2 transition-all ${propertyForm.property_type === 'residential'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <Home className={`w-8 h-8 mx-auto mb-2 ${propertyForm.property_type === 'residential' ? 'text-blue-600' : 'text-slate-400'
                                                }`} />
                                            <p className={`text-sm font-medium ${propertyForm.property_type === 'residential' ? 'text-blue-900' : 'text-slate-600'
                                                }`}>
                                                Residential
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPropertyForm({ ...propertyForm, property_type: 'commercial' })}
                                            className={`p-4 rounded-xl border-2 transition-all ${propertyForm.property_type === 'commercial'
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <Store className={`w-8 h-8 mx-auto mb-2 ${propertyForm.property_type === 'commercial' ? 'text-purple-600' : 'text-slate-400'
                                                }`} />
                                            <p className={`text-sm font-medium ${propertyForm.property_type === 'commercial' ? 'text-purple-900' : 'text-slate-600'
                                                }`}>
                                                Commercial
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Property Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={propertyForm.name}
                                        onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label">Address</label>
                                    <textarea
                                        required
                                        className="input min-h-[80px]"
                                        value={propertyForm.address}
                                        onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowPropertyModal(false)} className="btn btn-secondary flex-1">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary flex-1">
                                        Update Property
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && selectedPayment && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Mark as Paid</h2>
                                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                                <p className="text-sm text-slate-600">Tenant</p>
                                <p className="font-semibold text-slate-900">
                                    {`${selectedPayment.tenant?.first_name || ''} ${selectedPayment.tenant?.last_name || ''}`.trim()}
                                </p>
                                <p className="text-sm text-slate-600 mt-2">Amount</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    ₹{selectedPayment.amount.toLocaleString('en-IN')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="label">Payment Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={paymentData.paid_date}
                                        onChange={(e) => setPaymentData({ ...paymentData, paid_date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label">Payment Method</label>
                                    <select
                                        className="input"
                                        value={paymentData.payment_method}
                                        onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value as any })}
                                    >
                                        <option value="upi">UPI</option>
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="cheque">Cheque</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Notes (Optional)</label>
                                    <textarea
                                        className="input min-h-[60px]"
                                        placeholder="Add any notes..."
                                        value={paymentData.notes}
                                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button onClick={() => setShowPaymentModal(false)} className="btn btn-secondary flex-1">
                                        Cancel
                                    </button>
                                    <button onClick={confirmPayment} className="btn btn-success flex-1">
                                        Confirm Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    );
}
