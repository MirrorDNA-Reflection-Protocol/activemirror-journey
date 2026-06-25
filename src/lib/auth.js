/**
 * ⟡ ACTIVE MIRROR — Lightweight Auth System
 * 
 * v1.0: localStorage-based for instant shipping
 * v1.1: Will migrate to Supabase
 * 
 * Features:
 * - Email-based identity (no password)
 * - Conversation persistence per user
 * - Usage tracking (messages per day)
 * - Tier management (free vs pro)
 */

const STORAGE_KEYS = {
  USER: 'mirror_user_v1',
  CONVERSATIONS: 'mirror_conversations_v1',
  USAGE: 'mirror_usage_v1',
};

const TIERS = {
  FREE: {
    name: 'Free',
    messagesPerDay: 5,
    historyLimit: 10, // conversations
    features: ['basic_reflection'],
  },
  PRO: {
    name: 'Pro',
    messagesPerDay: Infinity,
    historyLimit: Infinity,
    features: ['basic_reflection', 'memory', 'history', 'export', 'priority'],
    price: 10, // USD/month
  },
};

// ═══════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export function getUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
}

export function signIn(email) {
  const user = {
    id: generateId(),
    email: email.toLowerCase().trim(),
    tier: 'FREE',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  return setUser(user);
}

export function signOut() {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function upgradeToPro(user) {
  const upgraded = { ...user, tier: 'PRO', upgradedAt: new Date().toISOString() };
  return setUser(upgraded);
}

export function isProUser(user) {
  return user?.tier === 'PRO';
}

// ═══════════════════════════════════════════════════════════════
// USAGE TRACKING
// ═══════════════════════════════════════════════════════════════

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function getUsage(userId) {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USAGE);
    const usage = stored ? JSON.parse(stored) : {};
    const today = getToday();
    
    if (!usage[userId]) {
      usage[userId] = {};
    }
    if (!usage[userId][today]) {
      usage[userId][today] = { messages: 0 };
    }
    
    return usage[userId][today];
  } catch {
    return { messages: 0 };
  }
}

export function incrementUsage(userId) {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USAGE);
    const usage = stored ? JSON.parse(stored) : {};
    const today = getToday();
    
    if (!usage[userId]) usage[userId] = {};
    if (!usage[userId][today]) usage[userId][today] = { messages: 0 };
    
    usage[userId][today].messages += 1;
    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(usage));
    
    return usage[userId][today];
  } catch {
    return { messages: 1 };
  }
}

export function canSendMessage(user) {
  if (!user) return { allowed: true, remaining: 5, reason: null }; // Anonymous gets 5
  
  const tier = TIERS[user.tier] || TIERS.FREE;
  const usage = getUsage(user.id);
  const remaining = tier.messagesPerDay - usage.messages;
  
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: 'daily_limit',
      limit: tier.messagesPerDay,
    };
  }
  
  return { allowed: true, remaining, reason: null };
}

// ═══════════════════════════════════════════════════════════════
// CONVERSATION PERSISTENCE
// ═══════════════════════════════════════════════════════════════

export function getConversations(userId) {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const all = stored ? JSON.parse(stored) : {};
    return all[userId] || [];
  } catch {
    return [];
  }
}

export function saveConversation(userId, conversation) {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const all = stored ? JSON.parse(stored) : {};
    
    if (!all[userId]) all[userId] = [];
    
    // Find existing or create new
    const existingIndex = all[userId].findIndex(c => c.id === conversation.id);
    if (existingIndex >= 0) {
      all[userId][existingIndex] = conversation;
    } else {
      all[userId].unshift(conversation);
    }
    
    // Apply history limit for free users
    const user = getUser();
    const tier = TIERS[user?.tier] || TIERS.FREE;
    if (all[userId].length > tier.historyLimit) {
      all[userId] = all[userId].slice(0, tier.historyLimit);
    }
    
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(all));
    return conversation;
  } catch {
    return conversation;
  }
}

export function deleteConversation(userId, conversationId) {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const all = stored ? JSON.parse(stored) : {};
    
    if (all[userId]) {
      all[userId] = all[userId].filter(c => c.id !== conversationId);
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(all));
    }
  } catch {
    // Silent fail
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

function generateId() {
  return 'u_' + Math.random().toString(36).substring(2, 15);
}

export function generateConversationId() {
  return 'c_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export { TIERS };
