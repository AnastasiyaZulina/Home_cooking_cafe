import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from "@/prisma/prisma-client";
import { compare, hashSync } from "bcrypt";
import { UserRole } from "@prisma/client";
import { error } from "console";
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

                const values = {
                    email: credentials.email,
                };

                const findUser = await prisma.user.findFirst({
                    where: values,
                });

                if (!findUser) return null;

                const isPasswordValid = await compare(credentials.password, findUser.password);

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
                console.log('user id=', user.id);
                console.log('signIn');
                const findUser = await prisma.user.findFirst({
                  where: {
                    OR: [
                      { provider: account?.provider, providerId: account?.providerAccountId },
                      { email: user.email },
                    ],
                  },
                });
                console.log('findUser',findUser);
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
        
                const createdUser = await prisma.user.create({
                  data: {
                    email: user.email,
                    name: user.name || 'User #' + user.id,
                    password: hashSync(user.id.toString(), 10), //TODO: продумать, лучше сделать так, чтобы пароль был не нужен
                    verified: new Date(),
                    provider: account?.provider,
                    providerId: account?.providerAccountId,
                  },
                });
                console.log('Created user:', createdUser);
                return true;
            } catch (error) {
                console.error('Error [SIGNIN]', error);
                return false;
            }
        },
        async jwt({ token, account }) {
            console.log('Entering jwt');
            if (!token.email){
                return token;
            }
/*
            if (account?.provider === 'google') {
              console.log('Entering account?.provider === google');
              const user = await prisma.user.findUnique({
                where: { providerId: account.providerAccountId }
              });
              if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
                console.log('Нашёлся! return token', token);
                console.log('return token.id', token.id);
              }
              console.log('Не нашелся... return token', token);
              console.log('return token.id', token.id);
              return token;
            }
              */
            console.log('Entering account?.provider not google account?.provider:', account?.provider);
            
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
            console.log('findUser:', findUser);
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