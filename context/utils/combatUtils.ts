
import { Card, Character, Enemy } from '../types';

// Function to deal damage
export const dealDamage = (target: Character | Enemy, damage: number): number => {
  if (damage < 0) {
    return 0;
  }

  if (target.currentHealth - damage <= 0) {
    const actualDamage = target.currentHealth;
    target.currentHealth = 0;
    return actualDamage;
  } else {
    target.currentHealth -= damage;
    return damage;
  }
};

export const healDamage = (target: Character | Enemy, healAmount: number): number => {
  let maxHealth;
  if ("maxHealth" in target) {
    maxHealth = target.maxHealth;
  } else {
    maxHealth = 100;
  }

  if (target.currentHealth + healAmount >= maxHealth) {
    const actualHeal = maxHealth - target.currentHealth;
    target.currentHealth = maxHealth;
    return actualHeal;
  } else {
    target.currentHealth += healAmount;
    return healAmount;
  }
};
