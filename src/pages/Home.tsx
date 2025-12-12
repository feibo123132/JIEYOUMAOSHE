import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CatAvatar from '@/components/CatAvatar';
import InteractionButton from '@/components/InteractionButton';
import ProgressBar from '@/components/ProgressBar';

const Home: React.FC = () => {
  const { state, performInteraction } = useApp();
  const [interactionAnimation, setInteractionAnimation] = useState<string | null>(null);
  const [expGainThisClick, setExpGainThisClick] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [unlockedContent, setUnlockedContent] = useState<string[]>([]);

  const interactionTypes = [
    { id: 'feed', name: '喂食', icon: '🍽️', color: 'bg-orange-400' },
    { id: 'pet', name: '撸猫', icon: '🤗', color: 'bg-pink-400' },
    { id: 'bath', name: '洗澡', icon: '🛁', color: 'bg-blue-400' },
    { id: 'play', name: '逗猫', icon: '🎾', color: 'bg-green-400' },
    { id: 'sleep', name: '哄睡', icon: '😴', color: 'bg-purple-400' }
  ];

  const handleInteraction = async (type: 'feed' | 'pet' | 'bath' | 'play' | 'sleep') => {
    setInteractionAnimation(type);
    
    try {
      const result = await performInteraction(type);
      setExpGainThisClick(result.experienceGained);
      
      if (result.success) {
        // 检查是否升级
        if (result.newLevel && result.unlockedContent) {
          setShowLevelUp(true);
          setUnlockedContent(result.unlockedContent);
          
          setTimeout(() => {
            setShowLevelUp(false);
            setUnlockedContent([]);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('互动失败:', error);
    } finally {
      // 清除动画
      setTimeout(() => {
        setInteractionAnimation(null);
      }, 1000);
    }
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-warm-200 flex items-center justify-center">
        <div className="text-center">
          <CatAvatar size="lg" animation="bounce" />
          <p className="text-primary-400 font-cute mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  if (!state.user || !state.cat) {
    return (
      <div className="min-h-screen bg-warm-200 flex items-center justify-center">
        <div className="text-center">
          <CatAvatar size="lg" />
          <p className="text-red-500 font-cute mt-4">数据加载失败</p>
        </div>
      </div>
    );
  }

  const todayInteractions = state.todayInteractions.length;
  const levelRequirements = [0, 10, 30, 40, 70, 100, 210, 320, 430, 540];
  const currentIndex = Math.min(state.cat.currentLevel - 1, levelRequirements.length - 1);
  const nextIndex = Math.min(state.cat.currentLevel, levelRequirements.length - 1);
  const segCurrent = Math.max(0, state.cat.totalExperience - levelRequirements[currentIndex]);
  const segMax = Math.max(1, levelRequirements[nextIndex] - levelRequirements[currentIndex]);

  return (
    <div className="min-h-screen bg-warm-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 猫咪展示区 */}
          <div className="lg:col-span-2">
            <div className="card-cute text-center">
              <h2 className="text-2xl font-cute text-primary-400 mb-6">🌟 等级 {state.cat.currentLevel} 🌟</h2>
              
              {/* 猫咪形象 */}
              <div className="mb-6">
                <CatAvatar 
                  size="lg" 
                  animation={interactionAnimation ? 'pulse' : 'float'}
                  emoji={state.cat.appearance === 'default' ? '🐱' : '🐈'}
                />
                <h3 className="text-xl font-cute text-primary-400 mb-2">{state.cat.name}</h3>
                <p className="text-gray-600">今天已互动 {todayInteractions} 次</p>
              </div>
              
              {/* 经验进度条 */}
              <div className="mb-6">
                <ProgressBar 
                  current={segCurrent}
                  max={segMax}
                  label="经验值"
                  animated={true}
                />
              </div>
              
              {/* 解锁内容预览 */}
              {state.cat.currentLevel < 10 && (
                <div className="bg-primary-50 rounded-2xl p-4">
                  <h4 className="font-cute text-primary-400 mb-2">下一级解锁</h4>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl mr-2">
                      {state.cat.currentLevel === 1 ? '🐟' : 
                       state.cat.currentLevel === 2 ? '🎀' :
                       state.cat.currentLevel === 3 ? '🪮' :
                       state.cat.currentLevel === 4 ? '🥫' :
                       state.cat.currentLevel === 5 ? '🧢' :
                       state.cat.currentLevel === 6 ? '🐈' :
                       state.cat.currentLevel === 7 ? '🍖' :
                       state.cat.currentLevel === 8 ? '👑' :
                       state.cat.currentLevel === 9 ? '🏰' : '🎁'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {state.cat.currentLevel === 1 ? '小鱼干' :
                       state.cat.currentLevel === 2 ? '蝴蝶结' :
                       state.cat.currentLevel === 3 ? '梳毛' :
                       state.cat.currentLevel === 4 ? '猫罐头' :
                       state.cat.currentLevel === 5 ? '小帽子' :
                       state.cat.currentLevel === 6 ? '橘猫品种' :
                       state.cat.currentLevel === 7 ? '高级猫粮' :
                       state.cat.currentLevel === 8 ? '皇冠' :
                       state.cat.currentLevel === 9 ? '猫城堡' : '神秘奖励'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 互动操作区 */}
          <div>
            <div className="card-cute">
              <h3 className="text-xl font-cute text-primary-400 mb-6 text-center">互动操作</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {interactionTypes.map((type) => (
                  <div key={type.id} className="flex flex-col items-center">
                    <InteractionButton
                      icon={type.icon}
                      name={type.name}
                      color={type.color}
                      onClick={() => handleInteraction(type.id as any)}
                      isAnimating={interactionAnimation === type.id}
                    />
                    <span className="mt-2 text-sm font-cute text-gray-700">{type.name}</span>
                  </div>
                ))}
              </div>
              
              
              
              
            </div>
            
            {/* 今日奖励 */}
            <div className="card-cute mt-6">
              <h4 className="font-cute text-primary-400 mb-4 text-center">今日奖励</h4>
              <div className="text-center">
                <div className="text-3xl mb-2">🪙</div>
                <div className="text-lg font-cute text-yellow-500">
                  {todayInteractions < 5 ? [5, 4, 3, 2, 1][todayInteractions] || 0 : 0} 金币
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  第 {todayInteractions + 1} 次互动奖励
                </p>
              </div>
            </div>
            
            {/* 我的金币 */}
            <div className="card-cute mt-6">
              <h4 className="font-cute text-primary-400 mb-4 text-center">我的金币</h4>
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-cute text-yellow-500">
                  {state.user.coinBalance}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  当前余额
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 互动动画效果 */}
      <AnimatePresence>
        {interactionAnimation && (
          <motion.div
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <motion.div
              className="text-8xl"
              animate={{ 
                y: [-20, -100],
                opacity: [1, 0]
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {interactionTypes.find(t => t.id === interactionAnimation)?.icon}
            </motion.div>
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-cute text-primary-400"
              animate={{ 
                y: [-20, -80],
                opacity: [1, 0]
              }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              {expGainThisClick > 0 ? '+1 经验值' : '❤️ 互动'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 升级通知 */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-cute text-primary-400 mb-4">恭喜升级！</h3>
              <p className="text-lg font-cute text-primary-400 mb-4">等级 {state.cat.currentLevel}</p>
              {unlockedContent.map((content, index) => (
                <div key={index} className="text-primary-400 mb-2">
                  ✨ {content}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
