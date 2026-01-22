# 🚀 Deployment Instructions for Vercel

I have already initialized your local Git repository. Now you just need to push it to the cloud and deploy.

## Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `rent-management-app`).
3. Make it **Private** (recommended for personal projects).
4. Click **Create repository**.

## Step 2: Push Your Code
Copy the commands shown on GitHub under "…or push an existing repository from the command line" and run them in your terminal here. They will look like this:

```bash
git remote add origin https://github.com/YOUR_USERNAME/rent-management-app.git
git branch -M main
git push -u origin main
```

*(Replace the URL with your actual repository URL)*

## Step 3: Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. connect your GitHub account if you haven't already.
3. Import the `rent-management-app` repository you just created.
4. **⚠️ IMPORTANT: Configure Environment Variables**
   Before clicking "Deploy", expand the **"Environment Variables"** section and add these from your `.env.local` file:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | *(Copy from your .env.local)* |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Copy from your .env.local)* |

5. Click **Deploy**.

## Step 4: Final Supabase Config
Once your site is live (e.g., `https://rent-app-rho.vercel.app`), go to your **Supabase Dashboard**:
1. Go to **Authentication** > **URL Configuration**.
2. Add your new Vercel URL to **Site URL**.
3. Add `https://YOUR-VERCEL-URL.vercel.app/auth/callback` to **Redirect URLs**.

🎉 **Done! Your app is live!**
