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

    const { characterId } = await request.json();

    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
        userId: user.id
      }
    });

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    // Heal 30% of max HP
    const healAmount = Math.floor(character.maxHealth * 0.3);
    const newHealth = Math.min(character.health + healAmount, character.maxHealth);

    const updatedCharacter = await prisma.character.update({
      where: { id: characterId },
      data: { health: newHealth }
    });

    return NextResponse.json({ character: updatedCharacter });
  } catch (error) {
    console.error('Failed to rest:', error);
    return NextResponse.json(
      { error: 'Failed to rest' },
      { status: 500 }
    );
  }
}