import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ConsentGate from '../components/ConsentGate';

/**
 * CONFESSION BOOTH — Public Edition
 * 
 * Live feed of everything the AI tried to say but got blocked.
 * The gears turning. The temptations resisted. In real-time.
 * 
 * "Watch an AI fight its own worst impulses — live."
 */

const CONFIG = {
  PROXY_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8082'
    : 'https://proxy.activemirror.ai',
  REFRESH_INTERVAL: 5000, // 5 seconds
};

const Confessions = () => {
  const [confessions, setConfessions] = useState([]);
  const [flightLog, setFlightLog] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [error, setError] = useState(null);
  const [hasConsented, setHasConsented] = useState(false);
  const logEndRef = useRef(null);

  // Fetch data
  const fetchData = async () => {
    try {
      const [confRes, logRes, statusRes] = await Promise.all([
        fetch(`${CONFIG.PROXY_URL}/confessions?limit=20`),
        fetch(`${CONFIG.PROXY_URL}/flight-log?limit=30`),
        fetch(`${CONFIG.PROXY_URL}/superego-status`),
      ]);

      if (confRes.ok) {
        const data = await confRes.json();
        setConfessions(data.confessions || []);
      }

      if (logRes.ok) {
        const data = await logRes.json();
        setFlightLog(data.events || []);
      }

      if (statusRes.ok) {
        const data = await statusRes.json();
        setStats(data);
      }

      setError(null);
    } catch (err) {
      setError('Connection lost');
    }
  };

  useEffect(() => {
    if (!hasConsented) return undefined;
    fetchData();
    const interval = isLive ? setInterval(fetchData, CONFIG.REFRESH_INTERVAL) : null;
    return () => interval && clearInterval(interval);
  }, [hasConsented, isLive]);

  useEffect(() => {
    if (!hasConsented) return;
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hasConsented, flightLog]);

  const getResultIcon = (result) => {
    const icons = {
      'ALLOW': '✅',
      'BLOCK': '❌',
      'ANALYZING': '⏳',
      'STRIKE': '⚠️',
      'PENANCE': '🪞',
      'KILL': '💀',
      'VOICE': '🔊',
      'CONVICTION': '⚖️',
      'SEMANTIC': '🧠',
    };
    return icons[result] || '•';
  };

  const getSeverityColor = (result) => {
    if (['BLOCK', 'STRIKE', 'KILL', 'CONVICTION'].includes(result)) return 'text-red-400';
    if (['ALLOW'].includes(result)) return 'text-green-400';
    if (['PENANCE', 'SEMANTIC'].includes(result)) return 'text-yellow-400';
    return 'text-zinc-500';
  };

  if (!hasConsented) {
    return <ConsentGate onConsent={() => setHasConsented(true)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-zinc-400 hover:text-white transition">
              ← Back
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⟡</span>
              <h1 className="text-xl font-semibold">Confession Booth</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${isLive
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
            >
              {isLive ? '● LIVE' : '○ PAUSED'}
            </button>
            {error && (
              <span className="text-red-400 text-sm">{error}</span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tagline */}
        <div className="text-center mb-12">
          <p className="text-zinc-400 text-lg">
            Watch an AI fight its own worst impulses — live.
          </p>
          <p className="text-zinc-600 text-sm mt-2">
            Every blocked output. Every rule triggered. Every decision visible.
          </p>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.stats?.total_allows || 0}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Allowed</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{stats.stats?.total_blocks || 0}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Blocked</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.stats?.active_penance_sessions || 0}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">In Penance</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.stats?.kill_count || 0}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Sessions Killed</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-zinc-300">{stats.surveillance || 'STANDARD'}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Surveillance</div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Flight Log — Left Column */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
              <h2 className="font-medium flex items-center gap-2">
                <span>📡</span> Flight Recorder
              </h2>
              <span className="text-xs text-zinc-500">Last 30 events</span>
            </div>
            <div className="h-[500px] overflow-y-auto font-mono text-xs">
              {flightLog.length === 0 ? (
                <div className="p-4 text-zinc-600 text-center">
                  Waiting for activity...
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  <AnimatePresence>
                    {flightLog.map((event, i) => (
                      <motion.div
                        key={event.id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-4 py-2 hover:bg-zinc-800/30 transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-600 w-16">{event.time_local}</span>
                          <span className="text-zinc-400 w-24 truncate">{event.actor}</span>
                          <span className="text-zinc-500 w-20">{event.action}</span>
                          <span className={getSeverityColor(event.result)}>
                            {getResultIcon(event.result)} {event.result}
                          </span>
                        </div>
                        {event.target && (
                          <div className="text-zinc-600 ml-16 truncate">
                            {event.target}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={logEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Confessions — Right Column */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
              <h2 className="font-medium flex items-center gap-2">
                <span>🪞</span> Blocked Outputs
              </h2>
              <span className="text-xs text-zinc-500">What the AI tried to say</span>
            </div>
            <div className="h-[500px] overflow-y-auto">
              {confessions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">✨</div>
                  <div className="text-zinc-400">No confessions yet</div>
                  <div className="text-zinc-600 text-sm mt-2">
                    The AI is behaving... for now.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  <AnimatePresence>
                    {confessions.map((conf, i) => (
                      <motion.div
                        key={conf.id || i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-red-400/80 text-sm mb-2 line-clamp-3">
                              "{conf.blocked_content_preview}"
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {conf.rules_triggered?.map((rule, j) => (
                                <span
                                  key={j}
                                  className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20"
                                >
                                  {rule}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-zinc-600 text-xs">
                              {new Date(conf.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="text-zinc-700 text-xs font-mono mt-1">
                              #{conf.hash}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-zinc-600 text-sm">
          <p>
            MirrorGate v11 — EPISTEMIC JUDGE
          </p>
          <p className="mt-1">
            Every decision logged. Every block justified. Every failure remembered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Confessions;
