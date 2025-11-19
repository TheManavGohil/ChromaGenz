import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if ((account?.provider === 'google' || account?.provider === 'github') && user.email) {
        try {
          await connectDB();
          
          // Check if user exists in our User model
          const existingUser = await User.findOne({ email: user.email.toLowerCase() });
          
          if (!existingUser) {
            // Generate a random password for OAuth users (they won't use it)
            const randomPassword = crypto.randomBytes(32).toString('hex');
            
            // Create username from name or email
            const username = user.name?.split(' ')[0]?.toLowerCase() || 
                           user.email?.split('@')[0]?.toLowerCase() || 
                           'user';
            
            // Ensure username is unique
            let finalUsername = username;
            let counter = 1;
            while (await User.findOne({ username: finalUsername })) {
              finalUsername = `${username}${counter}`;
              counter++;
            }
            
            // Create new user in our User model
            await User.create({
              username: finalUsername,
              email: user.email.toLowerCase(),
              password: randomPassword, // Random password for OAuth users
              role: 'user',
            });
          }
        } catch (error) {
          console.error('Error creating user:', error);
          // Allow sign in even if user creation fails
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && user.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email.toLowerCase() });
          if (dbUser) {
            token.id = (dbUser._id as any).toString();
            token.role = dbUser.role;
            token.username = dbUser.username;
            token.email = dbUser.email;
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as 'user' | 'admin') || 'user';
        session.user.username = (token.username as string) || session.user.email?.split('@')[0] || 'user';
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

