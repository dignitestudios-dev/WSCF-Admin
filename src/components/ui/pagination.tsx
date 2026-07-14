'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages = 3, 
  onPageChange,
  className = ''
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`w-[299px] h-[61px] bg-white border border-[#DADADA]/20 shadow-lg rounded-[100px] flex items-center justify-between px-4 ${className}`}>
      
      {/* Left Arrow Button */}
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className="w-[38px] h-[38px] bg-[#083F92]/10 text-[#083F92] rounded-full flex items-center justify-center hover:bg-[#083F92]/20 transition-colors disabled:opacity-40 disabled:text-[#919191] shrink-0"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>
      
      {/* Page Numbers Block */}
      <div className="flex items-center bg-[#083F92]/10 h-[38px] rounded-[88px] px-1 shrink-0 relative">
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button 
              key={page}
              onClick={() => onPageChange(page)}
              className={`relative font-poppins font-bold text-[14px] flex items-center justify-center transition-colors mx-0.5 rounded-full w-[32px] h-[32px] ${
                isActive ? 'text-white' : 'text-[#636363] hover:text-[#083F92]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePaginationPill"
                  className="absolute inset-0 bg-[#083F92] rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{page}</span>
            </button>
          );
        })}
      </div>

      {/* Right Arrow Button */}
      <button 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        className="w-[38px] h-[38px] bg-[#083F92]/10 text-[#083F92] rounded-full flex items-center justify-center hover:bg-[#083F92]/20 transition-colors disabled:opacity-40 disabled:text-[#919191] shrink-0"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

    </div>
  );
}
