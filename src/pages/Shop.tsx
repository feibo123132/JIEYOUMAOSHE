import React from 'react';
import { ShoppingBag, Lock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/Button';

const Shop: React.FC = () => {
  const { state, dispatch } = useApp();

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-warm-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🛍️</div>
          <p className="text-primary-400 font-cute">商店加载中...</p>
        </div>
      </div>
    );
  }

  const shopItems = state.shopItems.length > 0 ? state.shopItems : [
    {
      id: '1',
      name: '小鱼干',
      type: 'food' as const,
      price: 10,
      requiredLevel: 2,
      emoji: '🐟',
      description: '营养丰富的深海小鱼干',
      unlocked: true
    },
    {
      id: '2',
      name: '蝴蝶结',
      type: 'accessory' as const,
      price: 25,
      requiredLevel: 3,
      emoji: '🎀',
      description: '可爱的粉色蝴蝶结',
      unlocked: false
    },
    {
      id: '3',
      name: '逗猫棒',
      type: 'toy' as const,
      price: 15,
      requiredLevel: 2,
      emoji: '🪶',
      description: '让猫咪开心的逗猫棒',
      unlocked: true
    },
    {
      id: '4',
      name: '猫罐头',
      type: 'food' as const,
      price: 30,
      requiredLevel: 5,
      emoji: '🥫',
      description: '美味的猫罐头',
      unlocked: false
    },
    {
      id: '5',
      name: '小帽子',
      type: 'accessory' as const,
      price: 40,
      requiredLevel: 6,
      emoji: '🧢',
      description: '时尚的小帽子',
      unlocked: false
    },
    {
      id: '6',
      name: '猫城堡',
      type: 'decoration' as const,
      price: 100,
      requiredLevel: 10,
      emoji: '🏰',
      description: '豪华的猫咪城堡',
      unlocked: false
    }
  ];

  const handlePurchase = (item: typeof shopItems[0]) => {
    if (!state.user) return;
    
    if (state.user.coinBalance < item.price) {
      alert('金币不足！');
      return;
    }
    
    if (!item.unlocked) {
      alert('该物品尚未解锁！');
      return;
    }
    
    const newBalance = state.user.coinBalance - item.price;
    dispatch({ type: 'UPDATE_USER_COINS', payload: newBalance });
    alert(`成功购买 ${item.name}！`);
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'bg-orange-100 text-orange-800';
      case 'toy': return 'bg-blue-100 text-blue-800';
      case 'accessory': return 'bg-pink-100 text-pink-800';
      case 'decoration': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-warm-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <ShoppingBag className="w-8 h-8 text-primary-300 mr-3" />
          <h1 className="text-4xl font-cute text-primary-400">萌宠商店</h1>
        </div>
        
        {/* 金币余额显示 */}
        <div className="card-cute mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-3xl mr-3">💰</div>
              <div>
                <h3 className="text-lg font-cute text-primary-400">我的金币</h3>
                <p className="text-sm text-gray-600">购买萌宠用品</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-cute text-yellow-500">{state.user?.coinBalance || 0}</div>
              <div className="text-sm text-gray-500">金币</div>
            </div>
          </div>
        </div>
        
        {/* 商品分类标签 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="px-4 py-2 bg-primary-300 text-white rounded-full font-cute text-sm">
            全部商品
          </button>
          <button className="px-4 py-2 bg-warm-300 text-gray-700 rounded-full font-cute text-sm hover:bg-primary-100">
            🍽️ 食物
          </button>
          <button className="px-4 py-2 bg-warm-300 text-gray-700 rounded-full font-cute text-sm hover:bg-primary-100">
            🪶 玩具
          </button>
          <button className="px-4 py-2 bg-warm-300 text-gray-700 rounded-full font-cute text-sm hover:bg-primary-100">
            🎀 装饰
          </button>
        </div>
        
        {/* 商品列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems.map((item, index) => (
            <motion.div
              key={item.id}
              className={`card-cute ${!item.unlocked ? 'opacity-60' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full mx-auto flex items-center justify-center text-4xl">
                    {item.emoji}
                  </div>
                  {!item.unlocked && (
                    <div className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full p-2">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                  {item.requiredLevel > 1 && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full font-cute">
                        Lv.{item.requiredLevel}
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-cute text-primary-400 mb-2">{item.name}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-cute mb-2 ${getItemTypeColor(item.type)}`}>
                  {item.type === 'food' ? '食物' :
                   item.type === 'toy' ? '玩具' :
                   item.type === 'accessory' ? '装饰' :
                   item.type === 'decoration' ? '家具' : '其他'}
                </span>
                <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="text-2xl mr-1">🪙</div>
                    <span className="text-lg font-cute text-yellow-500">{item.price}</span>
                  </div>
                  <Button
                    variant="cute"
                    size="sm"
                    onClick={() => handlePurchase(item)}
                    disabled={!item.unlocked || (state.user && state.user.coinBalance < item.price)}
                    className="text-sm px-4 py-2"
                  >
                    {!item.unlocked ? '未解锁' : '购买'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* 解锁提示 */}
        <div className="mt-8 p-4 bg-primary-50 rounded-2xl">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-primary-400 mr-2" />
            <p className="text-sm text-primary-600 font-cute">
              提升猫咪等级可以解锁更多商品！当前等级：{state.cat?.currentLevel || 1}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
