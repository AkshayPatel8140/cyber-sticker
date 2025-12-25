import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from '@/lib/supabase';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // When user signs in for the first time (or re-authenticates),
      // ensure we have a corresponding user profile row in Supabase.
      if (account && token.sub) {
        try {
          const userId = token.sub;
          const email =
            (token.email as string | undefined) ??
            (profile && typeof profile.email === 'string'
              ? profile.email
              : null);
          const name =
            (token.name as string | undefined) ??
            (profile && typeof profile.name === 'string'
              ? profile.name
              : null);
          const image =
            (token.picture as string | undefined) ??
            (profile && typeof profile === 'object' && profile !== null && 'picture' in profile && typeof profile.picture === 'string'
              ? profile.picture
              : null);

          // Upsert into user_profiles based on user_id
          const { error } = await supabase
            .from('user_profiles')
            .upsert(
              {
                user_id: userId,
                email,
                display_name: name,
                avatar_url: image,
              },
              { onConflict: 'user_id' }
            );

          if (error) {
            console.error('Error upserting user profile during auth:', error);
          }

          // Optional: attach access token for other uses
          token.accessToken = account.access_token;
        } catch (err) {
          console.error('Unexpected error during auth profile sync:', err);
        }
      }

      return token;
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
});
