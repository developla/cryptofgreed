import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const EXPERIENCE_PER_LEVEL = 100;

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication' },
        { status: 401 }
      );
    }

    const { characterId, experience, gold, health } = await request.json();

    // Get current character data with transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      const currentCharacter = await tx.character.findFirst({
        where: {
          id: characterId,
          userId: user.id,
        },
      });

      if (!currentCharacter) {
        throw new Error('Character not found');
      }

      // Calculate new level and experience
      const totalExperience = currentCharacter.experience + (experience || 0);
      const newLevel = Math.floor(totalExperience / EXPERIENCE_PER_LEVEL) + 1;
      const leveledUp = newLevel > currentCharacter.level;

      // Calculate stat increases if leveled up
      const healthIncrease = leveledUp
        ? Math.floor(currentCharacter.maxHealth * 0.1)
        : 0;
      const energyIncrease = leveledUp ? 1 : 0;

      // Update character with new stats
      const updatedCharacter = await tx.character.update({
        where: { id: characterId },
        data: {
          experience: totalExperience,
          level: newLevel,
          gold: gold ? { increment: gold } : undefined,
          health: health !== undefined ? health : undefined,
          maxHealth: leveledUp ? { increment: healthIncrease } : undefined,
          maxEnergy: leveledUp ? { increment: energyIncrease } : undefined,
        },
        include: {
          deck: true,
          equipment: true,
        },
      });

      // Clear any active battles for this character
      if (health !== undefined) {
        await tx.battle.updateMany({
          where: {
            characterId,
            active: true,
          },
          data: {
            active: false,
          },
        });
      }

      return {
        character: updatedCharacter,
        leveledUp,
        healthIncrease,
        energyIncrease,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update character:', error);
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}