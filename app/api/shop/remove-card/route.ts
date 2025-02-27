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

    const { characterId, cardId, cost } = await request.json();

    // Verify character ownership and check gold
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
        userId: user.id,
      },
      include: {
        deck: true,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    if (character.gold < cost) {
      return NextResponse.json(
        { error: 'Not enough gold' },
        { status: 400 }
      );
    }

    // Verify card ownership
    const card = character.deck.find((c) => c.id === cardId);
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Remove card and deduct gold
    const updatedCharacter = await prisma.$transaction(async (tx) => {
      await tx.card.delete({
        where: { id: cardId },
      });

      return tx.character.update({
        where: { id: characterId },
        data: {
          gold: { decrement: cost },
        },
        include: {
          deck: true,
          equipment: true,
          consumables: true,
        },
      });
    });

    return NextResponse.json({ character: updatedCharacter });
  } catch (error) {
    console.error('Failed to remove card:', error);
    return NextResponse.json(
      { error: 'Failed to remove card' },
      { status: 500 }
    );
  }
}