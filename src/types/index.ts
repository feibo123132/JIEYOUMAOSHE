export interface User {
  id: string;
  email: string;
  name: string;
  coinBalance: number;
  createdAt: Date;
  lastActive: Date;
}

export interface Cat {
  id: string;
  name: string;
  currentLevel: number;
  totalExperience: number;
  appearance: string;
  createdAt: Date;
}

export interface Interaction {
  id: string;
  userId: string;
  catId: string;
  type: 'feed' | 'pet' | 'bath' | 'play' | 'sleep';
  experienceGained: number;
  createdAt: Date;
  interactionDate: Date;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  sourceType: string;
  createdAt: Date;
  coinDate: Date;
}

export interface Level {
  level: number;
  requiredExperience: number;
  unlockContent: string;
  description: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'food' | 'toy' | 'accessory' | 'decoration';
  price: number;
  requiredLevel: number;
  emoji: string;
  description: string;
  unlocked: boolean;
}

export interface AppState {
  user: User | null;
  cat: Cat | null;
  todayInteractions: Interaction[];
  shopItems: ShopItem[];
  isLoading: boolean;
  error: string | null;
}

export interface InteractionResult {
  success: boolean;
  experienceGained: number;
  coinsEarned: number;
  newLevel?: number;
  unlockedContent?: string[];
  message: string;
}