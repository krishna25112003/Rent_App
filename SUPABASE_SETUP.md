# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Rent Management PWA.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in the details:
   - **Name**: Rent Management App
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
4. Click **Create new project**
5. Wait for the project to be set up (2-3 minutes)

## Step 2: Run the Database Setup SQL

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database/setup.sql` from this project
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" - this is correct!

This will create:
- All necessary tables (properties, tenants, rent_records)
- Row Level Security policies
- Database indexes for performance
- Functions for auto-generating rent records
- Triggers for automatic rent creation

## Step 3: Configure Google OAuth

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Rent Management App
   - User support email: Your email
   - Developer contact: Your email
   - Save and continue through the scopes and test users
6. Back in Credentials, create OAuth client ID:
   - Application type: **Web application**
   - Name: Rent Management App
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
     - (Get this from Supabase Auth settings)
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### 3.2 Configure Supabase Auth

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** in the list
3. Enable Google provider
4. Paste your Google **Client ID** and **Client Secret**
5. Click **Save**

### 3.3 Add Redirect URLs

1. Still in **Authentication** > **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:3000` (development) or `https://yourdomain.com` (production)
   - **Redirect URLs**: Add both:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback` (if deploying)

## Step 4: Get Your Supabase Credentials

1. Go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)

## Step 5: Configure Your App

1. In your project root, create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Replace the values with your actual Supabase credentials

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000`

3. Click **Continue with Google**

4. Sign in with your Google account

5. You should be redirected to the dashboard!

## Verification Checklist

✅ Database tables created (check in Supabase Table Editor)
✅ RLS policies enabled (check in Authentication > Policies)
✅ Google OAuth configured (check in Authentication > Providers)
✅ Environment variables set in `.env.local`
✅ Can sign in with Google
✅ Can access dashboard after login

## Troubleshooting

### "Invalid login credentials"
- Check that Google OAuth is enabled in Supabase
- Verify Client ID and Secret are correct
- Make sure redirect URLs match exactly

### "Row Level Security policy violation"
- Ensure you ran the complete `setup.sql` file
- Check that RLS is enabled on all tables
- Verify policies exist in Table Editor > Policies

### "Function not found: generate_monthly_rent_records"
- Re-run the `setup.sql` file
- Check the Functions section in Supabase dashboard

### Can't see data after adding
- Check browser console for errors
- Verify user_id is being set correctly
- Check RLS policies in Supabase

## Production Deployment

When deploying to production:

1. Create a new Supabase project for production (recommended)
2. Run `setup.sql` on the production database
3. Update Google OAuth redirect URLs to include production domain
4. Update environment variables in your hosting platform (Vercel, etc.)
5. Ensure HTTPS is enabled

## Security Best Practices

- ✅ Never commit `.env.local` to version control
- ✅ Use different Supabase projects for dev and production
- ✅ Regularly rotate your database password
- ✅ Monitor authentication logs in Supabase
- ✅ Keep Supabase and dependencies updated

## Next Steps

Once setup is complete:
1. Add your first property
2. Add a tenant
3. Generate rent records
4. Test payment marking
5. Download a report

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs) or open an issue on GitHub.
