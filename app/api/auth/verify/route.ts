import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const code = req.nextUrl.searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(new URL('/?verified=error', req.url));
        }

        const verificationCode = await prisma.verificationCode.findFirst({
            where: {
                code,
            },
        });

        if (!verificationCode) {
            return NextResponse.redirect(new URL('/?verified=error', req.url));
        }

        await prisma.user.update({
            where: {
                id: verificationCode.userId,
            },
            data: {
                verified: new Date(),
            },
        });

        await prisma.verificationCode.delete({
            where: {
                id: verificationCode.id,
            },
        });

        return NextResponse.redirect(new URL('/?verified=success', req.url));
    }
    catch (error) {
        console.log('Error [VERIFY_GET]', error);
        throw error;
    }
}