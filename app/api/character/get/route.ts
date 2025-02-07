import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's character with their deck
    const character = await prisma.character.findFirst({
      where: { userId: user.id },
      include: {
        deck: true,
        equipment: true,
      },
    });

    if (!character) {
      return NextResponse.json({ character: null });
    }

    return NextResponse.json({ character });
  } catch (error) {
    console.error("Failed to get character:", error);
    return NextResponse.json(
      { error: "Failed to get character" },
      { status: 500 }
    );
  }
}
