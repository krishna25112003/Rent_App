# 🚀 Quick Start Guide

Get your Rent Management PWA up and running in 10 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ A Google account
- ✅ 10 minutes of your time

## Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

## Step 2: Set Up Supabase (5 minutes)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Name it "Rent Management" and create

### 2.2 Run Database Setup
1. In Supabase, go to **SQL Editor**
2. Copy everything from `database/setup.sql`
3. Paste and click **Run**

### 2.3 Enable Google OAuth
1. Go to **Authentication** > **Providers**
2. Enable **Google**
3. For quick testing, use these temporary settings:
   - You can use Supabase's development OAuth (no Google setup needed initially)
   - OR follow the full Google OAuth setup in `SUPABASE_SETUP.md`

## Step 3: Configure Environment (1 minute)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   Get these from: Supabase Dashboard > Settings > API

## Step 4: Run the App (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Start Using! (1 minute)

1. Click **Continue with Google**
2. Sign in with your Google account
3. You'll be redirected to the Dashboard
4. Start adding properties and tenants!

## 🎯 First Tasks

### Add Your First Property
1. Click **Properties** in bottom nav
2. Click **Add Property**
3. Fill in:
   - Name: "My First Property"
   - Address: "123 Main St"
   - Monthly Rent: 15000
4. Save!

### Add Your First Tenant
1. Click **Tenants** in bottom nav
2. Click **Add Tenant**
3. Fill in:
   - Name: "John Doe"
   - Property: Select your property
   - Phone: "+91 9876543210"
   - Move-in Date: Today's date
   - Keep "Active tenant" checked
4. Save!

### Generate Rent Records
1. Click **Menu** in bottom nav
2. Click **Generate Rent Records**
3. A rent record is automatically created!

### Mark Rent as Paid
1. In **Menu**, find the pending payment
2. Click **Mark Paid**
3. Select payment date and mode
4. Confirm!

### Download Your First Report
1. Click **Reports** in bottom nav
2. Click **Download PDF Report**
3. View your professional rent report!

## 📱 Install as PWA

### On Mobile
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home Screen"
4. Open from your home screen!

### On Desktop
1. Look for the install icon in the address bar
2. Click to install
3. Open as a standalone app!

## 🎨 Features to Explore

- ✅ Dashboard with monthly stats
- ✅ Property management
- ✅ Tenant management
- ✅ Automatic rent generation
- ✅ Payment tracking
- ✅ PDF & Excel reports
- ✅ Month-wise filtering
- ✅ Mobile-first design

## 🆘 Need Help?

### Common Issues

**Can't sign in with Google?**
- Make sure Google OAuth is enabled in Supabase
- Check that redirect URLs are correct
- See `SUPABASE_SETUP.md` for detailed OAuth setup

**Database errors?**
- Verify you ran the complete `setup.sql` file
- Check that RLS policies are enabled

**Environment variables not working?**
- Make sure file is named `.env.local` (not `.env`)
- Restart the dev server after changing env vars

### Documentation
- 📖 Full README: `README.md`
- 🗄️ Supabase Setup: `SUPABASE_SETUP.md`
- 🚀 Deployment: `DEPLOYMENT.md`

## 🎉 You're All Set!

Your Rent Management PWA is ready to use. Start managing your properties professionally!

---

**Pro Tip**: This app works offline once installed as a PWA. Perfect for on-the-go rent collection!
