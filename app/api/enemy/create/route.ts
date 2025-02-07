import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ENEMY_TEMPLATES } from '@/lib/game/enemies';

export async function POST() {
  try {
    // Create all enemy templates in the database
    const enemies = await Promise.all(
      Object.values(ENEMY_TEMPLATES).map(template => 
        prisma.enemy.create({
          data: {
            name: template.name,
            health: template.health,
            maxHealth: template.maxHealth,
            level: template.level,
            experienceReward: template.experienceReward,
            goldRewardMin: template.goldReward.min,
            goldRewardMax: template.goldReward.max,
            moves: template.moves
          }
        })
      )
    );

    return NextResponse.json({ enemies });
  } catch (error) {
    console.error('Failed to create enemies:', error);
    return NextResponse.json(
      { error: 'Failed to create enemies' },
      { status: 500 }
    );
  }
}