# Email Authentication Setup Guide

## ✅ Enable Email Authentication in Supabase

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project

### Step 2: Enable Email Provider

1. Click **"Authentication"** in the left sidebar
2. Click **"Providers"**
3. Find **"Email"** in the list
4. Make sure it's **toggled ON** (it should be enabled by default)
5. Click **"Save"** if you made any changes

### Step 3: Configure Email Settings (Optional)

1. Still in Authentication, click **"Email Templates"**
2. You can customize the confirmation email if you want
3. For testing, the default templates work fine

### Step 4: Disable Email Confirmation (For Testing Only)

For easier testing, you can disable email confirmation:

1. Go to **Authentication** → **Providers** → **Email**
2. Scroll down to find **"Confirm email"**
3. **Toggle it OFF** (for testing only)
4. Click **"Save"**

**Note:** In production, you should keep email confirmation ON for security.

## ✅ Test Your Login

1. Go to http://localhost:3000
2. You should see the new login page with email/password fields
3. Click **"Don't have an account? Sign Up"**
4. Enter your email and password (min 6 characters)
5. Click **"Create Account"**
6. If email confirmation is disabled, you'll be logged in immediately
7. If email confirmation is enabled, check your email for the confirmation link

## 🎉 You're Done!

Your app now uses email authentication instead of Google OAuth!
