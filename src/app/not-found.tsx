'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative background blur elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#083F92]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#083F92]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[480px] w-full bg-white rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-[#DADADA]/40 p-10 flex flex-col items-center text-center relative z-10"
      >
        {/* Floating 404 Badge */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-[120px] h-[120px] bg-[#083F92]/5 rounded-full flex items-center justify-center mb-8 relative"
        >
          <div className="absolute inset-0 border border-[#083F92]/20 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          <span className="text-[52px] leading-none text-[#083F92] font-black font-poppins tracking-tighter">404</span>
        </motion.div>
        
        <h1 className="font-poppins text-[28px] leading-[36px] font-bold text-[#083F92] mb-4">
          Checkmate! <br /> Page Not Found
        </h1>
        
        <p className="text-[#636363] text-[15px] leading-[24px] mb-10 px-2">
          It looks like you've made a move outside the board. The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="w-full flex flex-col sm:flex-row gap-4">
          <Link href="/" className="w-full">
            <button className="w-full h-[52px] bg-[#083F92] text-white rounded-[100px] font-poppins font-medium text-[15px] flex items-center justify-center gap-2.5 hover:bg-[#083F92]/90 hover:shadow-lg hover:shadow-[#083F92]/20 transition-all focus:outline-none">
              <Home className="w-5 h-5" />
              Return to Dashboard
            </button>
          </Link>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-12 text-[#919191] text-sm font-poppins font-medium"
      >
        WSCF Chess Admin Panel
      </motion.div>
    </div>
  );
}
