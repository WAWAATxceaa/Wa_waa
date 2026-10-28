import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-violet-600 via-pink-500 to-cyan-400 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-semibold text-slate-700 dark:text-slate-300">
            Smart Meeting Room Booking System
          </span>
          <span>• Asia/Bangkok (พ.ศ.)</span>
        </div>

        <div className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          <span>for High-Performance Modern Teams</span>
        </div>
      </div>
    </footer>
  );
};
