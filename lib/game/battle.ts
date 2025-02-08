import { Effect } from '@prisma/client';

export interface BattleState {
  playerHealth: number;
  playerBlock: number;
  playerEnergy: number;
  playerEffects: StatusEffect[];
  enemyHealth: number;
  enemyBlock: number;
  enemyEffects: StatusEffect[];
}

export interface StatusEffect {
  type: string;
  value: number;
  duration: number;
}

export function calculateDamage(
  baseDamage: number,
  attackerEffects: StatusEffect[],
  defenderEffects: StatusEffect[],
  defenderBlock: number
): { damage: number; remainingBlock: number } {
  let multiplier = 1;

  // Apply attacker effects
  const strength = attackerEffects.find((e) => e.type === 'STRENGTH');
  if (strength) {
    multiplier += strength.value * 0.1;
  }

  // Apply defender effects
  const weak = defenderEffects.find((e) => e.type === 'WEAK');
  if (weak) {
    multiplier *= 0.75;
  }

  let finalDamage = Math.floor(baseDamage * multiplier);

  // Apply block
  if (defenderBlock > 0) {
    if (defenderBlock >= finalDamage) {
      return { damage: 0, remainingBlock: defenderBlock - finalDamage };
    } else {
      finalDamage -= defenderBlock;
      return { damage: finalDamage, remainingBlock: 0 };
    }
  }

  return { damage: finalDamage, remainingBlock: 0 };
}

export function applyCardEffects(
  effects: Effect[],
  battleState: BattleState,
  isPlayer: boolean
): BattleState {
  const newState = { ...battleState };

  effects.forEach((effect) => {
    switch (effect.type) {
      case 'BLOCK':
        if (isPlayer) {
          newState.playerBlock += effect.value;
        } else {
          newState.enemyBlock += effect.value;
        }
        break;
      case 'STRENGTH':
      case 'DEXTERITY':
      case 'WEAK':
      case 'VULNERABLE':
        const target = isPlayer
          ? newState.playerEffects
          : newState.enemyEffects;

        target.push({
          type: effect.type,
          value: effect.value,
          duration: effect.duration || 1,
        });
        break;
    }
  });

  return newState;
}
