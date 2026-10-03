'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyStoriesState() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center bg-[#F7EAE0]">
      {/* Custom Status Ring Icon */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-16 h-16 rounded-full border-4 border-dashed border-[#1D4533]/30 flex items-center justify-center text-[#1D4533] mb-5"
      >
        <div className="w-6 h-6 rounded-full bg-[#1D4533]/20"></div>
      </motion.div>
      
      <h2 className="text-2xl font-black text-[#1D4533] mb-2 tracking-tight">Share Stories</h2>
      <p className="text-sm text-[#1D4533]/70 max-w-sm leading-relaxed">
        Share photos, videos and text that disappear after 24 hours.
      </p>
    </div>
  );
}