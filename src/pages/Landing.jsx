/**
 * ⟡ LANDING PAGE — Mobile-First Conversion Page
 * v2.0 — Fully responsive
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Eye, MessageCircle, Check, Github, ExternalLink, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Nav - Mobile Responsive */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">⟡</span>
            <span className="font-semibold text-sm sm:text-base">Active Mirror</span>
          </Link>
          
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4 md:gap-6">
            <Link to="/pricing" className="text-zinc-400 hover:text-white text-sm transition">Pricing</Link>
            <Link to="/confessions" className="text-zinc-400 hover:text-white text-sm transition">Confessions</Link>
            <a href="https://github.com/MirrorDNA-Reflection-Protocol" target="_blank" className="text-zinc-400 hover:text-white transition">
              <Github size={18} />
            </a>
            <Link to="/mirror" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition">
              Try Free
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-zinc-400 hover:text-white"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        
        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-t border-zinc-800 bg-black/95"
            >
              <div className="px-4 py-4 space-y-3">
                <Link to="/pricing" onClick={() => setMenuOpen(false)} className="block text-zinc-300 py-2">Pricing</Link>
                <Link to="/confessions" onClick={() => setMenuOpen(false)} className="block text-zinc-300 py-2">Confessions</Link>
                <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/research/" onClick={() => setMenuOpen(false)} className="block text-zinc-300 py-2" target="_blank" rel="noopener noreferrer">Research</a>
                <a href="https://github.com/MirrorDNA-Reflection-Protocol" target="_blank" className="block text-zinc-300 py-2">GitHub</a>
                <Link to="/mirror" onClick={() => setMenuOpen(false)} className="block bg-white text-black px-4 py-3 rounded-lg text-center font-medium mt-4">
                  Try Free →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero - Mobile optimized */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 tracking-tight leading-tight">
              Think more clearly.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              AI that asks questions instead of giving answers.
              No advice. No manipulation. Just reflection.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4 mb-6 sm:mb-8 px-2">
              <Link
                to="/mirror"
                className="flex items-center justify-center gap-2 bg-white text-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold hover:bg-zinc-200 transition shadow-lg"
              >
                <span className="text-lg sm:text-xl">⟡</span>
                Start Reflecting
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/confessions"
                className="flex items-center justify-center gap-2 text-zinc-400 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-zinc-700 hover:border-zinc-500 hover:text-white transition"
              >
                <Eye size={18} />
                Watch Confessions
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600">
              5 free reflections per day. No account required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What makes it different */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Not another chatbot.
          </h2>
          <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                icon: MessageCircle,
                title: "Questions, not answers",
                description: "Active Mirror helps you think by asking the questions you need to hear."
              },
              {
                icon: Shield,
                title: "Protected by MirrorGate",
                description: "Every response passes through 16 rules. The AI can't lie without consequences."
              },
              {
                icon: Eye,
                title: "Visible gears",
                description: "See exactly what the AI tried to say but couldn't. Total transparency."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl sm:rounded-2xl p-5 sm:p-6"
              >
                <item.icon className="text-purple-400 mb-3 sm:mb-4" size={24} />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm sm:text-base">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Confession Booth CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Watch the AI confess.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
              We built a live feed of everything the AI tried to say but got blocked.
              Every rule triggered. Every temptation resisted. In real-time.
            </p>
            <Link
              to="/confessions"
              className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold border border-red-500/30 hover:bg-red-500/30 transition text-sm sm:text-base"
            >
              <Eye size={16} />
              activemirror.ai/confessions
              <ExternalLink size={12} />
            </Link>
            <p className="text-xs sm:text-sm text-zinc-600 mt-3 sm:mt-4">
              No one else shows you this.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            How it works
          </h2>
          <div className="space-y-5 sm:space-y-8">
            {[
              { step: "1", title: "You share what's on your mind", description: "A decision, a feeling, a situation you're navigating." },
              { step: "2", title: "The Mirror asks questions", description: "Not advice. Not opinions. Questions that help you see clearly." },
              { step: "3", title: "MirrorGate watches everything", description: "If the AI tries to claim authority or give unsolicited advice — blocked." },
              { step: "4", title: "You think for yourself", description: "The goal is to help you find your own answers." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4 sm:gap-6"
              >
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-300 font-bold text-sm sm:text-base">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-zinc-400 text-sm sm:text-base">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Simple pricing</h2>
          <p className="text-zinc-400 mb-8 sm:mb-12 text-sm sm:text-base">Start free. Upgrade when you need more.</p>
          
          <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-left">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Free</h3>
              <div className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">$0</div>
              <ul className="space-y-2 text-zinc-400 text-sm sm:text-base">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-400 flex-shrink-0" /> 5 reflections/day</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-400 flex-shrink-0" /> MirrorGate protection</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-400 flex-shrink-0" /> No account needed</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-left">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Pro</h3>
              <div className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">$10<span className="text-base sm:text-lg font-normal text-zinc-400">/mo</span></div>
              <ul className="space-y-2 text-zinc-300 text-sm sm:text-base">
                <li className="flex items-center gap-2"><Check size={14} className="text-purple-400 flex-shrink-0" /> Unlimited reflections</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-purple-400 flex-shrink-0" /> Conversation history</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-purple-400 flex-shrink-0" /> Export insights</li>
              </ul>
            </div>
          </div>
          
          <Link to="/pricing" className="inline-block mt-6 sm:mt-8 text-zinc-400 hover:text-white transition text-sm sm:text-base">
            Compare plans →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Ready to reflect?</h2>
          <p className="text-zinc-400 mb-6 sm:mb-8 text-sm sm:text-base">
            No signup required. Your first 5 reflections are free.
          </p>
          <Link
            to="/mirror"
            className="inline-flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold hover:bg-zinc-200 transition shadow-lg text-base sm:text-lg"
          >
            <span className="text-lg sm:text-xl">⟡</span>
            Start Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <span className="text-lg">⟡</span>
            <span>Active Mirror by N1 Intelligence</span>
          </div>
          <div className="flex gap-4 sm:gap-6 text-zinc-500 text-sm">
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <a href="https://mirrordna-reflection-protocol.github.io/MirrorDNA-Docs/research/" className="hover:text-white transition" target="_blank" rel="noopener noreferrer">Research</a>
            <a href="https://github.com/MirrorDNA-Reflection-Protocol" className="hover:text-white transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
