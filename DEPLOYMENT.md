# Deployment Guide

This guide covers deploying your Rent Management PWA to production.

## Recommended Platform: Vercel

Vercel is the recommended platform as it's built by the Next.js team and offers seamless integration.

### Deploy to Vercel

#### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Rent Management PWA"

# Create a GitHub repository and push
git remote add origin https://github.com/yourusername/rent-management-pwa.git
git branch -M main
git push -u origin main
```

#### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New Project**
4. Import your repository
5. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
6. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
7. Click **Deploy**

#### 3. Configure Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

#### 4. Update Supabase Settings

1. Go to your Supabase project
2. **Authentication** > **URL Configuration**
3. Add production URLs:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`
4. **Authentication** > **Providers** > **Google**
5. Update Google OAuth redirect URIs in Google Cloud Console

## Alternative: Netlify

### Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click **Add new site** > **Import an existing project**
4. Connect to GitHub and select repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Add environment variables in **Site settings** > **Environment variables**
7. Deploy!

## Alternative: Self-Hosted (VPS)

### Requirements
- Node.js 18+
- PM2 or similar process manager
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

### Steps

1. **Clone repository on server**
   ```bash
   git clone https://github.com/yourusername/rent-management-pwa.git
   cd rent-management-pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env.local**
   ```bash
   nano .env.local
   # Add your production environment variables
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Install PM2**
   ```bash
   npm install -g pm2
   ```

6. **Start with PM2**
   ```bash
   pm2 start npm --name "rent-app" -- start
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

## Post-Deployment Checklist

- [ ] Application is accessible at production URL
- [ ] Google OAuth login works
- [ ] Can create properties and tenants
- [ ] Rent generation works
- [ ] Reports download correctly
- [ ] PWA is installable (check in browser)
- [ ] Mobile responsiveness verified
- [ ] All environment variables are set correctly
- [ ] Database connection is working
- [ ] RLS policies are active

## PWA Installation Testing

### On Mobile (Android/iOS)
1. Open the app in Chrome/Safari
2. Look for "Add to Home Screen" prompt
3. Install the app
4. Open from home screen
5. Verify fullscreen mode

### On Desktop (Chrome/Edge)
1. Open the app
2. Look for install icon in address bar
3. Click to install
4. Open as standalone app
5. Verify app window

## Performance Optimization

### Enable Caching
Already configured in `next.config.js`

### Image Optimization
Next.js automatically optimizes images

### Database Indexes
Already created in `setup.sql`

### Monitoring
- Use Vercel Analytics (built-in)
- Monitor Supabase dashboard for database performance
- Set up error tracking (Sentry, LogRocket)

## Security Checklist

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables secured
- [ ] RLS policies tested
- [ ] Google OAuth configured correctly
- [ ] CORS settings verified
- [ ] Rate limiting considered (Supabase has built-in)

## Backup Strategy

### Database Backups
Supabase provides automatic daily backups on paid plans.

For manual backups:
1. Go to Supabase Dashboard
2. Database > Backups
3. Create manual backup

### Code Backups
- Keep code in GitHub
- Tag releases: `git tag v1.0.0`
- Push tags: `git push --tags`

## Updating the Application

### For Vercel
1. Push changes to GitHub
2. Vercel automatically deploys
3. Monitor deployment in Vercel dashboard

### For Self-Hosted
```bash
cd rent-management-pwa
git pull
npm install
npm run build
pm2 restart rent-app
```

## Troubleshooting Production Issues

### Check Logs
**Vercel**: Project > Deployments > Click deployment > View Function Logs
**Self-hosted**: `pm2 logs rent-app`

### Common Issues

**OAuth not working**
- Verify redirect URLs in Google Console and Supabase
- Check environment variables

**Database connection failed**
- Verify Supabase URL and key
- Check if Supabase project is active

**Build failed**
- Check build logs
- Verify all dependencies are in package.json
- Run `npm run build` locally first

## Scaling Considerations

### Database
- Supabase scales automatically
- Consider upgrading plan for more connections
- Monitor query performance

### Application
- Vercel scales automatically
- Consider Vercel Pro for better performance
- Use CDN for static assets

## Cost Estimation

### Free Tier (Development/Small Scale)
- Vercel: Free (hobby plan)
- Supabase: Free (up to 500MB database, 50K monthly active users)
- Total: $0/month

### Production (Medium Scale)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Custom Domain: ~$12/year
- Total: ~$45/month

---

**Congratulations!** Your Rent Management PWA is now live! 🎉
