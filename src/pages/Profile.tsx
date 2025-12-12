import React from 'react';
import { User, Clock, Star, Coins, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CatAvatar from '@/components/CatAvatar';

const Profile: React.FC = () => {
  const { state } = useApp();

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

  if (!state.user) {
    return (
      <div className="min-h-screen bg-warm-200 flex items-center justify-center">
        <div className="text-center">
          <CatAvatar size="lg" />
          <p className="text-red-500 font-cute mt-4">请先登录</p>
        </div>
      </div>
    );
  }

  // 计算互动统计
  const interactionStats = {
    feed: state.todayInteractions.filter(i => i.type === 'feed').length,
    pet: state.todayInteractions.filter(i => i.type === 'pet').length,
    bath: state.todayInteractions.filter(i => i.type === 'bath').length,
    play: state.todayInteractions.filter(i => i.type === 'play').length,
    sleep: state.todayInteractions.filter(i => i.type === 'sleep').length
  };

  const totalInteractions = Object.values(interactionStats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-warm-200 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <User className="w-8 h-8 text-primary-300 mr-3" />
          <h1 className="text-4xl font-cute text-primary-400">个人中心</h1>
        </div>
        
        {/* 用户信息卡片 */}
        <div className="card-cute mb-6">
          <div className="flex items-center mb-6">
            <CatAvatar size="lg" className="mr-6" />
            <div>
              <h2 className="text-2xl font-cute text-primary-400 mb-2">{state.user.name}</h2>
              <p className="text-gray-600 mb-2">注册时间：{state.user.createdAt.toLocaleDateString()}</p>
              <p className="text-gray-600">邮箱：{state.user.email}</p>
            </div>
          </div>
          
          {/* 金币余额 */}
          <div className="bg-primary-50 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Coins className="w-6 h-6 text-yellow-500 mr-2" />
              <span className="text-3xl font-cute text-primary-400">我的金币</span>
            </div>
            <div className="text-4xl font-cute text-yellow-500">{state.user.coinBalance}</div>
          </div>
        </div>
        
        {/* 互动统计 */}
        <div className="card-cute mb-6">
          <h3 className="text-xl font-cute text-primary-400 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            互动统计
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <motion.div 
              className="text-center p-4 bg-orange-50 rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl mb-2">🍽️</div>
              <div className="text-lg font-cute text-primary-400">{interactionStats.feed}</div>
              <div className="text-sm text-gray-600">喂食</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 bg-pink-50 rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl mb-2">🤗</div>
              <div className="text-lg font-cute text-primary-400">{interactionStats.pet}</div>
              <div className="text-sm text-gray-600">撸猫</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 bg-blue-50 rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl mb-2">🛁</div>
              <div className="text-lg font-cute text-primary-400">{interactionStats.bath}</div>
              <div className="text-sm text-gray-600">洗澡</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 bg-green-50 rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl mb-2">🎾</div>
              <div className="text-lg font-cute text-primary-400">{interactionStats.play}</div>
              <div className="text-sm text-gray-600">逗猫</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 bg-purple-50 rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl mb-2">😴</div>
              <div className="text-lg font-cute text-primary-400">{interactionStats.sleep}</div>
              <div className="text-sm text-gray-600">哄睡</div>
            </motion.div>
          </div>
          
          <div className="text-center p-4 bg-primary-50 rounded-xl">
            <div className="text-2xl font-cute text-primary-400 mb-2">{totalInteractions}</div>
            <div className="text-sm text-gray-600">今日总互动次数</div>
          </div>
        </div>
        
        {/* 历史记录 */}
        <div className="card-cute">
          <h3 className="text-xl font-cute text-primary-400 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            最近互动
          </h3>
          
          {state.todayInteractions.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-primary-300 mx-auto mb-4" />
              <p className="text-gray-500 font-cute">还没有互动记录，快去和猫咪玩耍吧！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.todayInteractions.slice(-5).reverse().map((interaction, index) => (
                <motion.div
                  key={interaction.id}
                  className="flex items-center justify-between p-3 bg-warm-100 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {interaction.type === 'feed' ? '🍽️' :
                       interaction.type === 'pet' ? '🤗' :
                       interaction.type === 'bath' ? '🛁' :
                       interaction.type === 'play' ? '🎾' :
                       interaction.type === 'sleep' ? '😴' : '❓'}
                    </span>
                    <div>
                      <div className="font-cute text-primary-400">
                        {interaction.type === 'feed' ? '喂食' :
                         interaction.type === 'pet' ? '撸猫' :
                         interaction.type === 'bath' ? '洗澡' :
                         interaction.type === 'play' ? '逗猫' :
                         interaction.type === 'sleep' ? '哄睡' : '其他互动'}
                      </div>
                      <div className="text-sm text-gray-600">
                        获得 {interaction.experienceGained} 经验值
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {interaction.createdAt.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
