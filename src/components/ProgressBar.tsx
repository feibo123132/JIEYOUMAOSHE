import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  animated?: boolean;
}

const colorClasses = {
  primary: 'bg-gradient-to-r from-primary-300 to-primary-400',
  success: 'bg-gradient-to-r from-green-400 to-green-500',
  warning: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
  error: 'bg-gradient-to-r from-red-400 to-red-500'
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  label = '进度',
  color = 'primary',
  showLabel = true,
  animated = true
}) => {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-cute text-primary-400">{label}</span>
          <span className="text-sm font-cute text-primary-400">
            {current}/{max}
          </span>
        </div>
      )}
      <div className="w-full h-4 bg-warm-300 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out`}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;