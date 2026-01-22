# 🧪 Complete Testing Guide - Rent Management PWA

## 📋 **Pre-Testing Checklist**

Before you start testing, make sure:
- [ ] Dev server is running (`npm run dev`)
- [ ] Supabase database is set up (tables created)
- [ ] Email authentication is enabled in Supabase
- [ ] Browser is open at http://localhost:3000

---

## 🔐 **Test 1: Authentication (5 minutes)**

### **Sign Up**
1. Open http://localhost:3000
2. You should see the **Login page**
3. Click **"Don't have an account? Sign Up"**
4. Enter:
   - Email: `test@example.com`
   - Password: `password123`
5. Click **"Create Account"**
6. ✅ **Expected**: Redirected to Dashboard
7. ✅ **Expected**: See your email in the top section

### **Sign Out**
1. Click **"Menu"** in bottom navigation
2. Scroll down and click **"Sign Out"**
3. Confirm sign out
4. ✅ **Expected**: Redirected to Login page

### **Sign In**
1. Enter the same credentials
2. Click **"Sign In"**
3. ✅ **Expected**: Redirected to Dashboard

---

## 🏠 **Test 2: Property Management (10 minutes)**

### **Add Residential Property**
1. Click **"Properties"** in bottom navigation
2. Click **"Add Property"** button
3. Select **"Residential"** (house icon)
4. Enter:
   - Property Name: `My House`
   - Address: `123 Main Street, City, State`
5. Click **"Add Property"**
6. ✅ **Expected**: Property card appears with blue house icon
7. ✅ **Expected**: Shows "Residential" badge

### **Add Commercial Property**
1. Click **"Add Property"** again
2. Select **"Commercial"** (store icon)
3. Enter:
   - Property Name: `Downtown Shop`
   - Address: `456 Market Street, City, State`
4. Click **"Add Property"**
5. ✅ **Expected**: Property card appears with purple store icon
6. ✅ **Expected**: Shows "Commercial" badge

### **Edit Property**
1. Click on **"My House"** property card
2. Click the **Edit icon** (pencil) in top right
3. Change name to: `My Beautiful House`
4. Click **"Update Property"**
5. Click **"Back to Properties"**
6. ✅ **Expected**: Property name updated in the list

### **Delete Property** (Optional - Test Later)
- We'll test this after adding tenants to see cascade delete

---

## 👥 **Test 3: Tenant Management (15 minutes)**

### **Add Tenant to Residential Property**
1. Click **"Properties"**
2. Click on **"My Beautiful House"** card
3. ✅ **Expected**: See property details page
4. ✅ **Expected**: See "Tenants (0)" section
5. Click **"Add Tenant"** button
6. Fill in:
   - First Name: `John`
   - Last Name: `Doe`
   - Phone: `+91 9876543210`
   - Email: `john@example.com` (optional)
   - Monthly Rent: `15000`
   - Lease Start Date: Select today's date
   - Keep **"Active tenant"** checked ✅
7. Click **"Add Tenant"**
8. ✅ **Expected**: Tenant card appears
9. ✅ **Expected**: Shows "Active" green badge
10. ✅ **Expected**: Shows monthly rent ₹15,000
11. ✅ **Expected**: Shows current month rent status (should be auto-generated)

### **Add Another Tenant to Commercial Property**
1. Click **"Back to Properties"**
2. Click on **"Downtown Shop"** card
3. Click **"Add Tenant"**
4. Fill in:
   - First Name: `Jane`
   - Last Name: `Smith`
   - Phone: `+91 9876543211`
   - Monthly Rent: `25000`
   - Lease Start Date: Select today's date
   - Keep **"Active tenant"** checked ✅
5. Click **"Add Tenant"**
6. ✅ **Expected**: Tenant appears with rent status

### **Edit Tenant**
1. In the tenant card, click the **Edit icon** (pencil)
2. Change Monthly Rent to: `16000`
3. Click **"Update Tenant"**
4. ✅ **Expected**: Rent amount updated to ₹16,000

### **Check Auto-Generated Rent**
1. Look at the tenant card
2. ✅ **Expected**: See a colored box showing current month (e.g., "January 2026 Rent")
3. ✅ **Expected**: Status shows "Pending" with yellow/orange background
4. ✅ **Expected**: See "Mark Paid" button

---

## 💰 **Test 4: Payment Management (10 minutes)**

