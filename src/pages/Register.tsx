import React, { useState } from 'react';
import { Mail, Lock, User, Heart } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('密码不匹配，请重新输入');
      return;
    }
    // 注册逻辑将在集成Supabase后实现
    console.log('Register attempt:', { name, email, password });
  };

  return (
    <div className="min-h-screen bg-warm-200 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary-300 mr-2" />
            <h1 className="text-4xl font-cute text-primary-400">JIEYOU萌宠</h1>
          </div>
          <p className="text-gray-600">加入我们，开始你的猫咪养成之旅！</p>
        </div>
        
        <div className="card-cute">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-cute text-primary-400 mb-2">
                昵称
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-300" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-primary-200 rounded-2xl focus:outline-none focus:border-primary-400 bg-white font-cute"
                  placeholder="请输入昵称"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-cute text-primary-400 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-primary-200 rounded-2xl focus:outline-none focus:border-primary-400 bg-white font-cute"
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-cute text-primary-400 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-300" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-primary-200 rounded-2xl focus:outline-none focus:border-primary-400 bg-white font-cute"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-cute text-primary-400 mb-2">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-300" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-primary-200 rounded-2xl focus:outline-none focus:border-primary-400 bg-white font-cute"
                  placeholder="请再次输入密码"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full btn-cute text-lg py-3"
            >
              注册
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              已有账号？
              <a href="/login" className="text-primary-400 hover:text-primary-500 font-cute ml-1">
                立即登录
              </a>
            </p>
          </div>
        </div>
        
        {/* 装饰性猫咪 */}
        <div className="text-center mt-8">
          <div className="text-6xl animate-bounce-soft">🐱</div>
        </div>
      </div>
    </div>
  );
};

export default Register;