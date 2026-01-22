# 🏠 Rent Management PWA

A professional, secure, and scalable **Multi-User Rent Management System** built as a Progressive Web Application (PWA) using Next.js, Supabase, and Google OAuth.

## ✨ Features

### 🔐 Security & Authentication
- **Google OAuth** authentication (no passwords)
- **Row Level Security (RLS)** for complete data isolation
- User-specific data access with UUID-based user identification
- Secure session management

### 🏢 Property Management
- Add, edit, and delete properties
- Track property details (name, address, monthly rent)
- View all properties in a clean, card-based interface

### 👥 Tenant Management
- Manage tenants with full CRUD operations
- Link tenants to properties
- Track tenant details (name, phone, email, move-in date)
- Active/Inactive status toggle
- Automatic rent generation for active tenants

### 💰 Rent Management
- **Automatic monthly rent record generation**
- Manual payment confirmation workflow
- Track payment status (Pending/Paid)
- Record payment details (date, mode, notes)
- Support for multiple payment modes (UPI, Cash, Bank Transfer, Cheque)

### 📊 Dashboard & Analytics
- Month-wise financial overview
- Real-time statistics:
  - Total properties
  - Active tenants
  - Expected rent
  - Collected rent
  - Pending rent
  - Collection rate
- Interactive month selector

### 📄 Professional Reports
- **PDF Reports** with detailed summaries
- **Excel Reports** (.xlsx) with comprehensive data
- Month-wise report generation
- Summary and detailed breakdowns
- Property-wise and tenant-wise data

### 📱 Progressive Web App
- Installable on mobile and desktop
- Offline-capable with service workers
- App-like experience with fullscreen mode
- Mobile-first, responsive design
- Bottom navigation for easy access

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, APIs)
- **Authentication**: Google OAuth via Supabase Auth
- **Database**: PostgreSQL with Row Level Security
- **Reports**: jsPDF, xlsx
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- Google OAuth credentials

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Rent_app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `database/setup.sql`
3. Enable **Google OAuth** in Authentication > Providers
4. Add your redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get these values from your Supabase project settings.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Rent_app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── properties/         # Properties management
│   │   ├── tenants/            # Tenants management
│   │   ├── reports/            # Reports & downloads
│   │   ├── menu/               # Menu & rent management
│   │   ├── login/              # Login page
│   │   ├── auth/callback/      # OAuth callback
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # Reusable components
│   │   ├── BottomNav.tsx       # Bottom navigation
│   │   └── ProtectedLayout.tsx # Auth wrapper
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── lib/                    # Utilities
│   │   └── supabase.ts         # Supabase client
│   └── types/                  # TypeScript types
│       └── index.ts            # Type definitions
├── database/
│   └── setup.sql               # Database schema & RLS
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # App icons
├── .env.example                # Environment template
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind config
└── package.json                # Dependencies
```

## 🗄️ Database Schema

### Tables

1. **properties**
   - id, user_id, name, address, monthly_rent, created_at

2. **tenants**
   - id, user_id, property_id, name, phone, email, move_in_date, is_active, created_at

3. **rent_records**
   - id, user_id, property_id, tenant_id, month, amount, status, payment_date, payment_mode, notes, created_at

### Security

- All tables have **Row Level Security (RLS)** enabled
- Users can only access their own data
- Policies enforce user_id checks on all operations

### Functions

- `generate_monthly_rent_records(user_id, month)` - Auto-generates rent records

## 🎨 Design Philosophy

- **Mobile-First**: Optimized for mobile devices with touch-friendly UI
- **Premium Aesthetics**: Modern gradients, smooth animations, and professional design
- **User Experience**: Intuitive navigation with bottom nav bar
- **Accessibility**: Semantic HTML and proper ARIA labels
- **Performance**: Optimized loading states and efficient data fetching

## 🔒 Security Features

- ✅ Google OAuth only (no password storage)
- ✅ Row Level Security on all database tables
- ✅ User ID validation on all operations
- ✅ Secure session management
- ✅ Environment variable protection
- ✅ HTTPS required in production

## 📱 PWA Features

- ✅ Installable on mobile and desktop
- ✅ Offline support with service workers
- ✅ App manifest with icons
- ✅ Fullscreen mode
- ✅ Native app-like experience

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 📝 Usage Guide

### Adding a Property

1. Navigate to **Properties** tab
2. Click **Add Property**
3. Fill in property details
4. Save

### Adding a Tenant

1. Navigate to **Tenants** tab
2. Click **Add Tenant**
3. Select property and fill in tenant details
4. Mark as active to auto-generate rent
5. Save

### Generating Monthly Rent

1. Go to **Menu** tab
2. Select the month
3. Click **Generate Rent Records**
4. Records are created for all active tenants

### Marking Rent as Paid

1. Go to **Menu** tab
2. Find the pending payment
3. Click **Mark Paid**
4. Enter payment details
5. Confirm

### Downloading Reports

1. Navigate to **Reports** tab
2. Select the month
3. Click **Download PDF** or **Download Excel**

## 🤝 Contributing

This is a portfolio/startup-ready project. Feel free to fork and customize for your needs.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

Built with ❤️ using Next.js, Supabase, and modern web technologies.

## 🐛 Known Issues & Future Enhancements

### Future Scope
- [ ] Tenant login portal
- [ ] Payment gateway integration
- [ ] Automated rent reminders (SMS/Email)
- [ ] Late fee calculation
- [ ] Multi-currency support
- [ ] SaaS subscription model
- [ ] Admin dashboard for super users
- [ ] Expense tracking
- [ ] Maintenance request management

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Note**: This is a production-ready application suitable for real-world use, academic projects, interviews, and startup MVPs.
