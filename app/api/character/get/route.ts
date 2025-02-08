import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication' },
        { status: 401 }
      );
    }

    // Get all characters for the user
    const characters = await prisma.character.findMany({
      where: { userId: user.id },
      include: {
        deck: true,
        equipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Failed to get characters:', error);
    return NextResponse.json(
      { error: 'Failed to get characters' },
      { status: 500 }
    );
  }
}
