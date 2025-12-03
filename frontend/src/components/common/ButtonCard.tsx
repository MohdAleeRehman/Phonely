import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonCardProps {
  icon: ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const ButtonCard = ({ 
  icon, 
  label, 
  selected, 
  onClick,
  disabled = false 
}: ButtonCardProps) => {
  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-3 p-4 rounded-lg border-2 transition-all
        ${selected 
          ? 'border-primary-600 bg-primary-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className={`text-2xl ${selected ? 'scale-110' : ''} transition-transform`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${selected ? 'text-primary-700' : 'text-gray-700'}`}>
        {label}
      </span>
    </motion.button>
  );
};
