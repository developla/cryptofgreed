import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { CardType, Rarity } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication' },
        { status: 401 }
      );
    }

    const { characterId, rewards } = await request.json();

    // Verify character ownership
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
        userId: user.id,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    // Start a transaction to handle all rewards
    const updatedCharacter = await prisma.$transaction(async (tx) => {
      // Update gold and experience
      const char = await tx.character.update({
        where: { id: characterId },
        data: {
          gold: { increment: rewards.gold },
          experience: { increment: rewards.experience },
        },
      });

      // Add selected card if any
      if (rewards.card) {
        await tx.card.create({
          data: {
            characterId,
            name: rewards.card.name,
            description: rewards.card.description,
            type: rewards.card.type as CardType,
            rarity: rewards.card.rarity as Rarity,
            energy: rewards.card.energy,
            damage: rewards.card.damage,
            block: rewards.card.block,
            effects: rewards.card.effects || [],
          },
        });
      }

      // Add selected consumables
      if (rewards.consumables?.length > 0) {
        for (const consumable of rewards.consumables) {
          // Check if consumable already exists
          const existing = await tx.consumable.findFirst({
            where: {
              characterId,
              name: consumable.name,
              type: consumable.type,
            },
          });

          if (existing) {
            // Update quantity
            await tx.consumable.update({
              where: { id: existing.id },
              data: {
                quantity: { increment: consumable.quantity },
              },
            });
          } else {
            // Create new consumable
            await tx.consumable.create({
              data: {
                characterId,
                name: consumable.name,
                description: consumable.description,
                type: consumable.type,
                value: consumable.value,
                duration: consumable.duration,
                quantity: consumable.quantity,
              },
            });
          }
        }
      }

      // Return updated character with all relations
      return tx.character.findUnique({
        where: { id: characterId },
        include: {
          deck: true,
          equipment: true,
          consumables: true,
        },
      });
    });

    return NextResponse.json({ character: updatedCharacter });
  } catch (error) {
    console.error('Failed to collect rewards:', error);
    return NextResponse.json(
      { error: 'Failed to collect rewards' },
      { status: 500 }
    );
  }
}