/**
 * ⟡ AUTH MODAL — Sign In / Sign Up / Upgrade
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, Check } from 'lucide-react';
import { signIn, TIERS } from '../lib/auth';

const AuthModal = ({ isOpen, onClose, onAuth, mode = 'signin', onUpgrade }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate magic link delay (in v1.1, this sends actual email)
    await new Promise(r => setTimeout(r, 800));

    const user = signIn(email);
    setSuccess(true);
    
    setTimeout(() => {
      onAuth(user);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⟡</span>
              <h2 className="text-xl font-semibold text-white">
                {mode === 'upgrade' ? 'Upgrade to Pro' : 'Sign In'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>

          {mode === 'upgrade' ? (
            <UpgradeContent onUpgrade={onUpgrade} onClose={onClose} />
          ) : (
            <SignInContent
              email={email}
              setEmail={setEmail}
              loading={loading}
              error={error}
              success={success}
              onSubmit={handleSubmit}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SignInContent = ({ email, setEmail, loading, error, success, onSubmit }) => (
  <>
    <p className="text-zinc-400 mb-6">
      Enter your email to save your reflections and access them anywhere.
    </p>

    {success ? (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Check className="text-green-400" size={32} />
        </motion.div>
        <p className="text-white font-medium">You're in!</p>
        <p className="text-zinc-500 text-sm mt-1">Redirecting...</p>
      </div>
    ) : (
      <form onSubmit={onSubmit}>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-10 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-white text-black font-medium py-3 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Continue with Email'}
        </button>

        <p className="text-zinc-600 text-xs text-center mt-4">
          No password needed. Your data stays on your device.
        </p>
      </form>
    )}
  </>
);

const UpgradeContent = ({ onUpgrade, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    // In v1.1, this opens Stripe checkout
    // For now, simulate upgrade
    await new Promise(r => setTimeout(r, 1000));
    onUpgrade();
    onClose();
  };

  return (
    <>
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-400" size={20} />
          <span className="text-purple-300 font-semibold">Pro Plan</span>
          <span className="ml-auto text-2xl font-bold text-white">${TIERS.PRO.price}<span className="text-sm font-normal text-zinc-400">/mo</span></span>
        </div>

        <ul className="space-y-2">
          {[
            'Unlimited reflections',
            'Conversation history saved',
            'Export your insights',
            'Priority response time',
            'Early access to voice mode',
          ].map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-zinc-300 text-sm">
              <Check size={16} className="text-purple-400" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Upgrade Now'}
      </button>

      <p className="text-zinc-600 text-xs text-center mt-4">
        Cancel anytime. Secure payment via Stripe.
      </p>
    </>
  );
};

export default AuthModal;
