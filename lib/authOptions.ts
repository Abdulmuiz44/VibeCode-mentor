import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';

import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAdmin, upsertUserProfile } from '@/lib/supabase.server';

export const authOptions: NextAuthOptions = {
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

        // Use Supabase Auth to verify credentials
        // Use the anon key client since we are acting as the user
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

        // Return user object compatible with NextAuth
        // NOTE: The 'signIn' callback will handle syncing this user to public.users table as implemented previously
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
        // Handle both Google OAuth and credentials-based authentication
        if (account?.provider === 'google') {
          await upsertUserProfile({
            user_id: user.id,
            email: user.email || '',
            name: user.name || null,
            profile_image: user.image || null,
          });
        } else if (account?.provider === 'credentials') {
          // Sync credentials-based users to Supabase
          try {
            await upsertUserProfile({
              user_id: user.id,
              email: user.email || '',
              name: user.name || null,
              profile_image: user.image || null,
            });
          } catch (error) {
            console.error('Error syncing credentials user to Supabase:', error);
            // Still allow sign-in to proceed even if Supabase sync fails
          }
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
