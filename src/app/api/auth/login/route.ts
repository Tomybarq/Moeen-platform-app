import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signSession, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/zodSchemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, language, darkMode } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // Update user preferences in DB
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        language: language || user.language,
        darkMode: typeof darkMode === "boolean" ? darkMode : user.darkMode,
      },
      include: { role: true },
    });

    // Sign JWT
    const token = await signSession({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role.name,
      roleType: updatedUser.role.type,
      language: updatedUser.language,
      darkMode: updatedUser.darkMode,
      image: updatedUser.image,
    });

    // Set cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: updatedUser.id, name: updatedUser.name, role: updatedUser.role.name },
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ ما في الخادم" },
      { status: 500 }
    );
  }
}
