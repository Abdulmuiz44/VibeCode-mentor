import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Store user data in Firestore when they sign in
      if (db && user.id && user.email) {
        try {
          const userRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userRef);
          
          // Only update if user doesn't exist or needs update
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: user.email,
              name: user.name || '',
              image: user.image || '',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }, { merge: true });
          } else {
            // Update last login
            await setDoc(userRef, {
              updatedAt: Date.now(),
            }, { merge: true });
          }
        } catch (error) {
          console.error('Error saving user to Firestore:', error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user id to session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Store user id in token on first sign in
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
