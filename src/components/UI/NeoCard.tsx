import React from 'react';
import clsx from 'clsx';

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'orange' | 'mint' | 'sky' | 'coral' | 'yellow' | 'cream' | 'navy';
  borderSize?: 'normal' | 'thick';
  shadowSize?: 'normal' | 'large' | 'none';
  hoverEffect?: boolean;
  hoverRotate?: 'left' | 'right' | 'none';
  className?: string;
  children: React.ReactNode;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  variant = 'white',
  borderSize = 'normal',
  shadowSize = 'normal',
  hoverEffect = false,
  hoverRotate = 'none',
  className,
  children,
  ...props
}) => {
  const bgClasses = {
    white: 'bg-white text-deep-navy',
    orange: 'bg-primary-orange text-white',
    mint: 'bg-mint text-deep-navy',
    sky: 'bg-sky text-deep-navy',
    coral: 'bg-coral text-white',
    yellow: 'bg-yellow text-deep-navy',
    cream: 'bg-bg-cream text-deep-navy',
    navy: 'bg-deep-navy text-white',
  };

  const shadowClasses = {
    normal: 'shadow-neo',
    large: 'shadow-neo-lg',
    none: '',
  };

  const rotateHoverClasses = {
    left: 'hover:-rotate-1',
    right: 'hover:rotate-1',
    none: 'hover:rotate-0',
  };

  return (
    <div
      className={clsx(
        'rounded-[24px] border-deep-navy transition-all duration-300 relative',
        borderSize === 'normal' ? 'border-3' : 'border-4',
        bgClasses[variant],
        shadowClasses[shadowSize],
        hoverEffect && [
          'hover:-translate-y-2 hover:-translate-x-1',
          shadowSize === 'normal' && 'hover:shadow-neo-lg',
          shadowSize === 'large' && 'hover:shadow-[12px_12px_0px_0px_#1B1F3B]',
          rotateHoverClasses[hoverRotate],
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
