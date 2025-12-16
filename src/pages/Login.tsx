import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ensureLogin, getOrCreateUser } from '@/services/cloudbase';
import { useApp } from '@/contexts/AppContext';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const doAnonymousLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const uid = await ensureLogin();
      const user = await getOrCreateUser(uid);
      dispatch({ type: 'SET_USER', payload: user });
      navigate('/');
    } catch (e: any) {
      setError(e?.message || '进入失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { doAnonymousLogin(); }, []);

  return (
    <div className="min-h-screen bg-warm-200 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary-300 mr-2" />
            <h1 className="text-4xl font-cute text-primary-400">JIEYOU萌宠</h1>
          </div>
          <p className="text-gray-600">欢迎来到猫咪社区，一起养育可爱的猫咪吧！</p>
        </div>
        <div className="card-cute text-center space-y-4">
          {loading ? (
            <div className="text-primary-400 font-cute">正在进入...</div>
          ) : (
            <button className="btn-cute" onClick={doAnonymousLogin}>点击进入</button>
          )}
          {error && (<div className="text-center text-red-500 font-cute">{error}</div>)}
        </div>
        
        {/* 装饰性猫咪 */}
        <div className="text-center mt-8">
          <div className="text-6xl animate-bounce-soft">🐱</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