### **Mark Rent as Paid**
1. In the tenant card, find the rent status box
2. Click **"Mark Paid"** button
3. ✅ **Expected**: Payment modal opens
4. Fill in:
   - Payment Date: Select today
   - Payment Method: Select "UPI"
   - Notes: `Received via Google Pay` (optional)
5. Click **"Confirm Payment"**
6. ✅ **Expected**: Modal closes
7. ✅ **Expected**: Status changes to "Paid" with green background
8. ✅ **Expected**: Shows checkmark icon
9. ✅ **Expected**: Shows payment date
10. ✅ **Expected**: "Mark Paid" button changes to "Undo" button

### **Undo Payment**
1. Click **"Undo"** button
2. ✅ **Expected**: Status changes back to "Pending"
3. ✅ **Expected**: "Undo" button changes back to "Mark Paid"

### **Mark as Paid Again**
1. Click **"Mark Paid"** again
2. Confirm the payment
3. ✅ **Expected**: Status is "Paid"

---

## 📊 **Test 5: Dashboard (5 minutes)**

1. Click **"Dashboard"** in bottom navigation
2. ✅ **Expected**: See statistics cards:
   - Total Properties: **2**
   - Active Tenants: **2**
   - Expected Rent: **₹41,000** (15,000 + 16,000 + 25,000 - wait, should be 16,000 + 25,000 = 41,000)
   - Collected Rent: **₹16,000** (or whatever you marked as paid)
   - Pending Rent: Remaining amount
   - Collection Rate: Percentage

3. Test Month Selector:
   - Click **left arrow** to go to previous month
   - ✅ **Expected**: Stats update (should be 0 for past months)
   - Click **right arrow** to go to next month
   - ✅ **Expected**: Stats update
   - Click **"This Month"** to return to current month

---

## 📄 **Test 6: Reports (5 minutes)**

### **Generate PDF Report**
1. Click **"Reports"** in bottom navigation
2. ✅ **Expected**: See current month selected
3. ✅ **Expected**: See summary with total expected, collected, pending
4. ✅ **Expected**: See preview table with all rent records
5. Click **"Download PDF Report"**
6. ✅ **Expected**: PDF file downloads
7. Open the PDF file
8. ✅ **Expected**: See professional report with:
   - Title and month
   - Summary section
   - Table with all rent records
   - Property names, tenant names, amounts, status

### **Generate Excel Report**
1. Click **"Download Excel Report"**
2. ✅ **Expected**: Excel file downloads
3. Open the Excel file
4. ✅ **Expected**: See spreadsheet with all data
5. ✅ **Expected**: Columns: Property, Tenant, Amount, Status, Paid Date, Payment Method, Notes

### **Test Different Months**
1. Use month selector to go to next month
2. ✅ **Expected**: "No rent records for this month" message
3. Go back to current month
4. ✅ **Expected**: Records appear again

---

## 🔄 **Test 7: Menu - Generate Rent (5 minutes)**

### **Generate Rent for Next Month**
1. Click **"Menu"** in bottom navigation
2. Click **right arrow** to select next month (e.g., February 2026)
3. Click **"Generate Rent Payments for [Next Month]"**
4. ✅ **Expected**: Alert shows "Generated 2 new rent payment(s)"
5. ✅ **Expected**: See 2 pending payments in the list
6. ✅ **Expected**: Each payment shows correct tenant and amount

### **Try Generating Again (Idempotency Test)**
1. Click **"Generate Rent Payments"** again for the same month
2. ✅ **Expected**: Alert shows "Generated 0 new rent payment(s)"
3. ✅ **Expected**: No duplicate records created

### **Mark Payments from Menu**
1. Find a pending payment
2. Click **"Mark Paid"**
3. Confirm payment
4. ✅ **Expected**: Payment moves to "Paid Payments" section
5. ✅ **Expected**: Shows payment date and method

---

## 🗑️ **Test 8: Delete Operations (5 minutes)**

### **Delete Tenant**
1. Go to **Properties**
2. Click on a property
3. In a tenant card, click **Delete icon** (trash)
4. ✅ **Expected**: Confirmation dialog appears
5. Click **OK**
6. ✅ **Expected**: Tenant is removed
7. ✅ **Expected**: Associated rent payments are also deleted

