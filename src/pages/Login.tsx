import React, { useEffect, useState } from 'react';
import { Phone, ShieldCheck, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendCode, verifyCode, getOrCreateUser } from '@/services/cloudbase';
import { useApp } from '@/contexts/AppContext';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [requestId, setRequestId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useApp();

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const onSendCode = async () => {
    if (!/^1\d{10}$/.test(phone)) { setError('手机号格式不正确'); return }
    setError(''); setLoading(true);
    try {
      const ok = await sendCode(phone);
      if (!ok) throw new Error('CloudBase 未提供手机号验证码发送 API');
      setCountdown(60);
    } catch (e: any) {
      setError(e?.message ? `验证码发送失败：${e.message}` : '验证码发送失败');
    } finally { setLoading(false) }
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError('验证码格式不正确'); return }
    setError(''); setLoading(true);
    try {
      const uid = await verifyCode(phone, code);
      localStorage.setItem('tcb_auth', uid);
      const user = await getOrCreateUser(uid);
      dispatch({ type: 'SET_USER', payload: user });
      navigate('/');
    } catch {
      setError('登录失败，请重试');
    } finally { setLoading(false) }
  };

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
        
        <div className="card-cute">
          <form onSubmit={onLogin} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-cute text-primary-400 mb-2">
                手机号
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-300" />
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-primary-200 rounded-2xl focus:outline-none focus:border-primary-400 bg-white font-cute" placeholder="请输入手机号" required />
              </div>
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-cute text-primary-400 mb-2">验证码</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-300" />
                  <input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-primary-200 rounded-2xl focus:outline-none focus:border-primary-400 bg-white font-cute" placeholder="请输入6位验证码" required />
                </div>
                <button type="button" onClick={onSendCode} disabled={countdown>0||loading} className="px-4 py-3 rounded-2xl bg-primary-300 text-white font-cute disabled:opacity-50">
                  {countdown>0? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full btn-cute text-lg py-3"
            >
              登录/注册
            </button>
            {error && (<div className="text-center text-red-500 font-cute">{error}</div>)}
          </form>
          
          
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
