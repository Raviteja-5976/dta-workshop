import React from 'react';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normStatus = status.toLowerCase();

  const colorClasses = {
    // Confirmed / Paid / Live states
    live: 'bg-mint text-deep-navy',
    paid: 'bg-mint text-deep-navy',
    confirmed: 'bg-mint text-deep-navy',
    success: 'bg-success text-white',

    // Upcoming / Pending states
    upcoming: 'bg-yellow text-deep-navy',
    pending: 'bg-yellow text-deep-navy',
    waitlisted: 'bg-sky text-deep-navy',

    // Completed states
    completed: 'bg-deep-navy/15 text-deep-navy',

    // Cancelled / Failed states
    cancelled: 'bg-coral text-white',
    failed: 'bg-coral text-white',
    refunded: 'bg-coral text-white',
  };

  const currentClass = colorClasses[normStatus as keyof typeof colorClasses] || 'bg-white text-deep-navy';

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center px-3 py-1 text-[11px] font-display font-black uppercase tracking-wider rounded-full border-2 border-deep-navy shadow-[1.5px_1.5px_0px_0px_#1B1F3B]',
        currentClass,
        className
      )}
    >
      {status}
    </span>
  );
};
export default StatusBadge;
