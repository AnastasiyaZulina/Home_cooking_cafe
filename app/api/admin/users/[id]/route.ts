import { prisma } from "@/prisma/prisma-client";
import { authOptions } from "@/shared/constants/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const session = await getServerSession(authOptions);
  
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  
    try {
      await prisma.user.delete({
        where: { id: Number(params.id) },
      });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: "User not found or could not be deleted" },
        { status: 500 }
      );
    }
  }
  
  export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  
    const {
      name,
      email,
      role,
      bonusBalance,
      phone,
      password,
      isVerified
    } = await request.json();
  
    try {
      const updateData: any = {
        name,
        email,
        role,
        bonusBalance,
        phone,
        // Обновляем verified на основе флага isVerified
        verified: isVerified ? new Date() : null
      };
  
      if (password) {
        updateData.password = password;
      }
  
      const updatedUser = await prisma.user.update({
        where: { id: Number(params.id) },
        data: updateData,
      });
  
      return NextResponse.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: "User update failed" },
        { status: 400 }
      );
    }
  }

  export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const session = await getServerSession(authOptions);
  
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
        include: {
          verificationCode: true
        }
      });
  
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      return NextResponse.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }
  }