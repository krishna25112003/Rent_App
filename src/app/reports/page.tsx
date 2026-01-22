'use client';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { RentPayment } from '@/types';
import { FileText, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
    const { user } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
    const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
    const [loading, setLoading] = useState(true);

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
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRentPayments(data || []);
        } catch (error) {
            console.error('Error loading rent payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const monthName = format(selectedMonth, 'MMMM yyyy');

        // Title
        doc.setFontSize(20);
        doc.text('Rent Collection Report', 14, 20);
        doc.setFontSize(12);
        doc.text(monthName, 14, 28);

        // Summary
        const totalExpected = rentPayments.reduce((sum, r) => sum + r.amount, 0);
        const totalCollected = rentPayments.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
        const totalPending = totalExpected - totalCollected;

        doc.setFontSize(10);
        doc.text(`Total Expected: ₹${totalExpected.toLocaleString('en-IN')}`, 14, 36);
        doc.text(`Total Collected: ₹${totalCollected.toLocaleString('en-IN')}`, 14, 42);
        doc.text(`Total Pending: ₹${totalPending.toLocaleString('en-IN')}`, 14, 48);

        // Table
        const tableData = rentPayments.map(payment => [
            payment.property?.name || 'N/A',
            `${payment.tenant?.first_name || ''} ${payment.tenant?.last_name || ''}`.trim() || 'N/A',
            `₹${payment.amount.toLocaleString('en-IN')}`,
            payment.status.toUpperCase(),
            payment.paid_date ? format(new Date(payment.paid_date), 'dd/MM/yyyy') : '-',
            payment.payment_method || '-',
        ]);

        autoTable(doc, {
            startY: 55,
            head: [['Property', 'Tenant', 'Amount', 'Status', 'Paid Date', 'Method']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [14, 165, 233] },
        });

        doc.save(`rent-report-${format(selectedMonth, 'yyyy-MM')}.pdf`);
    };

    const downloadExcel = () => {
        const monthName = format(selectedMonth, 'MMMM yyyy');

        const data = rentPayments.map(payment => ({
            'Property': payment.property?.name || 'N/A',
            'Tenant': `${payment.tenant?.first_name || ''} ${payment.tenant?.last_name || ''}`.trim() || 'N/A',
            'Amount': payment.amount,
            'Status': payment.status.toUpperCase(),
            'Paid Date': payment.paid_date ? format(new Date(payment.paid_date), 'dd/MM/yyyy') : '-',
            'Payment Method': payment.payment_method || '-',
            'Notes': payment.notes || '-',
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, monthName);
        XLSX.writeFile(wb, `rent-report-${format(selectedMonth, 'yyyy-MM')}.xlsx`);
    };

    const totalExpected = rentPayments.reduce((sum, r) => sum + r.amount, 0);
    const totalCollected = rentPayments.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
    const totalPending = totalExpected - totalCollected;

    return (
        <ProtectedLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
                    <p className="text-slate-600 mt-1">Download rent collection reports</p>
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
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card-compact">
                        <p className="text-sm text-slate-600 mb-1">Total Expected</p>
                        <p className="text-2xl font-bold text-slate-900">₹{totalExpected.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="card-compact">
                        <p className="text-sm text-slate-600 mb-1">Total Collected</p>
                        <p className="text-2xl font-bold text-success-600">₹{totalCollected.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="card-compact">
                        <p className="text-sm text-slate-600 mb-1">Total Pending</p>
                        <p className="text-2xl font-bold text-warning-600">₹{totalPending.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={downloadPDF}
                        disabled={rentPayments.length === 0}
                        className="btn btn-primary flex items-center justify-center space-x-2 flex-1"
                    >
                        <Download className="w-5 h-5" />
                        <span>Download PDF Report</span>
                    </button>
                    <button
                        onClick={downloadExcel}
                        disabled={rentPayments.length === 0}
                        className="btn btn-success flex items-center justify-center space-x-2 flex-1"
                    >
                        <Download className="w-5 h-5" />
                        <span>Download Excel Report</span>
                    </button>
                </div>

                {/* Preview */}
                <div className="card">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Preview</h2>
                    {loading ? (
                        <div className="space-y-2">
                            <div className="skeleton h-12 w-full"></div>
                            <div className="skeleton h-12 w-full"></div>
                        </div>
                    ) : rentPayments.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600">No rent records for this month</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Property</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tenant</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Paid Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentPayments.map((payment) => (
                                        <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4 text-sm text-slate-900">{payment.property?.name || 'N/A'}</td>
                                            <td className="py-3 px-4 text-sm text-slate-900">
                                                {`${payment.tenant?.first_name || ''} ${payment.tenant?.last_name || ''}`.trim() || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-900 text-right font-semibold">
                                                ₹{payment.amount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`badge ${payment.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                                    {payment.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 text-center">
                                                {payment.paid_date ? format(new Date(payment.paid_date), 'dd/MM/yyyy') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedLayout>
    );
}
