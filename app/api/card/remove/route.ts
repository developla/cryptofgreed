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

    const { characterId, cardId } = await request.json();

    // Verify character ownership
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

    // Verify card ownership and remove it
    const card = character.deck.find((c) => c.id === cardId);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Remove the card
    await prisma.card.delete({
      where: { id: cardId },
    });

    // Get updated character
    const updatedCharacter = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        deck: true,
        equipment: true,
      },
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