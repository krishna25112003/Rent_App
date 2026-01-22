# Google OAuth Setup - Detailed Guide

## Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com
2. Sign in with your Google account

## Step 2: Create a New Project

1. Click the project dropdown (top left, next to "Google Cloud")
2. Click "NEW PROJECT"
3. Enter project name: "Rent Management App"
4. Click "CREATE"
5. Wait for project creation (30 seconds)
6. Select your new project from the dropdown

## Step 3: Enable Google+ API

1. In the search bar, type "Google+ API"
2. Click on "Google+ API"
3. Click "ENABLE"

## Step 4: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External"
3. Click "CREATE"
4. Fill in:
   - App name: "Rent Management App"
   - User support email: Your email
   - Developer contact: Your email
5. Click "SAVE AND CONTINUE"
6. Click "SAVE AND CONTINUE" on Scopes (skip)
7. Click "SAVE AND CONTINUE" on Test users (skip)
8. Click "BACK TO DASHBOARD"

## Step 5: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Rent Management Web Client"
5. Authorized JavaScript origins:
   - Click "ADD URI"
   - Add: `http://localhost:3000`
6. Authorized redirect URIs:
   - Click "ADD URI"
   - Add: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - (Get YOUR_PROJECT_REF from Supabase URL)
7. Click "CREATE"
8. **COPY** the Client ID and Client Secret

## Step 6: Add to Supabase

1. Go to Supabase → Authentication → Providers → Google
2. Toggle ON
3. Paste Client ID
4. Paste Client Secret
5. Click "Save"

Done! Google OAuth is now configured.
