'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChangeValue: (value: string) => void;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChangeValue,
  placeholder = 'Search',
  containerClassName,
  className,
  ...props
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      animate={{ 
        width: isFocused ? 350 : 310,
        boxShadow: isFocused ? '0 4px 20px -2px rgba(8, 63, 146, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
      style={{ maxWidth: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        "relative h-[48px] flex items-center border border-[#083F92] rounded-[44px] pl-4 pr-1 bg-white transition-colors duration-250 shrink-0",
        isFocused ? "border-[#083F92]" : "border-[#083F92]",
        containerClassName
      )}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "w-full h-full font-poppins font-light text-[14px] leading-[21px] text-[#808080] placeholder:text-[#808080]/60 outline-none bg-transparent select-text",
          className
        )}
        {...props}
      />
      
      {/* Icon Circle Container with Hover/Focus Animations */}
      <motion.div
        animate={{
          backgroundColor: isFocused ? '#083F92' : '#F4F4F4',
          scale: isFocused ? 1.05 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0 cursor-pointer"
      >
        <motion.div
          animate={{
            rotate: isFocused ? 15 : 0,
            scale: isFocused ? 1.1 : 1,
            color: isFocused ? '#FFFFFF' : '#130F26'
          }}
          transition={{ duration: 0.2 }}
        >
          <Search className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
