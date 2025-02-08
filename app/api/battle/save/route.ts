import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      characterId,
      battleState,
      enemyId,
      turnNumber,
      playerDeck,
      playerHand,
      playerDiscardPile,
    } = await request.json();

    // Save or update battle state
    const battle = await prisma.battle.upsert({
      where: {
        characterId_active: {
          characterId,
          active: true,
        },
      },
      update: {
        battleState,
        enemyId,
        turnNumber,
        playerDeck,
        playerHand,
        playerDiscardPile,
        updatedAt: new Date(),
      },
      create: {
        characterId,
        battleState,
        enemyId,
        turnNumber,
        playerDeck,
        playerHand,
        playerDiscardPile,
        active: true,
      },
    });

    return NextResponse.json({ battle });
  } catch (error) {
    console.error('Failed to save battle:', error);
    return NextResponse.json(
      { error: 'Failed to save battle' },
      { status: 500 }
    );
  }
}
