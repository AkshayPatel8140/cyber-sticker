# User Subscriptions Setup

## Overview

The subscription system has been migrated from localStorage to Supabase database for proper persistence and security.

## Step 1: Create the Database Table

Run the SQL script in your Supabase SQL editor:

```bash
create_user_subscriptions_table.sql
```

This will create:
- `user_subscriptions` table with columns:
  - `id` - Primary key
  - `user_id` - NextAuth user ID (unique)
  - `plan` - Subscription plan ('free', 'pro', 'studio')
  - `created_at` - Timestamp
  - `updated_at` - Auto-updated timestamp
  - `stripe_customer_id` - For future Stripe integration
  - `stripe_subscription_id` - For future Stripe integration
  - `subscription_status` - Status of subscription

## Step 2: How It Works

### Current Implementation
- Uses Supabase with public access (RLS policies allow public read/write)
- User ID comes from NextAuth (Google OAuth `sub` field)
- Subscription data is stored in Supabase instead of localStorage

### Data Flow
1. User signs in with Google (NextAuth)
2. `useSubscription` hook fetches subscription from Supabase
3. If no record exists, creates one with 'free' plan
4. Updates are saved to Supabase

## Step 3: Security Considerations

### Current Setup (Development)
- Public access is allowed for simplicity
- Validation happens in application code
- User ID is validated from NextAuth session

### Production Recommendations

**Option 1: API Routes with Service Role Key (Recommended)**
1. Create API routes (`/api/subscription`) that use Supabase service role key
2. Validate NextAuth session in API routes
3. Update `subscription.ts` to call API routes instead of direct Supabase calls
4. Update RLS policies to be more restrictive

**Option 2: Supabase Auth Integration**
1. Migrate from NextAuth to Supabase Auth
2. Use Supabase Auth RLS policies
3. More secure but requires auth migration

**Option 3: Keep Current (Less Secure)**
- Works for MVP/demo
- Not recommended for production with sensitive data
- User can potentially modify their own subscription if they know the API

## Step 4: Testing

1. Sign in with Google
2. Check Supabase dashboard - should see a new row in `user_subscriptions` table
3. Verify subscription plan is 'free' by default
4. Test updating plan (should work in UI)

## Step 5: Future Enhancements

### Stripe Integration
When ready to integrate Stripe:
1. Store `stripe_customer_id` when customer is created
2. Store `stripe_subscription_id` when subscription is created
3. Update `subscription_status` based on Stripe webhooks
4. Sync plan changes from Stripe webhooks

### Webhook Handler
Create API route to handle Stripe webhooks:
- `subscription.created` - Set plan to 'pro'/'studio'
- `subscription.updated` - Update plan
- `subscription.deleted` - Set plan to 'free'
- `invoice.payment_failed` - Set status to 'past_due'

## Database Schema

```sql
user_subscriptions
├── id (bigint, primary key)
├── user_id (text, unique, indexed)
├── plan (text: 'free'|'pro'|'studio')
├── created_at (timestamp)
├── updated_at (timestamp, auto-updated)
├── stripe_customer_id (text, nullable)
├── stripe_subscription_id (text, nullable)
└── subscription_status (text: 'active'|'canceled'|'past_due'|'trialing')
```

## Migration Notes

- Old localStorage data will be ignored
- New users automatically get 'free' plan
- Existing users will get 'free' plan on first load (can be migrated manually if needed)