### **Delete Property**
1. Click **"Back to Properties"**
2. Click on a property to view details
3. Click **Delete icon** in top right
4. ✅ **Expected**: Confirmation warning about deleting tenants and payments
5. Click **OK**
6. ✅ **Expected**: Property is deleted
7. ✅ **Expected**: All tenants and rent payments are also deleted
8. Go to Dashboard
9. ✅ **Expected**: Stats updated to reflect deletion

---

## 📱 **Test 9: PWA Installation (5 minutes)**

### **On Desktop (Chrome/Edge)**
1. Look for **install icon** in address bar (computer with down arrow)
2. Click the install icon
3. Click **"Install"**
4. ✅ **Expected**: App opens in its own window
5. ✅ **Expected**: No browser address bar
6. ✅ **Expected**: App icon in taskbar/dock
7. Close and reopen from Start Menu/Applications
8. ✅ **Expected**: App opens as standalone

### **On Mobile (Android)**
1. Open http://localhost:3000 in Chrome
2. Tap **menu** (⋮)
3. Tap **"Add to Home Screen"**
4. Tap **"Add"**
5. ✅ **Expected**: Icon appears on home screen
6. Tap the icon
7. ✅ **Expected**: Opens fullscreen like a native app

---

## 🔐 **Test 10: Data Isolation (10 minutes)**

### **Create Second Account**
1. Sign out from current account
2. Sign up with different email: `test2@example.com`
3. ✅ **Expected**: Empty dashboard (no properties)
4. Add a property and tenant
5. ✅ **Expected**: Only see your own data

### **Switch Back to First Account**
1. Sign out
2. Sign in with first account (`test@example.com`)
3. ✅ **Expected**: See your original properties and tenants
4. ✅ **Expected**: Don't see second account's data

---

## 🎯 **Test 11: Edge Cases (10 minutes)**

### **Inactive Tenant**
1. Add a new tenant
2. **Uncheck** "Active tenant"
3. Save
4. ✅ **Expected**: Tenant shows "Inactive" badge
5. Go to Menu and generate rent for current month
6. ✅ **Expected**: No rent payment generated for inactive tenant

### **Empty States**
1. Delete all properties
2. ✅ **Expected**: See "No properties yet" message with helpful text
3. Go to Reports
4. ✅ **Expected**: See "No rent records" message

### **Form Validation**
1. Try adding property with empty name
2. ✅ **Expected**: Browser validation prevents submission
3. Try adding tenant with rent = 0
4. ✅ **Expected**: Accepts (0 is valid)
5. Try adding tenant with negative rent
6. ✅ **Expected**: Browser validation prevents it

---

## ✅ **Final Checklist**

After all tests, verify:
- [ ] Can sign up and sign in
- [ ] Can add both residential and commercial properties
- [ ] Can click property to view details
- [ ] Can add tenants directly from property view
- [ ] Rent is auto-generated for new active tenants
- [ ] Can mark rent as paid/pending from property view
- [ ] Dashboard shows correct statistics
- [ ] Can generate rent for any month
- [ ] PDF and Excel reports download correctly
- [ ] Can delete tenants and properties
- [ ] Data is isolated between users
- [ ] PWA can be installed
- [ ] Bottom navigation has 4 items (no Tenants menu)
- [ ] All pages load without errors
- [ ] Mobile responsive design works

---

## 🐛 **Common Issues & Solutions**

### **Issue: Can't add property**
- Check browser console for errors
- Verify Supabase connection
- Check if tables exist in Supabase

### **Issue: Rent not auto-generating**
- Check if tenant is marked as "Active"
- Verify trigger is created in database
- Check browser console for errors

### **Issue: Reports not downloading**
- Check if there are rent records for selected month
- Check browser console for errors
- Verify jsPDF and xlsx libraries are installed

### **Issue: Can't sign in**
- Verify email authentication is enabled in Supabase
- Check if email confirmation is disabled (for testing)
- Check browser console for errors

---

## 📊 **Performance Checklist**

- [ ] Pages load in under 2 seconds
- [ ] No console errors
- [ ] Smooth animations and transitions
- [ ] Forms submit quickly
- [ ] Reports generate quickly
- [ ] Mobile performance is good

---

## 🎉 **Testing Complete!**

If all tests pass, your Rent Management PWA is **production-ready**! 🚀

**Next Steps:**
1. Deploy to production (see DEPLOYMENT.md)
2. Set up proper Google OAuth (see GOOGLE_OAUTH_SETUP.md)
3. Enable email confirmation in Supabase
4. Add custom domain
5. Start using for real rent management!

---

**Happy Testing! 🧪**
