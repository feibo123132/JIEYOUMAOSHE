import React from 'react';
import { motion } from 'framer-motion';

interface CatAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'float' | 'bounce' | 'pulse' | 'none';
  emoji?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16 text-2xl',
  md: 'w-24 h-24 text-4xl',
  lg: 'w-32 h-32 text-6xl',
  xl: 'w-40 h-40 text-8xl'
};

const animationVariants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  bounce: {
    y: [0, -20, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  none: {}
};

const CatAvatar: React.FC<CatAvatarProps> = ({ 
  size = 'md', 
  animation = 'float', 
  emoji = '🐱',
  className = ''
}) => {
  return (
    <motion.div
      className={`cat-avatar ${sizeClasses[size]} ${className}`}
      variants={animationVariants}
      animate={animation}
    >
      <span className="select-none">{emoji}</span>
    </motion.div>
  );
};

export default CatAvatar;