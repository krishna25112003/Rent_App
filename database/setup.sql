-- =====================================================
-- RENT MANAGEMENT SYSTEM - DATABASE SETUP
-- =====================================================
-- This file contains all SQL commands to set up the database
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    monthly_rent DECIMAL(10, 2) NOT NULL CHECK (monthly_rent >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    move_in_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rent Records Table
CREATE TABLE IF NOT EXISTS rent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- First day of the month (YYYY-MM-01)
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
    payment_date DATE,
    payment_mode TEXT CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer', 'cheque', 'other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, tenant_id, month)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_records_user_id ON rent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_rent_records_month ON rent_records(month);
CREATE INDEX IF NOT EXISTS idx_rent_records_status ON rent_records(status);
CREATE INDEX IF NOT EXISTS idx_rent_records_property_tenant ON rent_records(property_id, tenant_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_records ENABLE ROW LEVEL SECURITY;

-- Properties Policies
CREATE POLICY "Users can view their own properties"
    ON properties FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties"
    ON properties FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
    ON properties FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
    ON properties FOR DELETE
    USING (auth.uid() = user_id);

-- Tenants Policies
CREATE POLICY "Users can view their own tenants"
    ON tenants FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tenants"
    ON tenants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tenants"
    ON tenants FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tenants"
    ON tenants FOR DELETE
    USING (auth.uid() = user_id);

-- Rent Records Policies
CREATE POLICY "Users can view their own rent records"
    ON rent_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rent records"
    ON rent_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rent records"
    ON rent_records FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rent records"
    ON rent_records FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to auto-generate rent records for a specific month
CREATE OR REPLACE FUNCTION generate_monthly_rent_records(
    target_user_id UUID,
    target_month DATE
)
RETURNS INTEGER AS $$
DECLARE
    records_created INTEGER := 0;
    tenant_record RECORD;
BEGIN
    -- Ensure target_month is the first day of the month
    target_month := DATE_TRUNC('month', target_month);
    
    -- Loop through all active tenants for the user
    FOR tenant_record IN
        SELECT 
            t.id as tenant_id,
            t.property_id,
            p.monthly_rent,
            p.user_id
        FROM tenants t
        JOIN properties p ON t.property_id = p.id
        WHERE t.user_id = target_user_id
        AND t.is_active = TRUE
        AND p.user_id = target_user_id
    LOOP
        -- Insert rent record if it doesn't exist
        INSERT INTO rent_records (
            user_id,
            property_id,
            tenant_id,
            month,
            amount,
            status
        )
        VALUES (
            target_user_id,
            tenant_record.property_id,
            tenant_record.tenant_id,
            target_month,
            tenant_record.monthly_rent,
            'pending'
        )
        ON CONFLICT (property_id, tenant_id, month) DO NOTHING;
        
        -- Check if a row was inserted
        IF FOUND THEN
            records_created := records_created + 1;
        END IF;
    END LOOP;
    
    RETURN records_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to automatically generate rent record when a new tenant is added
CREATE OR REPLACE FUNCTION auto_generate_current_month_rent()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate for active tenants
    IF NEW.is_active = TRUE THEN
        INSERT INTO rent_records (
            user_id,
            property_id,
            tenant_id,
            month,
            amount,
            status
        )
        SELECT 
            NEW.user_id,
            NEW.property_id,
            NEW.id,
            DATE_TRUNC('month', CURRENT_DATE),
            p.monthly_rent,
            'pending'
        FROM properties p
        WHERE p.id = NEW.property_id
        ON CONFLICT (property_id, tenant_id, month) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_generate_rent
    AFTER INSERT ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_current_month_rent();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION generate_monthly_rent_records(UUID, DATE) TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Next steps:
-- 1. Enable Google OAuth in Supabase Auth settings
-- 2. Add your domain to allowed redirect URLs
-- 3. Copy your Supabase URL and anon key to .env.local
-- =====================================================
