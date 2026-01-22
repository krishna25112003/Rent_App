// Database Types matching your schema
export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    created_at: string;
    updated_at: string;
}

export interface Property {
    id: string;
    user_id: string;
    name: string;
    property_type: string | null;
    address: string;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    purchase_price: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Tenant {
    id: string;
    user_id: string;
    property_id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string;
    monthly_rent: number;
    lease_start_date: string;
    lease_end_date: string | null;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
    property?: Property;
}

export type RentStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'upi' | 'other';

export interface RentPayment {
    id: string;
    user_id: string;
    property_id: string;
    tenant_id: string;
    month: string; // YYYY-MM-DD format (first day of month)
    amount: number;
    status: RentStatus;
    paid_date: string | null;
    payment_method: PaymentMethod | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    property?: Property;
    tenant?: Tenant;
}

// Alias for backward compatibility
export type RentRecord = RentPayment;

export interface Expense {
    id: string;
    user_id: string;
    property_id: string;
    amount: number;
    category: string;
    description: string;
    expense_date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    property?: Property;
}

// Dashboard Stats
export interface DashboardStats {
    totalProperties: number;
    totalTenants: number;
    totalExpectedRent: number;
    totalCollectedRent: number;
    pendingRent: number;
    collectionRate: number;
}

// Report Types
export interface MonthlyReportData {
    month: string;
    summary: {
        totalProperties: number;
        totalTenants: number;
        totalExpected: number;
        totalCollected: number;
        totalPending: number;
    };
    details: Array<{
        propertyName: string;
        tenantName: string;
        amount: number;
        status: RentStatus;
        paidDate: string | null;
        paymentMethod: PaymentMethod | null;
    }>;
}
