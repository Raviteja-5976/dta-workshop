import React from 'react';
import { NeoCard } from './NeoCard';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'white' | 'orange' | 'mint' | 'sky' | 'coral' | 'yellow' | 'cream' | 'navy';
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  icon: Icon,
  variant = 'white',
  className
}) => {
  return (
    <NeoCard
      variant={variant}
      borderSize="normal"
      shadowSize="normal"
      className={clsx('p-5 flex items-center justify-between text-left', className)}
    >
      <div className="space-y-1">
        <span className="text-[10px] font-display font-black tracking-widest text-deep-navy/50 uppercase block">
          {label}
        </span>
        <h3 className="font-display font-black text-3xl md:text-4xl text-deep-navy leading-none">
          {value}
        </h3>
      </div>
      <div className="w-12 h-12 border-2 border-deep-navy bg-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#1B1F3B] shrink-0">
        <Icon className="w-6 h-6 text-deep-navy stroke-[2.5]" />
      </div>
    </NeoCard>
  );
};
export default StatTile;
