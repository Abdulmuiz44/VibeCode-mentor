import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { upsertUserProfile } from '@/lib/supabase';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user) {
        // Store user profile in Supabase
        const success = await upsertUserProfile({
          user_id: user.id,
          email: user.email || '',
          name: user.name || null,
          profile_image: user.image || null,
        });

        if (!success) {
          console.warn('Failed to store user profile in Supabase');
          // Don't block sign-in if Supabase storage fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // Add user ID to session
        session.user.id = token.sub || '';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/', // Redirect to home page for sign-in
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
