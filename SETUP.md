# Neuron-Net Setup Guide

## Supabase Setup Instructions

You've already created a Supabase project. Follow these steps to complete the setup:

### 1. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your "Neuron-Net" project (or whatever you named it)
3. Click on **Settings** (gear icon in the left sidebar)
4. Go to **API** section
5. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`

### 2. Create Your Environment File

1. In your project root directory (`c:\Users\SOHAM\monad hacks v2\Neuron-Net`), create a new file called `.env`
2. Copy the contents from `.env.example` to `.env`
3. Replace the placeholder values with your actual credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Enable Email Authentication

1. In your Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Email** in the list
3. Make sure it's **enabled** (toggle should be ON)
4. Email authentication should be enabled by default, but verify this

### 4. Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates if desired:
   - **Confirm signup**: Sent when a user signs up
   - **Magic Link**: For passwordless login (if you want to add this later)
   - **Change Email Address**: When users change their email
   - **Reset Password**: For password resets

### 5. Configure URL Settings

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - For development: `http://localhost:5173`
   - For production: Your deployed URL (e.g., `https://neuron-net.com`)
3. Add redirect URLs (same as site URL for now)

### 6. User Metadata Storage

Your app automatically stores user metadata during signup:
- `full_name`: User's full name
- `user_type`: Either `'user'` or `'seller'`
- `company`: Only for sellers

This metadata is automatically managed by `user_metadata` in Supabase Auth. **No additional database tables are needed** to get started!

### 7. Optional: Database Tables for Extended Features

If you want to store additional data (like compute resources, jobs, billing info), you can create tables:

1. Go to **Database** → **Tables** → **New Table**
2. Example tables you might create later:

#### Compute Resources Table (for sellers)
```sql
CREATE TABLE compute_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'GPU', 'CPU', etc.
  specs JSONB, -- Store specifications
  price_per_hour DECIMAL(10, 2),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Jobs Table (for users)
```sql
CREATE TABLE compute_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES compute_resources(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_cost DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

But for now, **you don't need these tables** - the authentication system will work with just user_metadata!

### 8. Restart Your Development Server

After creating the `.env` file:

1. Stop your current development server (Ctrl+C in the terminal)
2. Restart it:
```bash
npm run dev
```

The environment variables will now be loaded.

## Testing Your Setup

### Test User Signup:
1. Go to `http://localhost:5173`
2. Click "Sign Up as User"
3. Fill in the form with:
   - Full Name: Test User
   - Email: testuser@example.com
   - Password: TestPass123!
4. Click Sign Up
5. Check your Supabase Dashboard → **Authentication** → **Users** to see the new user

### Test Seller Signup:
1. Go to `http://localhost:5173`
2. Click "Sign Up as Seller"
3. Fill in the form with:
   - Full Name: Test Seller
   - Company: Test Company
   - Email: testseller@example.com
   - Password: TestPass123!
4. Click Sign Up
5. The user should appear in your Supabase users list

### Test Login:
1. After signup, you'll be redirected to the login page
2. Enter your email and password
3. You should be redirected to the respective dashboard

## Email Confirmation

By default, Supabase requires email confirmation:
- Users will receive a confirmation email after signing up
- They must click the link in the email to verify their account
- Only then can they log in

### To Disable Email Confirmation (Development Only):
1. Go to **Authentication** → **Providers** → **Email**
2. Turn OFF "Confirm email"
3. Users can now log in immediately after signup without confirmation

**Note**: For production, you should keep email confirmation enabled for security.

## Troubleshooting

### "Invalid login credentials" error:
- If email confirmation is enabled, check that the user has confirmed their email
- Check Supabase Dashboard → Authentication → Users to see the user's `email_confirmed_at` field

### Environment variables not working:
- Make sure the `.env` file is in the project root
- Variable names must start with `VITE_` to work with Vite
- Restart the dev server after creating/modifying `.env`

### CORS errors:
- Add `http://localhost:5173` to your Supabase URL Configuration
- This should be automatically handled, but check if issues persist

## Next Steps

1. **Create `.env` file** with your Supabase credentials (Step 2)
2. **Restart your dev server** (Step 8)
3. **Test signup and login** flows
4. **Add database tables** when you're ready to store compute resources and jobs (Step 7)

Your authentication system is now fully functional! 🚀
