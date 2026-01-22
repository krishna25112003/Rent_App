'use client';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { RentPayment } from '@/types';
import { User, LogOut, Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, X } from 'lucide-react';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';

export default function MenuPage() {
    const { user, signOut } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
    const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null);
    const [paymentData, setPaymentData] = useState({
        paid_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'upi' as const,
        notes: '',
    });

    useEffect(() => {
        if (user) {
            loadRentPayments();
        }
    }, [user, selectedMonth]);

    const loadRentPayments = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const monthStr = format(selectedMonth, 'yyyy-MM-01');

            const { data, error } = await supabase
                .from('rent_payments')
                .select(`
          *,
          property:properties(*),
          tenant:tenants(*)
        `)
                .eq('user_id', user.id)
                .eq('month', monthStr)
                .order('status', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRentPayments(data || []);
        } catch (error) {
            console.error('Error loading rent payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateRentPayments = async () => {
        if (!user) return;

        try {
            const monthStr = format(selectedMonth, 'yyyy-MM-01');

            const { data, error } = await supabase.rpc('generate_monthly_rent_payments', {
                target_user_id: user.id,
                target_month: monthStr,
            });

            if (error) throw error;

            alert(`Generated ${data || 0} new rent payment(s) for ${format(selectedMonth, 'MMMM yyyy')}`);
            loadRentPayments();
        } catch (error) {
            console.error('Error generating rent payments:', error);
            alert('Error generating rent payments. Please try again.');
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
            loadRentPayments();
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
            loadRentPayments();
        } catch (error) {
            console.error('Error marking payment as pending:', error);
            alert('Error updating payment. Please try again.');
        }
    };

    const handleSignOut = async () => {
        if (confirm('Are you sure you want to sign out?')) {
            await signOut();
        }
    };

    const pendingPayments = rentPayments.filter(p => p.status === 'pending');
    const paidPayments = rentPayments.filter(p => p.status === 'paid');

    return (
        <ProtectedLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Menu</h1>
                    <p className="text-slate-600 mt-1">Manage rent payments and settings</p>
                </div>

                {/* User Profile */}
                <div className="card">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{user?.email}</h2>
                            <p className="text-sm text-slate-600">Landlord Account</p>
                        </div>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Month</h2>
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
                </div>

                {/* Generate Rent Button */}
                <button
                    onClick={generateRentPayments}
                    className="w-full btn btn-primary"
                >
                    Generate Rent Payments for {format(selectedMonth, 'MMMM yyyy')}
                </button>

                {/* Pending Payments */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                        Pending Payments ({pendingPayments.length})
                    </h2>
                    {loading ? (
                        <div className="space-y-2">
                            <div className="skeleton h-16 w-full"></div>
                            <div className="skeleton h-16 w-full"></div>
                        </div>
                    ) : pendingPayments.length === 0 ? (
                        <p className="text-slate-600 text-center py-4">No pending payments</p>
                    ) : (
                        <div className="space-y-3">
                            {pendingPayments.map((payment) => (
                                <div key={payment.id} className="p-4 bg-warning-50 border border-warning-200 rounded-xl">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900">
                                                {payment.property?.name || 'Unknown Property'}
                                            </h3>
                                            <p className="text-sm text-slate-600">
                                                {`${payment.tenant?.first_name || ''} ${payment.tenant?.last_name || ''}`.trim() || 'Unknown Tenant'}
                                            </p>
                                            <p className="text-lg font-bold text-slate-900 mt-2">
                                                ₹{payment.amount.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => markAsPaid(payment)}
                                            className="btn btn-success btn-sm"
                                        >
                                            Mark Paid
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paid Payments */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                        Paid Payments ({paidPayments.length})
                    </h2>
                    {loading ? (
                        <div className="space-y-2">
                            <div className="skeleton h-16 w-full"></div>
                        </div>
                    ) : paidPayments.length === 0 ? (
                        <p className="text-slate-600 text-center py-4">No paid payments</p>
                    ) : (
                        <div className="space-y-3">
                            {paidPayments.map((payment) => (
                                <div key={payment.id} className="p-4 bg-success-50 border border-success-200 rounded-xl">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900">
                                                {payment.property?.name || 'Unknown Property'}
                                            </h3>
                                            <p className="text-sm text-slate-600">
                                                {`${payment.tenant?.first_name || ''} ${payment.tenant?.last_name || ''}`.trim() || 'Unknown Tenant'}
                                            </p>
                                            <p className="text-lg font-bold text-slate-900 mt-2">
                                                ₹{payment.amount.toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">
                                                Paid on: {payment.paid_date ? format(new Date(payment.paid_date), 'dd MMM yyyy') : 'N/A'}
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                Method: {payment.payment_method?.toUpperCase() || 'N/A'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => markAsPending(payment.id)}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Undo
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sign Out Button */}
                <button
                    onClick={handleSignOut}
                    className="w-full btn btn-danger flex items-center justify-center space-x-2"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>

                {/* Payment Modal */}
                {showPaymentModal && selectedPayment && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Mark as Paid</h2>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                                <p className="text-sm text-slate-600">Property</p>
                                <p className="font-semibold text-slate-900">{selectedPayment.property?.name}</p>
                                <p className="text-sm text-slate-600 mt-2">Tenant</p>
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
                                        className="input min-h-[80px]"
                                        placeholder="Add any notes about this payment..."
                                        value={paymentData.notes}
                                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmPayment}
                                        className="btn btn-success flex-1"
                                    >
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
