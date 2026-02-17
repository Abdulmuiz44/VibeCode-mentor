import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

import { upsertUserProfile } from '@/lib/supabase.server';
import { initializeAdminUser } from '@/lib/admin/adminManager';


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET || '',
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (user) {
        try {
          // Handle OAuth (Google, GitHub) and credentials-based authentication
          if (account?.provider === 'google' || account?.provider === 'github') {
            // Run DB operations with a timeout to prevent Vercel 504 errors
            // If DB is slow, we still want to log the user in
            const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 4000)); // 4s timeout (Vercel limit is 10s)

            const dbOperations = Promise.all([
              upsertUserProfile({
                user_id: user.id,
                email: user.email || '',
                name: user.name || null,
                profile_image: user.image || null,
              }),
              initializeAdminUser(user.email || '', user.id, user.name || null)
            ]);

            // Race against timeout
            await Promise.race([dbOperations, timeoutPromise]);
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          // Don't block sign in on error
          return true;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
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
    signIn: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};
