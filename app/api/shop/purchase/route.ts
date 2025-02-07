import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

// Mock shop items (in a real app, these would be in the database)
const SHOP_ITEMS = {
  "1": {
    name: "Heavy Strike",
    description: "Deal 12 damage",
    type: "CARD",
    cardType: "ATTACK",
    cost: 100,
    rarity: "UNCOMMON",
    damage: 12
  },
  "2": {
    name: "Iron Helmet",
    description: "+5 Max HP",
    type: "EQUIPMENT",
    slot: "HEAD",
    cost: 150,
    rarity: "COMMON",
    effects: [{ type: "MAX_HP", value: 5 }]
  }
};

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { characterId, itemId, type } = await request.json();
    const item = SHOP_ITEMS[itemId as keyof typeof SHOP_ITEMS];
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

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

    if (character.gold < item.cost) {
      return NextResponse.json(
        { error: 'Not enough gold' },
        { status: 400 }
      );
    }

    // Start a transaction to handle the purchase
    const result = await prisma.$transaction(async (tx) => {
      // Deduct gold
      const updatedCharacter = await tx.character.update({
        where: { id: characterId },
        data: { gold: { decrement: item.cost } }
      });

      if (type === 'CARD') {
        // Add card to character's deck
        await tx.card.create({
          data: {
            characterId,
            name: item.name,
            description: item.description,
            type: item.cardType,
            rarity: item.rarity,
            energy: 2,
            damage: item.damage,
            effects: []
          }
        });
      } else if (type === 'EQUIPMENT') {
        // Add equipment to character
        await tx.equipment.create({
          data: {
            characterId,
            name: item.name,
            description: item.description,
            slot: item.slot,
            rarity: item.rarity,
            effects: item.effects
          }
        });
      }

      return updatedCharacter;
    });

    return NextResponse.json({ character: result });
  } catch (error) {
    console.error('Failed to purchase item:', error);
    return NextResponse.json(
      { error: 'Failed to purchase item' },
      { status: 500 }
    );
  }
}