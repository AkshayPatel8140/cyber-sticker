# Authentication Setup Guide

This project uses NextAuth.js for Google OAuth authentication.

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
AUTH_URL=http://localhost:3000
AUTH_SECRET=your_random_secret_here
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Features

- ✅ Google-only sign-in
- ✅ Profile icon in navbar (when authenticated)
- ✅ Profile dropdown menu with user info
- ✅ Sign out functionality
- ✅ Protected routes (can be extended)

### 4. Usage

- Visit `/signin` to sign in with Google
- After signing in, you'll see your profile icon in the navbar
- Click the profile icon to see your account info and sign out option
