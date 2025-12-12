import React from 'react';
import { motion } from 'framer-motion';

interface InteractionButtonProps {
  icon: string;
  name: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
  isAnimating?: boolean;
}

const InteractionButton: React.FC<InteractionButtonProps> = ({
  icon,
  name,
  color,
  onClick,
  disabled = false,
  isAnimating = false
}) => {
  return (
    <motion.button
      className={`w-16 h-16 rounded-full ${color} text-white shadow-cute hover:shadow-cute-hover transition-all duration-300 flex items-center justify-center text-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={isAnimating ? {
        scale: [1, 1.2, 1],
        rotate: [0, 10, -10, 0]
      } : {}}
      transition={isAnimating ? {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse"
      } : {}}
    >
      <span className="select-none">{icon}</span>
    </motion.button>
  );
};

export default InteractionButton;