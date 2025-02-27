import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { CardType, Rarity } from '@prisma/client';

const UPGRADE_RULES = {
  damage: (current: number) => Math.floor(current * 1.5),
  block: (current: number) => Math.floor(current * 1.5),
  effects: (effects: any[]) =>
    effects.map((effect) => ({
      ...effect,
      value: Math.floor(effect.value * 1.3),
    })),
  rarity: (current: Rarity): Rarity => {
    switch (current) {
      case 'COMMON':
        return 'UNCOMMON';
      case 'UNCOMMON':
        return 'RARE';
      case 'RARE':
        return 'EPIC';
      case 'EPIC':
        return 'LEGENDARY';
      default:
        return current;
    }
  },
};

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

    // Find and upgrade the card
    const card = character.deck.find((c) => c.id === cardId);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Apply upgrades
    const upgradedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        rarity: UPGRADE_RULES.rarity(card.rarity),
        damage: card.damage ? UPGRADE_RULES.damage(card.damage) : undefined,
        block: card.block ? UPGRADE_RULES.block(card.block) : undefined,
        effects: card.effects ? UPGRADE_RULES.effects(card.effects) : undefined,
      },
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
    console.error('Failed to upgrade card:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade card' },
      { status: 500 }
    );
  }
}