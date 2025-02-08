import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication' },
        { status: 401 }
      );
    }

    const { characterId } = await request.json();

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      const character = await tx.character.findFirst({
        where: {
          id: characterId,
          userId: user.id,
        },
        include: {
          deck: true,
          equipment: true,
        },
      });

      if (!character) {
        throw new Error('Character not found');
      }

      // Heal 30% of max HP
      const healAmount = Math.floor(character.maxHealth * 0.3);
      const newHealth = Math.min(
        character.health + healAmount,
        character.maxHealth
      );

      // Update character with new health
      const updatedCharacter = await tx.character.update({
        where: { id: characterId },
        data: { health: newHealth },
        include: {
          deck: true,
          equipment: true,
        },
      });

      return {
        character: updatedCharacter,
        healAmount,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to rest:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to rest' },
      { status: 500 }
    );
  }
}
