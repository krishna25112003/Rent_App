'use client';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { DashboardStats } from '@/types';
import { Building2, Users, TrendingUp, TrendingDown, Calendar, IndianRupee } from 'lucide-react';
import { format, startOfMonth, subMonths, addMonths } from 'date-fns';

export default function DashboardPage() {
    const { user } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadDashboardStats();
        }
    }, [user, selectedMonth]);

    const loadDashboardStats = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const monthStr = format(selectedMonth, 'yyyy-MM-dd');

            // Get properties count
            const { count: propertiesCount } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // Get active tenants count
            const { count: tenantsCount } = await supabase
                .from('tenants')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_active', true);

            // Get rent records for selected month
            const { data: rentRecords } = await supabase
                .from('rent_records')
                .select('amount, status')
                .eq('user_id', user.id)
                .eq('month', monthStr);

            const totalExpected = rentRecords?.reduce((sum, record) => sum + record.amount, 0) || 0;
            const totalCollected = rentRecords?.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.amount, 0) || 0;
            const pendingRent = totalExpected - totalCollected;
            const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

            setStats({
                totalProperties: propertiesCount || 0,
                totalTenants: tenantsCount || 0,
                totalExpectedRent: totalExpected,
                totalCollectedRent: totalCollected,
                pendingRent,
                collectionRate,
            });
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousMonth = () => {
        setSelectedMonth(subMonths(selectedMonth, 1));
    };

    const handleNextMonth = () => {
        setSelectedMonth(addMonths(selectedMonth, 1));
    };

    const handleCurrentMonth = () => {
        setSelectedMonth(startOfMonth(new Date()));
    };

    if (loading) {
        return (
            <ProtectedLayout>
                <div className="space-y-6">
                    <div className="skeleton h-32 w-full"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="skeleton h-24"></div>
                        <div className="skeleton h-24"></div>
                        <div className="skeleton h-24"></div>
                        <div className="skeleton h-24"></div>
                    </div>
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
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-600 mt-1">Welcome back, {user?.user_metadata?.name || user?.email}</p>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePreviousMonth}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Calendar className="w-5 h-5 rotate-180" />
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-slate-600">Selected Month</p>
                            <p className="text-xl font-bold text-slate-900">{format(selectedMonth, 'MMMM yyyy')}</p>
                        </div>

                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Calendar className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={handleCurrentMonth}
                        className="mt-4 w-full btn btn-secondary text-sm"
                    >
                        Current Month
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Properties */}
                    <div className="stat-card hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <Building2 className="w-8 h-8 text-primary-500" />
                        </div>
                        <p className="stat-value">{stats?.totalProperties || 0}</p>
                        <p className="stat-label">Properties</p>
                    </div>

                    {/* Tenants */}
                    <div className="stat-card hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="stat-value">{stats?.totalTenants || 0}</p>
                        <p className="stat-label">Active Tenants</p>
                    </div>

                    {/* Expected Rent */}
                    <div className="stat-card hover:shadow-md transition-shadow col-span-2">
                        <div className="flex items-center justify-between mb-2">
                            <IndianRupee className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="stat-value">₹{stats?.totalExpectedRent.toLocaleString('en-IN') || 0}</p>
                        <p className="stat-label">Expected Rent</p>
                    </div>

                    {/* Collected Rent */}
                    <div className="stat-card hover:shadow-md transition-shadow col-span-2 bg-gradient-to-br from-success-50 to-success-100 border border-success-200">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 text-success-600" />
                            <span className="text-xs font-medium text-success-700">
                                {stats?.collectionRate.toFixed(1)}% collected
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-success-700">₹{stats?.totalCollectedRent.toLocaleString('en-IN') || 0}</p>
                        <p className="text-sm text-success-600">Collected Rent</p>
                    </div>

                    {/* Pending Rent */}
                    {(stats?.pendingRent || 0) > 0 && (
                        <div className="stat-card hover:shadow-md transition-shadow col-span-2 bg-gradient-to-br from-warning-50 to-warning-100 border border-warning-200">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingDown className="w-8 h-8 text-warning-600" />
                            </div>
                            <p className="text-2xl font-bold text-warning-700">₹{stats?.pendingRent.toLocaleString('en-IN') || 0}</p>
                            <p className="text-sm text-warning-600">Pending Rent</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <a href="/properties" className="btn btn-primary text-sm">
                            Add Property
                        </a>
                        <a href="/tenants" className="btn btn-secondary text-sm">
                            Add Tenant
                        </a>
                        <a href="/reports" className="btn btn-secondary text-sm col-span-2">
                            Download Report
                        </a>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
