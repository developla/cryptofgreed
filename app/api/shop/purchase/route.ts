import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { CardType, Rarity, EquipmentSlot } from '@prisma/client';

interface ShopCardItem {
  name: string;
  description: string;
  type: 'CARD';
  cardType: CardType;
  cost: number;
  rarity: Rarity;
  damage: number;
}

interface ShopEquipmentItem {
  name: string;
  description: string;
  type: 'EQUIPMENT';
  slot: EquipmentSlot;
  cost: number;
  rarity: Rarity;
  effects: Array<{ type: string; value: number }>;
}

type ShopItem = ShopCardItem | ShopEquipmentItem;

const SHOP_ITEMS: Record<string, ShopItem> = {
  '1': {
    name: 'Heavy Strike',
    description: 'Deal 12 damage',
    type: 'CARD',
    cardType: 'ATTACK',
    cost: 100,
    rarity: 'UNCOMMON',
    damage: 12,
  },
  '2': {
    name: 'Iron Helmet',
    description: '+5 Max HP',
    type: 'EQUIPMENT',
    slot: 'HEAD',
    cost: 150,
    rarity: 'COMMON',
    effects: [{ type: 'MAX_HP', value: 5 }],
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

    const { characterId, itemId } = await request.json();
    const item = SHOP_ITEMS[itemId];

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Start a transaction to handle the purchase
    const result = await prisma.$transaction(async (tx) => {
      // Get character with current state
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

      if (character.gold < item.cost) {
        throw new Error('Not enough gold');
      }

      // Update character gold and stats
      const updatedCharacter = await tx.character.update({
        where: { id: characterId },
        data: {
          gold: { decrement: item.cost },
          ...(item.type === 'EQUIPMENT' &&
            item.effects.some((e) => e.type === 'MAX_HP') && {
              maxHealth: {
                increment:
                  item.effects.find((e) => e.type === 'MAX_HP')?.value || 0,
              },
            }),
        },
        include: {
          deck: true,
          equipment: true,
        },
      });

      // Create the purchased item
      if (item.type === 'CARD') {
        await tx.card.create({
          data: {
            characterId,
            name: item.name,
            description: item.description,
            type: item.cardType,
            rarity: item.rarity,
            energy: 2,
            damage: item.damage,
            effects: [],
          },
        });
      } else {
        await tx.equipment.create({
          data: {
            characterId,
            name: item.name,
            description: item.description,
            slot: item.slot,
            rarity: item.rarity,
            effects: item.effects,
          },
        });
      }

      // Get final character state with updated relations
      return tx.character.findUnique({
        where: { id: characterId },
        include: {
          deck: true,
          equipment: true,
        },
      });
    });

    return NextResponse.json({ character: result });
  } catch (error) {
    console.error('Failed to purchase item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to purchase item' },
      { status: 500 }
    );
  }
}