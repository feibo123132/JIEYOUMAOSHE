import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/shop', icon: ShoppingBag, label: '商店' },
    { path: '/profile', icon: User, label: '我的' }
  ];

  return (
    <nav className="bg-white shadow-cute border-t-2 border-primary-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Heart className="w-6 h-6 text-primary-300 mr-2" />
            <span className="text-xl font-cute text-primary-400">JIEYOU萌宠</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg font-cute transition-colors ${
                    isActive
                      ? 'bg-primary-300 text-white'
                      : 'text-gray-600 hover:text-primary-400 hover:bg-primary-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-300 text-white'
                      : 'text-gray-600 hover:text-primary-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;