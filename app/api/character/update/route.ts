import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

const EXPERIENCE_PER_LEVEL = 100;

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { characterId, experience, gold, health } = await request.json();

    // Get current character data
    const currentCharacter = await prisma.character.findFirst({
      where: {
        id: characterId,
        userId: user.id,
      },
    });

    if (!currentCharacter) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    // Calculate new level and experience
    const totalExperience = currentCharacter.experience + experience;
    const newLevel = Math.floor(totalExperience / EXPERIENCE_PER_LEVEL) + 1;
    const leveledUp = newLevel > currentCharacter.level;

    // Calculate stat increases if leveled up
    const healthIncrease = leveledUp
      ? Math.floor(currentCharacter.maxHealth * 0.1)
      : 0;
    const energyIncrease = leveledUp ? 1 : 0;

    // Update character with new stats
    const character = await prisma.character.update({
      where: {
        id: characterId,
        userId: user.id,
      },
      data: {
        experience: totalExperience,
        level: newLevel,
        gold: { increment: gold },
        health,
        maxHealth: leveledUp ? { increment: healthIncrease } : undefined,
        maxEnergy: leveledUp ? { increment: energyIncrease } : undefined,
      },
    });

    return NextResponse.json({
      character,
      leveledUp,
      healthIncrease,
      energyIncrease,
    });
  } catch (error) {
    console.error('Failed to update character:', error);
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}
