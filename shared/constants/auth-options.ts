import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from "@/prisma/prisma-client";
import { compare } from "bcrypt";
import { UserRole } from "@prisma/client";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name || profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                    role: 'USER' as UserRole,
                };
            },
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'user@test.ru' },
                password: { label: 'Пароль', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials) return null;

                const findUser = await prisma.user.findFirst({
                    where: {
                      email: credentials.email,
                    },
                  });
                
                  if (!findUser || !findUser.password) return null;
                
                  const isPasswordValid = await compare(
                    credentials.password,
                    findUser.password
                  );
                
                  if (!isPasswordValid) return null;
                  if (!findUser.verified) return null;

                return {
                    id: findUser.id,
                    email: findUser.email,
                    name: findUser.name,
                    role: findUser.role,
                };
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async signIn({ user, account }) {
            try {
                if (account?.provider === 'credentials') {
                  return true;
                }
        
                if (!user.email) {
                  return false;
                }
        
                const findUser = await prisma.user.findFirst({
                  where: {
                    OR: [
                      { provider: account?.provider, providerId: account?.providerAccountId },
                      { email: user.email },
                    ],
                  },
                });
        
                if (findUser) {
                  await prisma.user.update({
                    where: {
                      id: findUser.id,
                    },
                    data: {
                      provider: account?.provider,
                      providerId: account?.providerAccountId,
                    },
                  });
                  return true;
                }
        
                await prisma.user.create({
                  data: {
                    email: user.email,
                    name: user.name || 'User #' + user.id,
                    password: null,
                    verified: new Date(),
                    provider: account?.provider,
                    providerId: account?.providerAccountId,
                  },
                });
        
                return true;
            } catch (error) {
                console.error('Error [SIGNIN]', error);
                return false;
            }
        },
        async jwt({ token }) {

            if (!token.email){
                return token;
            }

            const findUser = await prisma.user.findFirst({
                where: {
                    email: token.email,
                },
            });

            if (findUser) {
                token.id = findUser.id;
                token.email = findUser.email;
                token.name = findUser.name;
                token.role = findUser.role;
            }
            return token;
        },
        session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }

            return session;
        },
    },
};