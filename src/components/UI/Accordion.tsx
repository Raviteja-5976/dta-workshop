"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-3 border-deep-navy rounded-2xl bg-white shadow-neo mb-4 overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-display font-bold text-lg md:text-xl text-deep-navy cursor-pointer select-none focus:outline-none"
      >
        <span className="pr-4">{title}</span>
        <div
          className={clsx(
            "p-1.5 md:p-2 border-2 border-deep-navy rounded-lg bg-yellow transition-all duration-200 shadow-[2px_2px_0px_0px_#1B1F3B] shrink-0",
            isOpen && "rotate-180 bg-mint"
          )}
        >
          <ChevronDown className="w-5 h-5 text-deep-navy" />
        </div>
      </button>
      <div
        className={clsx(
          "transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[500px] border-t-3 border-deep-navy p-5 bg-bg-cream opacity-100" : "max-h-0 p-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="text-base md:text-lg leading-relaxed text-deep-navy font-sans font-medium">
          {children}
        </div>
      </div>
    </div>
  );
};
