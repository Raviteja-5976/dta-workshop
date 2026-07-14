import React from 'react';
import clsx from 'clsx';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'orange' | 'mint' | 'sky' | 'coral' | 'yellow' | 'white' | 'navy';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  variant = 'orange',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const bgClasses = {
    orange: 'bg-primary-orange text-white hover:bg-[#ff7a4b]',
    mint: 'bg-mint text-deep-navy hover:bg-[#85f3c5]',
    sky: 'bg-sky text-deep-navy hover:bg-[#68b7ff]',
    coral: 'bg-coral text-white hover:bg-[#ff708c]',
    yellow: 'bg-yellow text-deep-navy hover:bg-[#ffe07d]',
    white: 'bg-white text-deep-navy hover:bg-bg-cream',
    navy: 'bg-deep-navy text-white hover:bg-[#2b315b]',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm font-bold rounded-lg border-2 shadow-[2px_2px_0px_0px_#1B1F3B] hover:shadow-[4px_4px_0px_0px_#1B1F3B] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_#1B1F3B]',
    md: 'px-6 py-3 text-base font-bold rounded-xl border-3 shadow-[4px_4px_0px_0px_#1B1F3B] hover:shadow-[6px_6px_0px_0px_#1B1F3B] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[4px_4px_0px_0px_#1B1F3B]',
    lg: 'px-8 py-4 text-lg font-bold rounded-2xl border-4 shadow-[6px_6px_0px_0px_#1B1F3B] hover:shadow-[8px_8px_0px_0px_#1B1F3B] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[6px_6px_0px_0px_#1B1F3B]',
    xl: 'px-10 py-5 text-xl font-extrabold rounded-[24px] border-4 shadow-[8px_8px_0px_0px_#1B1F3B] hover:shadow-[10px_10px_0px_0px_#1B1F3B] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[8px_8px_0px_0px_#1B1F3B]',
  };

  return (
    <button
      className={clsx(
        'font-display uppercase tracking-wider transition-all duration-150 cursor-pointer outline-none relative select-none border-deep-navy text-center inline-flex items-center justify-center gap-2',
        bgClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
