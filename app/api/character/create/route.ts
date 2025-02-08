import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CharacterClass, CardType, Rarity } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const STARTER_DECKS = {
  [CharacterClass.WARRIOR]: [
    {
      name: 'Strike',
      description: 'Deal 6 damage.',
      type: CardType.ATTACK,
      rarity: Rarity.COMMON,
      energy: 1,
      damage: 6,
      count: 4,
    },
    {
      name: 'Defend',
      description: 'Gain 5 Block.',
      type: CardType.SKILL,
      rarity: Rarity.COMMON,
      energy: 1,
      block: 5,
      count: 4,
    },
    {
      name: 'Heavy Blow',
      description: 'Deal 8 damage. Apply 1 Vulnerable.',
      type: CardType.ATTACK,
      rarity: Rarity.COMMON,
      energy: 2,
      damage: 8,
      effects: [{ type: 'VULNERABLE', value: 1, duration: 2 }],
      count: 2,
    },
  ],
  [CharacterClass.MAGE]: [
    {
      name: 'Magic Missile',
      description: 'Deal 4 damage twice.',
      type: CardType.ATTACK,
      rarity: Rarity.COMMON,
      energy: 1,
      damage: 4,
      effects: [{ type: 'MULTI_HIT', value: 2 }],
      count: 4,
    },
    {
      name: 'Arcane Barrier',
      description: 'Gain 4 Block. Draw a card.',
      type: CardType.SKILL,
      rarity: Rarity.COMMON,
      energy: 1,
      block: 4,
      effects: [{ type: 'DRAW', value: 1 }],
      count: 4,
    },
    {
      name: 'Fireball',
      description: 'Deal 10 damage to all enemies. Apply 1 Burn.',
      type: CardType.ATTACK,
      rarity: Rarity.COMMON,
      energy: 2,
      damage: 10,
      effects: [
        { type: 'AOE', value: 1 },
        { type: 'BURN', value: 1, duration: 2 },
      ],
      count: 2,
    },
  ],
  [CharacterClass.ROGUE]: [
    {
      name: 'Quick Slash',
      description: 'Deal 5 damage. Draw a card.',
      type: CardType.ATTACK,
      rarity: Rarity.COMMON,
      energy: 1,
      damage: 5,
      effects: [{ type: 'DRAW', value: 1 }],
      count: 4,
    },
    {
      name: 'Dodge',
      description: 'Gain 3 Block. Gain 1 Dexterity.',
      type: CardType.SKILL,
      rarity: Rarity.COMMON,
      energy: 1,
      block: 3,
      effects: [{ type: 'DEXTERITY', value: 1, duration: 1 }],
      count: 4,
    },
    {
      name: 'Backstab',
      description: 'Deal 12 damage if the enemy has no Block.',
      type: CardType.ATTACK,
      rarity: Rarity.COMMON,
      energy: 2,
      damage: 12,
      effects: [{ type: 'CONDITIONAL_DAMAGE', value: 1 }],
      count: 2,
    },
  ],
};

export async function POST(request: Request) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication' },
        { status: 401 }
      );
    }

    const character = await request.json();
    const { name, class: characterClass } = character;

    // Validate input
    if (!name || !characterClass) {
      return NextResponse.json(
        { error: 'Name and class are required' },
        { status: 400 }
      );
    }

    // Create character with a transaction to ensure all related data is created
    const newCharacter = await prisma.$transaction(async (tx) => {
      // Create the character
      const char = await tx.character.create({
        data: {
          userId: user.id,
          name,
          class: characterClass as CharacterClass,
          level: 1,
          experience: 0,
          health: character.health,
          maxHealth: character.maxHealth,
          energy: character.energy,
          maxEnergy: character.maxEnergy,
          gold: character.gold,
        },
      });

      // Create starter deck
      const starterDeck = STARTER_DECKS[characterClass as CharacterClass];
      const cardPromises = starterDeck.flatMap((cardTemplate) => {
        const cards = Array(cardTemplate.count)
          .fill(null)
          .map(() => ({
            characterId: char.id,
            name: cardTemplate.name,
            description: cardTemplate.description,
            type: cardTemplate.type,
            rarity: cardTemplate.rarity,
            energy: cardTemplate.energy,
            damage: cardTemplate.damage,
            block: cardTemplate.block,
            effects: cardTemplate.effects || [],
          }));
        return tx.card.createMany({ data: cards });
      });

      await Promise.all(cardPromises);

      // Return character with deck included
      return tx.character.findUnique({
        where: { id: char.id },
        include: { deck: true },
      });
    });

    return NextResponse.json({ character: newCharacter });
  } catch (error) {
    console.error('Failed to create character:', error);
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    );
  }
}