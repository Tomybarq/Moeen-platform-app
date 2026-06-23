import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, signSession, setSessionCookie } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, imageBase64 } = body;

    const updateData: { name?: string; email?: string; image?: string } = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      const emailTrimmed = email.trim().toLowerCase();
      if (!emailTrimmed) {
        return NextResponse.json({ error: "Email cannot be empty" }, { status: 400 });
      }
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: emailTrimmed,
          NOT: { id: session.userId },
        },
      });
      if (existingUser) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
      }
      updateData.email = emailTrimmed;
    }

    if (imageBase64) {
      try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        // Define directory to write to
        const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
        await fs.mkdir(uploadDir, { recursive: true });
        
        const fileName = `${session.userId}-${Date.now()}.jpg`;
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);
        
        // Store relative public path
        updateData.image = `/uploads/avatars/${fileName}`;
      } catch (uploadError) {
        console.error("Avatar save error:", uploadError);
        return NextResponse.json({ error: "Failed to save avatar image" }, { status: 500 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    });

    // Update the session cookie with new values
    const newSessionPayload = {
      ...session,
      ...(updateData.name !== undefined ? { name: updateData.name } : {}),
      ...(updateData.email !== undefined ? { email: updateData.email } : {}),
      ...(updateData.image !== undefined ? { image: updateData.image } : {}),
    };
    const newToken = await signSession(newSessionPayload);
    await setSessionCookie(newToken);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("PUT /api/users/profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
