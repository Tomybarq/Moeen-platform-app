import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        language: true,
        darkMode: true,
        image: true,
        role: {
          select: {
            name: true,
            type: true,
            permissions: {
              select: {
                actions: true,
                screen: {
                  select: {
                    path: true,
                  },
                },
              },
            },
          },
        },
        permissions: {
          select: {
            actions: true,
            screen: {
              select: {
                path: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rolePaths = user.role.permissions.map((p) => p.screen.path);
    const directPaths = user.permissions.map((p) => p.screen.path);
    const allowedScreens = Array.from(new Set([...rolePaths, ...directPaths]));

    const permissions: Record<string, string[]> = {};
    user.role.permissions.forEach((p) => {
      permissions[p.screen.path] = [...(p.actions || [])];
    });

    user.permissions.forEach((p) => {
      const path = p.screen.path;
      const existing = permissions[path] || [];
      permissions[path] = Array.from(new Set([...existing, ...(p.actions || [])]));
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        roleType: user.role.type,
        language: user.language,
        darkMode: user.darkMode,
        image: user.image,
        allowedScreens,
        permissions,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
