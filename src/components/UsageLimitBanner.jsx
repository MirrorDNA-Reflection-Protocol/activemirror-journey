/**
 * ⟡ USAGE LIMIT BANNER — Shows when free tier is exhausted
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Sparkles } from 'lucide-react';

const UsageLimitBanner = ({ remaining, limit, onUpgrade, onSignIn, isSignedIn }) => {
  const isExhausted = remaining <= 0;
  const isLow = remaining <= 2 && remaining > 0;

  if (!isExhausted && !isLow) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-4 mt-4 p-4 rounded-xl border ${
        isExhausted
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={isExhausted ? 'text-red-400' : 'text-yellow-400'}
          size={20}
        />
        <div className="flex-1">
          <p className={`font-medium ${isExhausted ? 'text-red-300' : 'text-yellow-300'}`}>
            {isExhausted
              ? "You've reached today's limit"
              : `${remaining} reflection${remaining === 1 ? '' : 's'} remaining today`}
          </p>
          <p className="text-zinc-400 text-sm mt-1">
            {isExhausted
              ? 'Upgrade to Pro for unlimited reflections, or come back tomorrow.'
              : 'Free accounts get 5 reflections per day.'}
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={onUpgrade}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              <Sparkles size={14} />
              Upgrade to Pro
            </button>
            {!isSignedIn && (
              <button
                onClick={onSignIn}
                className="text-zinc-400 text-sm px-4 py-2 hover:text-white transition"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UsageLimitBanner;
