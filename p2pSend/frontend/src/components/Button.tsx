import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  onClick,
  className = '',
  disabled = false
}: ButtonProps) {
  const baseClasses = 'px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantClasses = {
    primary: 'bg-primary hover:bg-primary/90 text-white shadow-primary/30',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-slate-900/50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
