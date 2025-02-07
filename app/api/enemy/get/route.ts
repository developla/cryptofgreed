import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scaleEnemy } from "@/lib/game/enemies";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = parseInt(searchParams.get("level") || "1");

    // Get a random enemy from the database
    const enemies = await prisma.enemy.findMany();
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];

    if (!randomEnemy) {
      return NextResponse.json({ error: "No enemies found" }, { status: 404 });
    }

    // Scale enemy based on level
    const scaledEnemy = scaleEnemy(randomEnemy, level);

    return NextResponse.json({ enemy: scaledEnemy });
  } catch (error) {
    console.error("Failed to get enemy:", error);
    return NextResponse.json({ error: "Failed to get enemy" }, { status: 500 });
  }
}
