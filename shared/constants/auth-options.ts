import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from "@/prisma/prisma-client";
import { compare, hashSync } from "bcrypt";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
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
        async jwt({ token}) {
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