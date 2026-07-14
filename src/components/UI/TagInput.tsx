"use client";

import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags = [],
  onChange,
  placeholder = "Type tag and press Enter...",
  className
}) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
        setInput('');
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className={clsx("space-y-2.5", className)}>
      <div className="flex flex-wrap gap-2 min-h-12 border-3 border-deep-navy bg-bg-cream rounded-xl p-2 shadow-neo-inset focus-within:bg-white transition-all">
        {tags.map((tag, idx) => (
          <span 
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow text-deep-navy border-2 border-deep-navy rounded-lg text-xs font-display font-black uppercase tracking-wide shadow-[1.5px_1.5px_0px_0px_#1B1F3B]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="hover:text-coral transition-colors focus:outline-none cursor-pointer"
            >
              <X size={12} className="stroke-[3]" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          className="flex-1 bg-transparent min-w-[120px] focus:outline-none font-semibold text-sm px-2 text-deep-navy placeholder:text-deep-navy/30"
        />
      </div>
      <p className="text-[10px] font-bold text-deep-navy/40">
        Type a tag/outcome and press <kbd className="border border-deep-navy/20 bg-bg-cream px-1 rounded font-mono">Enter</kbd> to append.
      </p>
    </div>
  );
};
export default TagInput;
