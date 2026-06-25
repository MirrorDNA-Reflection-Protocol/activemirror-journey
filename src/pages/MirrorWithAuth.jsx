/**
 * ⟡ MIRROR WITH AUTH — Wrapper that adds auth + usage limits to Mirror
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Sparkles, Crown } from 'lucide-react';
import Mirror from './Mirror';
import AuthModal from '../components/AuthModal';
import UsageLimitBanner from '../components/UsageLimitBanner';
import ConsentGate from '../components/ConsentGate';
import {
  getUser,
  signOut,
  upgradeToPro,
  canSendMessage,
  incrementUsage,
  isProUser
} from '../lib/auth';

const MirrorWithAuth = () => {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [usageState, setUsageState] = useState({ allowed: true, remaining: 5 });
  const [hasConsented, setHasConsented] = useState(false);

  if (!hasConsented) return <ConsentGate onConsent={() => setHasConsented(true)} />;

  // Load user on mount
  useEffect(() => {
    const stored = getUser();
    if (stored) {
      setUser(stored);
      updateUsageState(stored);
    }
  }, []);

  const updateUsageState = (currentUser) => {
    const state = canSendMessage(currentUser);
    setUsageState(state);
  };

  const handleAuth = (newUser) => {
    setUser(newUser);
    updateUsageState(newUser);
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
    setUsageState({ allowed: true, remaining: 5 });
  };

  const handleUpgrade = () => {
    if (!user) {
      setAuthMode('signin');
      setShowAuth(true);
      return;
    }
    setAuthMode('upgrade');
    setShowAuth(true);
  };

  const handleUpgradeComplete = () => {
    const upgraded = upgradeToPro(user);
    setUser(upgraded);
    updateUsageState(upgraded);
  };

  // Track message sends for usage limits
  const handleMessageSent = () => {
    if (user) {
      incrementUsage(user.id);
      updateUsageState(user);
    } else {
      // Anonymous usage tracking
      const anonUsage = JSON.parse(localStorage.getItem('mirror_anon_usage') || '{}');
      const today = new Date().toISOString().split('T')[0];
      anonUsage[today] = (anonUsage[today] || 0) + 1;
      localStorage.setItem('mirror_anon_usage', JSON.stringify(anonUsage));

      const remaining = 5 - anonUsage[today];
      setUsageState({
        allowed: remaining > 0,
        remaining: Math.max(0, remaining),
        reason: remaining <= 0 ? 'daily_limit' : null,
        limit: 5,
      });
    }
  };

  return (
    <div className="relative">
      {/* User Menu - Top Right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            {isProUser(user) && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-xs px-2 py-1 rounded-full">
                <Crown size={12} />
                Pro
              </span>
            )}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-full px-3 py-1.5 text-sm text-zinc-300 hover:text-white transition">
                <User size={14} />
                <span className="max-w-[100px] truncate">{user.email.split('@')[0]}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[150px]">
                  {!isProUser(user) && (
                    <button
                      onClick={handleUpgrade}
                      className="w-full text-left px-4 py-2 text-sm text-purple-400 hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      Upgrade
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setAuthMode('signin'); setShowAuth(true); }}
            className="flex items-center gap-2 bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-full px-4 py-1.5 text-sm text-zinc-300 hover:text-white transition"
          >
            <User size={14} />
            Sign in
          </button>
        )}
      </div>

      {/* Usage Limit Banner */}
      {!usageState.allowed && (
        <div className="fixed top-16 left-0 right-0 z-40">
          <UsageLimitBanner
            remaining={usageState.remaining}
            limit={usageState.limit || 5}
            onUpgrade={handleUpgrade}
            onSignIn={() => { setAuthMode('signin'); setShowAuth(true); }}
            isSignedIn={!!user}
          />
        </div>
      )}

      {/* Low usage warning */}
      {usageState.allowed && usageState.remaining <= 2 && usageState.remaining > 0 && !isProUser(user) && (
        <div className="fixed top-16 left-0 right-0 z-40">
          <UsageLimitBanner
            remaining={usageState.remaining}
            limit={5}
            onUpgrade={handleUpgrade}
            onSignIn={() => { setAuthMode('signin'); setShowAuth(true); }}
            isSignedIn={!!user}
          />
        </div>
      )}

      {/* The actual Mirror component */}
      <Mirror
        onMessageSent={handleMessageSent}
        disabled={!usageState.allowed}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuth={handleAuth}
        mode={authMode}
        onUpgrade={handleUpgradeComplete}
      />
    </div>
  );
};

export default MirrorWithAuth;
