import { User, Cat, Interaction } from '@/types';

const USER_KEY = 'JIEYOU_user';
const CAT_KEY = 'JIEYOU_cat';

const dateKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const interactionsKey = (userId: string, d: Date) => `JIEYOU_interactions_${userId}_${dateKey(d)}`;
const expGainedKey = (userId: string, d: Date) => `JIEYOU_exp_${userId}_${dateKey(d)}`;

export function loadUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    obj.createdAt = new Date(obj.createdAt);
    obj.lastActive = new Date(obj.lastActive);
    return obj as User;
  } catch {
    return null;
  }
}

export function saveUser(user: User | null) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
    }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadCat(): Cat | null {
  const raw = localStorage.getItem(CAT_KEY);
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    obj.createdAt = new Date(obj.createdAt);
    return obj as Cat;
  } catch {
    return null;
  }
}

export function saveCat(cat: Cat | null) {
  if (!cat) {
    localStorage.removeItem(CAT_KEY);
    return;
  }
  localStorage.setItem(CAT_KEY, JSON.stringify(cat));
}

export function loadTodayInteractions(userId: string, today: Date): Interaction[] {
  const key = interactionsKey(userId, today);
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Interaction[];
    return arr.map(i => ({
      ...i,
      createdAt: new Date(i.createdAt as any),
      interactionDate: new Date(i.interactionDate as any)
    }));
  } catch {
    return [];
  }
}

export function saveTodayInteractions(userId: string, today: Date, interactions: Interaction[]) {
  const key = interactionsKey(userId, today);
  localStorage.setItem(key, JSON.stringify(interactions));
}

export function hasGainedExpToday(userId: string, today: Date): boolean {
  return localStorage.getItem(expGainedKey(userId, today)) === 'true';
}

export function markExpGainedToday(userId: string, today: Date) {
  localStorage.setItem(expGainedKey(userId, today), 'true');
}

export function clearDailyFlags(userId: string, date: Date) {
  localStorage.removeItem(expGainedKey(userId, date));
}

