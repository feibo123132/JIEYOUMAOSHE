import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Cat, Interaction, ShopItem, InteractionResult } from '@/types';
import { ensureLogin, getOrCreateUser, getCat as tcbGetCat, getTodayInteractions as tcbGetTodayInteractions, writeInteraction, updateCatExperience, updateUserCoins, writeCoin } from '@/services/cloudbase';

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CAT'; payload: Cat | null }
  | { type: 'SET_TODAY_INTERACTIONS'; payload: Interaction[] }
  | { type: 'ADD_INTERACTION'; payload: Interaction }
  | { type: 'SET_SHOP_ITEMS'; payload: ShopItem[] }
  | { type: 'UPDATE_USER_COINS'; payload: number }
  | { type: 'UPDATE_CAT_EXPERIENCE'; payload: { totalExperience: number; currentLevel: number } }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  user: null,
  cat: null,
  todayInteractions: [],
  shopItems: [],
  isLoading: false,
  error: null
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_CAT':
      return { ...state, cat: action.payload };
    
    case 'SET_TODAY_INTERACTIONS':
      return { ...state, todayInteractions: action.payload };
    
    case 'ADD_INTERACTION':
      return { 
        ...state, 
        todayInteractions: [...state.todayInteractions, action.payload] 
      };
    
    case 'SET_SHOP_ITEMS':
      return { ...state, shopItems: action.payload };
    
    case 'UPDATE_USER_COINS':
      return {
        ...state,
        user: state.user ? { ...state.user, coinBalance: action.payload } : null
      };
    
    case 'UPDATE_CAT_EXPERIENCE':
      return {
        ...state,
        cat: state.cat ? {
          ...state.cat,
          totalExperience: action.payload.totalExperience,
          currentLevel: action.payload.currentLevel
        } : null
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  performInteraction: (type: 'feed' | 'pet' | 'bath' | 'play' | 'sleep') => Promise<InteractionResult>;
  canInteractToday: (type: string) => boolean;
  getCoinReward: (interactionCount: number) => number;
  checkLevelUp: (currentExp: number, currentLevel: number) => { newLevel: number; unlockedContent: string[] };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const canInteractToday = () => true;

  // 获取金币奖励
  const getCoinReward = (interactionCount: number): number => {
    if (interactionCount > 5) return 0;
    return [5, 4, 3, 2, 1][interactionCount - 1] || 0;
  };

  // 检查等级升级
  const checkLevelUp = (currentExp: number, currentLevel: number): { newLevel: number; unlockedContent: string[] } => {
    const levelRequirements = [0, 10, 30, 40, 70, 100, 210, 320, 430, 540];
    let newLevel = currentLevel;
    
    for (let i = currentLevel; i < levelRequirements.length; i++) {
      if (currentExp >= levelRequirements[i]) {
        newLevel = i;
      } else {
        break;
      }
    }
    
    const unlockedContent = getUnlockedContent(currentLevel, newLevel);
    
    return {
      newLevel,
      unlockedContent
    };
  };

  // 获取解锁内容
  const getUnlockedContent = (oldLevel: number, newLevel: number): string[] => {
    const unlocks = [
      '基础互动功能',
      '新食物：小鱼干',
      '新装饰：蝴蝶结',
      '新互动：梳毛',
      '新食物：猫罐头',
      '新装饰：小帽子',
      '新猫咪品种：橘猫',
      '新食物：高级猫粮',
      '新装饰：皇冠',
      '终极奖励：猫城堡'
    ];
    
    const unlockedContent = [];
    for (let i = oldLevel; i < newLevel; i++) {
      if (unlocks[i]) {
        unlockedContent.push(unlocks[i]);
      }
    }
    
    return unlockedContent;
  };

  // 执行互动
  const performInteraction = async (type: 'feed' | 'pet' | 'bath' | 'play' | 'sleep'): Promise<InteractionResult> => {
    if (!state.user || !state.cat) {
      return {
        success: false,
        experienceGained: 0,
        coinsEarned: 0,
        message: '用户或猫咪信息不完整'
      };
    }

    const now = new Date();

    // 计算奖励
    const interactionCount = state.todayInteractions.length + 1;
    const experienceGained = state.todayInteractions.some(i => i.userId === state.user!.id && i.interactionDate.toDateString() === now.toDateString() && i.experienceGained > 0) ? 0 : 1;
    const coinsEarned = getCoinReward(interactionCount);

    

    // 创建新的互动记录
    const newInteraction: Interaction = {
      id: Date.now().toString(),
      userId: state.user.id,
      catId: state.cat.id,
      type,
      experienceGained,
      createdAt: now,
      interactionDate: now
    };

    // 更新猫咪经验值
    const newTotalExperience = state.cat.totalExperience + experienceGained;
    const levelUpResult = checkLevelUp(newTotalExperience, state.cat.currentLevel);

    // 更新用户金币
    const newCoinBalance = state.user.coinBalance + coinsEarned;

    // 派发状态更新
    dispatch({ type: 'ADD_INTERACTION', payload: newInteraction });
    dispatch({ type: 'UPDATE_CAT_EXPERIENCE', payload: {
      totalExperience: newTotalExperience,
      currentLevel: levelUpResult.newLevel
    }});
    dispatch({ type: 'UPDATE_USER_COINS', payload: newCoinBalance });

    await writeInteraction(newInteraction);
    await updateCatExperience(newTotalExperience, levelUpResult.newLevel);
    await updateUserCoins(state.user.id, newCoinBalance);
    if (coinsEarned > 0) {
      await writeCoin(state.user.id, coinsEarned, 'interaction');
    }

    return {
      success: true,
      experienceGained,
      coinsEarned,
      newLevel: levelUpResult.newLevel !== state.cat.currentLevel ? levelUpResult.newLevel : undefined,
      unlockedContent: levelUpResult.unlockedContent.length > 0 ? levelUpResult.unlockedContent : undefined,
      message: '互动成功！'
    };
  };

  // 初始化应用数据
  useEffect(() => {
    const initializeApp = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const uid = await ensureLogin();
        const cat = await tcbGetCat();
        const user = await getOrCreateUser(uid);
        const todayInteractions = await tcbGetTodayInteractions(uid, new Date());

        const mockShopItems: ShopItem[] = [
          {
            id: '1',
            name: '小鱼干',
            type: 'food',
            price: 10,
            requiredLevel: 2,
            emoji: '🐟',
            description: '营养丰富的深海小鱼干',
            unlocked: true
          },
          {
            id: '2',
            name: '蝴蝶结',
            type: 'accessory',
            price: 25,
            requiredLevel: 3,
            emoji: '🎀',
            description: '可爱的粉色蝴蝶结',
            unlocked: false
          }
        ];
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_CAT', payload: cat });
        dispatch({ type: 'SET_TODAY_INTERACTIONS', payload: todayInteractions });
        dispatch({ type: 'SET_SHOP_ITEMS', payload: mockShopItems });
      } catch (error) {
        console.error('初始化失败:', error);
        dispatch({ type: 'SET_ERROR', payload: '初始化应用失败' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, []);

  

  const value: AppContextType = {
    state,
    dispatch,
    performInteraction,
    canInteractToday,
    getCoinReward,
    checkLevelUp
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
