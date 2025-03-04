
// Type definitions for the game

export type CardType = 'attack' | 'defense' | 'special' | 'buff' | 'debuff';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  description: string;
  energyCost: number;
  value: number;
  image?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  upgraded?: boolean; // New property to track if a card has been upgraded
}

export interface Character {
  id: string;
  name: string;
  maxHealth: number;
  currentHealth: number;
  maxEnergy: number;
  currentEnergy: number;
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
  drawPile: Card[];
  gold: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  inventory: Item[];
  equippedItems: {
    weapon?: Item;
    armor?: Item;
    accessory?: Item;
  };
  class: string; // Added class property
}

export interface Enemy {
  id: string;
  name: string;
  maxHealth: number;
  currentHealth: number;
  damage: number;
  intent: 'attack' | 'defend' | 'buff' | 'debuff';
  intentValue: number;
  image?: string;
}

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'potion';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  durability?: number; // Added for equipment items
  weight?: number; // Added weight property to fix the type error
}

export type NodeType = 'battle' | 'elite' | 'shop' | 'rest' | 'boss' | 'event';

export interface MapNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  connections: string[];
  visited: boolean;
  available: boolean;
}

export interface GameMap {
  nodes: MapNode[];
  currentNode?: string;
  level: number;
}

// Update GamePhase type to replace 'inventory' and 'equipment' with 'inventory-system'
export type GamePhase = 'menu' | 'character-selection' | 'map' | 'battle' | 'shop' | 'reward' | 'rest' | 'game-over' | 'login' | 'event' | 'inventory-system' | 'deck' | 'register';
export type TurnType = 'player' | 'enemy';

export interface User {
  id: string;
  username: string;
  email: string;
  isLoggedIn: boolean;
  maxCharacterSlots: number;
  gold: number;
}

export interface GameState {
  characters: Character[];
  activeCharacter: Character | null;
  currentEnemy: Enemy | null;
  inBattle: boolean;
  turn: TurnType;
  round: number;
  battleTurn: number; // Added battleTurn property
  gamePhase: GamePhase;
  temporaryEffects: {
    playerDefense: number;
    enemyDefense: number;
    playerBuffs: { type: string; value: number; duration: number }[];
    enemyBuffs: { type: string; value: number; duration: number }[];
  };
  map: GameMap | null;
  user: User | null;
  inBattleMode: boolean;
  quickAccessOpen: boolean;
  loginError?: string;
  registrationError?: string;
  registrationSuccess?: boolean;
}

export type Action =
  | { type: 'CREATE_CHARACTER'; payload: Omit<Character, 'hand' | 'discardPile' | 'drawPile' | 'inventory' | 'equippedItems' | 'experienceToNextLevel'> }
  | { type: 'SELECT_CHARACTER'; payload: string }
  | { type: 'START_BATTLE'; payload: Enemy }
  | { type: 'PLAY_CARD'; payload: { cardId: string; targetId?: string; isCriticalHit?: boolean } }
  | { type: 'END_TURN' }
  | { type: 'ENEMY_ACTION' }
  | { type: 'DRAW_CARD'; payload: { amount: number } }
  | { type: 'SHUFFLE_DISCARD_TO_DRAW' }
  | { type: 'INITIALIZE_DRAW_PILE' }
  | { type: 'DAMAGE_ENEMY'; payload: { damage: number } }
  | { type: 'DAMAGE_PLAYER'; payload: { damage: number } }
  | { type: 'HEAL_PLAYER'; payload: { amount: number } }
  | { type: 'ADD_PLAYER_DEFENSE'; payload: { amount: number } }
  | { type: 'END_BATTLE'; payload: { reward?: Card; experience: number; gold?: number } }
  | { type: 'ADD_CARD_TO_DECK'; payload: Card }
  | { type: 'DISCARD_CARD_FROM_DECK'; payload: { cardId: string } }
  | { type: 'BUY_CARD'; payload: { card: Card; cost: number } }
  | { type: 'BUY_POTION'; payload: { potion: Item; cost: number } }
  | { type: 'BUY_EQUIPMENT'; payload: { equipment: Item; cost: number } }
  | { type: 'USE_POTION'; payload: { potionId: string } }
  | { type: 'SPEND_GOLD'; payload: { amount: number } }
  | { type: 'EQUIP_ITEM'; payload: Item }
  | { type: 'UNEQUIP_ITEM'; payload: ItemType }
  | { type: 'GENERATE_MAP'; payload: { level: number } }
  | { type: 'VISIT_NODE'; payload: { nodeId: string } }
  | { type: 'NAVIGATE'; payload: GamePhase }
  | { type: 'GAIN_EXPERIENCE'; payload: { amount: number } }
  | { type: 'LEVEL_UP' }
  | { type: 'TOGGLE_QUICK_ACCESS' }
  | { type: 'LOGIN'; payload: { username: string; email: string; password: string; authenticated?: boolean; user?: { id: string; username: string; email: string } } }
  | { type: 'REGISTER'; payload: { success: boolean; message: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPGRADE_CARD'; payload: { cardId: string } }
  | { type: 'BUY_CHARACTER_SLOT' }
  | { type: 'CLEAR_LOGIN_ERROR' }
  | { type: 'CLEAR_REGISTRATION_STATUS' };

// Define the common properties for all shop items - Moved from ShopTypes.ts
export interface BaseShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Card-specific shop item
export interface CardShopItem extends BaseShopItem {
  type: 'card';
  cardType: 'attack' | 'defense' | 'special' | 'buff' | 'debuff';
  value: number;
  energyCost: number;
}

// Potion-specific shop item
export interface PotionShopItem extends BaseShopItem {
  type: 'potion';
  value: number;
  effect: string;
}

// Equipment-specific shop item
export interface EquipmentShopItem extends BaseShopItem {
  type: 'equipment';
  slot: 'weapon' | 'armor' | 'accessory';
  statBonus: {
    type: string;
    value: number;
  };
}

// Union type for all shop item types
export type ShopItem = CardShopItem | PotionShopItem | EquipmentShopItem;

// For shop components that need to handle all types
export type ShopItems = ShopItem[];
