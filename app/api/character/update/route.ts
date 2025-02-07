import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { characterId, experience, gold, health } = await request.json();

    const character = await prisma.character.update({
      where: { 
        id: characterId,
        userId: user.id // Ensure the character belongs to the user
      },
      data: {
        experience: { increment: experience },
        gold: { increment: gold },
        health
      }
    });

    return NextResponse.json({ character });
  } catch (error) {
    console.error('Failed to update character:', error);
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}