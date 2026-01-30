import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
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
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Supabase credentials missing');
          return null;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          console.error('Supabase Auth verification failed:', error?.message);
          return null;
        }

        const user = data.user;

        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          image: user.user_metadata?.avatar_url || null,
        };
      }
    }),
    ...(process.env.EMAIL_SERVER && process.env.EMAIL_FROM
      ? [
        EmailProvider({
          server: process.env.EMAIL_SERVER,
          from: process.env.EMAIL_FROM,
        }),
      ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (user) {
        try {
          // Handle OAuth (Google, GitHub) and credentials-based authentication
          if (account?.provider === 'google' || account?.provider === 'github' || account?.provider === 'credentials') {
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
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};
