/**
 * ⟡ Skills & Capabilities — Complete MirrorDNA Command Reference
 * 40 skills, 46 daemons, 116 repos, 9 plugins
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal, GitCommit, Rocket, FileText, Activity, Clock,
    Search, History, Shield, Database, Zap, Send, Brain,
    RefreshCw, Archive, AlertTriangle, Globe, Book,
    Layers, Eye, Target, MessageSquare, ArrowRight, Github,
    CheckCircle, ChevronDown, ChevronRight, Server, Cpu,
    Radio, Bell, Lock, Settings, Play, Code, Wifi, Heart,
    Sun, Moon, Inbox, Tag, TestTube, GitPullRequest, Network,
    HardDrive, Bot, Sparkles, ExternalLink, Copy
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useTheme } from '../contexts/ThemeContext';

// All 40 slash commands
const allSkills = [
    // Workflow
    { name: '/commit', desc: 'Smart commit with auto-generated ⟡ messages', category: 'workflow', icon: GitCommit },
    { name: '/ship', desc: 'Commit, push, and complete in one command', category: 'workflow', icon: Rocket },
    { name: '/deploy', desc: 'Deploy LaunchAgents with hardening standards', category: 'workflow', icon: Server },
    { name: '/pr', desc: 'Create pull request via gh with context', category: 'workflow', icon: GitPullRequest },
    { name: '/review', desc: 'Review PR or local changes with AI analysis', category: 'workflow', icon: Eye },
    { name: '/release', desc: 'Full release: tag, notes, publish to GitHub', category: 'workflow', icon: Rocket },
    { name: '/test', desc: 'Auto-detect framework, run tests, report results', category: 'workflow', icon: TestTube },
    { name: '/scaffold', desc: 'Create new project with MirrorDNA patterns', category: 'workflow', icon: Layers },

    // Intelligence
    { name: '/brief', desc: 'Sovereign briefing from HN, tech, crypto signals', category: 'intelligence', icon: FileText },
    { name: '/research', desc: 'Deep research across web and Vault', category: 'intelligence', icon: Search },
    { name: '/reflect', desc: 'Meta-analysis: patterns, insights, next moves', category: 'intelligence', icon: Brain },
    { name: '/draft', desc: 'Draft content for any platform', category: 'intelligence', icon: MessageSquare },
    { name: '/focus', desc: 'Set project focus, scope subsequent commands', category: 'intelligence', icon: Target },
    { name: '/spec', desc: 'Draft spec document with sections + checklist', category: 'intelligence', icon: FileText },

    // State & Memory
    { name: '/bus', desc: 'Direct Memory Bus interface — source of truth', category: 'state', icon: Database },
    { name: '/handoff', desc: 'Write handoff for next client to continue', category: 'state', icon: Send },
    { name: '/pickup', desc: 'Resume from last handoff without asking', category: 'state', icon: RefreshCw },
    { name: '/history', desc: 'Session history from ledger and bus', category: 'state', icon: History },
    { name: '/note', desc: 'Quick capture to Inbox with frontmatter', category: 'state', icon: FileText },
    { name: '/status', desc: 'Quick status: bus phase, inbox, git dirty', category: 'state', icon: Activity },
    { name: '/sync', desc: 'Synchronize state across all clients', category: 'state', icon: RefreshCw },

    // Infrastructure
    { name: '/health', desc: 'Check all MirrorDNA services and ports', category: 'infra', icon: Activity },
    { name: '/services', desc: 'List, start, stop MirrorDNA services', category: 'infra', icon: Server },
    { name: '/logs', desc: 'Tail service logs for debugging', category: 'infra', icon: Terminal },
    { name: '/backup', desc: 'Vault backup operations and verification', category: 'infra', icon: Archive },
    { name: '/emergency', desc: 'Emergency triage: freeze, clear, bulk park', category: 'infra', icon: AlertTriangle },
    { name: '/network', desc: 'Tailscale, ports, SC1 bridges, DNS checks', category: 'infra', icon: Wifi },

    // Vault & Knowledge
    { name: '/find', desc: 'Smart search by layer: Canonical → Active → Archive', category: 'vault', icon: Search },
    { name: '/read', desc: 'Follow curated read paths through Vault', category: 'vault', icon: Book },
    { name: '/compress', desc: 'Find version chains, draft compression nodes', category: 'vault', icon: Archive },
    { name: '/glossary', desc: 'Look up or add MirrorDNA vocabulary', category: 'vault', icon: Book },
    { name: '/link', desc: 'Create and repair bidirectional Vault links', category: 'vault', icon: Layers },
    { name: '/tag', desc: 'Manage Vault tags, check duplicates', category: 'vault', icon: Tag },
    { name: '/audit', desc: 'Vault health audit with dashboard', category: 'vault', icon: Shield },
    { name: '/decay', desc: 'Check staleness thresholds by layer', category: 'vault', icon: Clock },
    { name: '/triage', desc: 'Auto-classify and move Inbox items', category: 'vault', icon: Inbox },

    // Operations
    { name: '/standup', desc: 'Morning briefing: overnight, state, priorities', category: 'ops', icon: Sun },
    { name: '/overnight', desc: 'Queue background agent tasks for later', category: 'ops', icon: Moon },
    { name: '/changelog', desc: 'Generate changelog from git history', category: 'ops', icon: FileText },
    { name: '/inbox-zero', desc: 'Process ALL pending until zero remains', category: 'ops', icon: Inbox },
];

// 46 automated daemons
const daemons = [
    { name: 'brain.api', desc: 'MirrorBrain cognitive engine', port: 8100, category: 'core' },
    { name: 'mirror-api', desc: 'Reflection API service', port: 8096, category: 'core' },
    { name: 'brief.api', desc: 'Briefing generation service', port: 8200, category: 'core' },
    { name: 'mcp-server', desc: 'Model Context Protocol server', port: 8081, category: 'core' },
    { name: 'hub', desc: 'Central orchestration hub', port: 8087, category: 'core' },
    { name: 'dashboard', desc: 'Status dashboard UI', port: 8088, category: 'core' },
    { name: 'rag-server', desc: 'Retrieval augmented generation', port: 8089, category: 'core' },

    { name: 'bus-sync', desc: 'Memory Bus synchronization', category: 'state' },
    { name: 'bus-maintenance', desc: 'Bus integrity checks', category: 'state' },
    { name: 'constraint-sync', desc: 'Constraint propagation', category: 'state' },
    { name: 'registry', desc: 'Service registry', category: 'state' },

    { name: 'health-watcher', desc: 'Continuous health monitoring', category: 'monitoring' },
    { name: 'heartbeat', desc: 'Liveness heartbeat', category: 'monitoring' },
    { name: 'sentinel', desc: 'Security sentinel', category: 'monitoring' },
    { name: 'watchdog', desc: 'Process watchdog', category: 'monitoring' },
    { name: 'fleet-watchdog', desc: 'Multi-device fleet watch', category: 'monitoring' },
    { name: 'canary-pulse', desc: 'Canary health checks', category: 'monitoring' },

    { name: 'backup', desc: 'Automated backups', category: 'maintenance' },
    { name: 'backup-verify', desc: 'Backup integrity verification', category: 'maintenance' },
    { name: 'log-rotate', desc: 'Log rotation', category: 'maintenance' },
    { name: 'decay', desc: 'Staleness cleanup', category: 'maintenance' },
    { name: 'doc-velocity', desc: 'Documentation velocity tracking', category: 'maintenance' },

    { name: 'git-autopush', desc: 'Automatic git pushes', category: 'automation' },
    { name: 'site-deploy', desc: 'Fortnightly site deployments', category: 'automation' },
    { name: 'cast.scheduler', desc: 'Scheduled message delivery', category: 'automation' },
    { name: 'morning-digest', desc: 'Daily morning briefing', category: 'automation' },
    { name: 'overnight', desc: 'Overnight task runner', category: 'automation' },
    { name: 'weekly-audit', desc: 'Weekly audit reports', category: 'automation' },
    { name: 'weekly-review', desc: 'Weekly review generation', category: 'automation' },
    { name: 'velocity-digest', desc: 'Velocity metrics digest', category: 'automation' },

    { name: 'anticipation', desc: 'Predictive pre-loading', category: 'intelligence' },
    { name: 'dreaming', desc: 'Background synthesis', category: 'intelligence' },
    { name: 'mirrormind', desc: 'Cognitive daemon', category: 'intelligence' },
    { name: 'sense', desc: 'Context sensing', category: 'intelligence' },
    { name: 'task-router', desc: 'Intelligent task routing', category: 'intelligence' },
    { name: 'swarm-coordinator', desc: 'Multi-agent coordination', category: 'intelligence' },

    { name: 'cloudflared', desc: 'Cloudflare tunnel', category: 'network' },
    { name: 'mesh-agent', desc: 'Mesh network agent', category: 'network' },
    { name: 'mobile-chat', desc: 'Mobile chat bridge', category: 'network' },
    { name: 'sc1v2', desc: 'SC1 fleet communication', category: 'network' },

    { name: 'key-age-check', desc: 'Encryption key rotation', category: 'security' },
    { name: 'killswitch', desc: 'Emergency killswitch', category: 'security' },
    { name: 'dead-man-switch', desc: 'Dead man\'s switch', category: 'security' },
    { name: 'trust-audit', desc: 'Trust verification', category: 'security' },

    { name: 'audio-daemon', desc: 'Audio processing', category: 'media' },
    { name: 'screen-capture', desc: 'Screen capture service', category: 'media' },
];

// 9 skill plugin categories
const plugins = [
    { name: 'vault-operations', desc: 'Vault management skills', skills: 8 },
    { name: 'state-and-memory', desc: 'Memory Bus and state skills', skills: 6 },
    { name: 'git-workflow', desc: 'Git and deployment skills', skills: 7 },
    { name: 'infrastructure', desc: 'Service and system skills', skills: 5 },
    { name: 'vault-navigation', desc: 'Search and read paths', skills: 4 },
    { name: 'capture-and-content', desc: 'Note and draft skills', skills: 4 },
    { name: 'research-and-analysis', desc: 'Research and reflection', skills: 3 },
    { name: 'workflow-automation', desc: 'Automation and scheduling', skills: 5 },
    { name: 'development', desc: 'Testing and scaffolding', skills: 3 },
];

const categoryMeta = {
    workflow: { label: 'Workflow', color: 'purple', icon: GitCommit },
    intelligence: { label: 'Intelligence', color: 'cyan', icon: Brain },
    state: { label: 'State & Memory', color: 'emerald', icon: Database },
    infra: { label: 'Infrastructure', color: 'amber', icon: Server },
    vault: { label: 'Vault', color: 'pink', icon: Archive },
    ops: { label: 'Operations', color: 'blue', icon: Clock },
};

const daemonCategoryMeta = {
    core: { label: 'Core Services', color: 'purple' },
    state: { label: 'State Management', color: 'emerald' },
    monitoring: { label: 'Monitoring', color: 'amber' },
    maintenance: { label: 'Maintenance', color: 'blue' },
    automation: { label: 'Automation', color: 'cyan' },
    intelligence: { label: 'Intelligence', color: 'pink' },
    network: { label: 'Network', color: 'indigo' },
    security: { label: 'Security', color: 'red' },
    media: { label: 'Media', color: 'orange' },
};

function SkillRow({ skill, isDark }) {
    const [copied, setCopied] = useState(false);
    const Icon = skill.icon;
    const meta = categoryMeta[skill.category];

    const handleCopy = () => {
        navigator.clipboard.writeText(skill.name);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'
        }`}>
            <Icon size={18} className={`text-${meta.color}-400 flex-shrink-0`} />
            <code className={`font-mono font-semibold w-28 flex-shrink-0 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {skill.name}
            </code>
            <span className={`flex-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {skill.desc}
            </span>
            <button
                onClick={handleCopy}
                className={`p-1.5 rounded transition-colors ${
                    isDark ? 'hover:bg-white/10 text-zinc-500' : 'hover:bg-zinc-200 text-zinc-400'
                }`}
            >
                {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
        </div>
    );
}

export default function Skills() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [activeTab, setActiveTab] = useState('skills');
    const [skillFilter, setSkillFilter] = useState('all');

    const filteredSkills = skillFilter === 'all'
        ? allSkills
        : allSkills.filter(s => s.category === skillFilter);

    const groupedDaemons = Object.entries(daemonCategoryMeta).map(([key, meta]) => ({
        ...meta,
        key,
        daemons: daemons.filter(d => d.category === key)
    })).filter(g => g.daemons.length > 0);

    return (
        <PageLayout>
            {/* Hero */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                            <Terminal size={32} className="text-purple-400" />
                        </div>
                    </motion.div>

                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Skills & Capabilities
                    </h1>

                    <p className={`text-lg max-w-3xl mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        The complete MirrorDNA command system. 40 slash commands, 46 automated daemons,
                        116 repositories, and 9 skill plugins — all working together.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { value: '40', label: 'Slash Commands', icon: Terminal },
                            { value: '46', label: 'Daemons', icon: Server },
                            { value: '116', label: 'Repositories', icon: Github },
                            { value: '9', label: 'Plugins', icon: Layers },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className={`p-4 rounded-xl ${
                                    isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200'
                                }`}
                            >
                                <stat.icon size={20} className={`mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                    {stat.value}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'skills', label: 'Slash Commands', count: 40 },
                            { id: 'daemons', label: 'Daemons', count: 46 },
                            { id: 'automation', label: 'Automation', count: null },
                            { id: 'repos', label: 'Repositories', count: '116' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-purple-600 text-white'
                                        : isDark
                                            ? 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                            >
                                {tab.label}
                                {tab.count && (
                                    <span className="ml-2 text-xs opacity-70">({tab.count})</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-8 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Skills Tab */}
                        {activeTab === 'skills' && (
                            <motion.div
                                key="skills"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {/* Category Filter */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <button
                                        onClick={() => setSkillFilter('all')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            skillFilter === 'all'
                                                ? 'bg-purple-500 text-white'
                                                : isDark ? 'bg-white/5 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                                        }`}
                                    >
                                        All ({allSkills.length})
                                    </button>
                                    {Object.entries(categoryMeta).map(([key, meta]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSkillFilter(key)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                skillFilter === key
                                                    ? `bg-${meta.color}-500 text-white`
                                                    : isDark ? 'bg-white/5 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                                            }`}
                                        >
                                            {meta.label} ({allSkills.filter(s => s.category === key).length})
                                        </button>
                                    ))}
                                </div>

                                {/* Skills List */}
                                <div className={`rounded-xl border divide-y ${
                                    isDark ? 'bg-white/5 border-white/10 divide-white/5' : 'bg-white border-zinc-200 divide-zinc-100'
                                }`}>
                                    {filteredSkills.map((skill) => (
                                        <SkillRow key={skill.name} skill={skill} isDark={isDark} />
                                    ))}
                                </div>

                                {/* How to Use */}
                                <div className={`mt-8 p-6 rounded-xl ${
                                    isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'
                                }`}>
                                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        How to Use
                                    </h3>
                                    <p className={`text-sm mb-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                        Type any command in Claude Code to invoke it:
                                    </p>
                                    <code className={`block p-3 rounded-lg font-mono text-sm ${
                                        isDark ? 'bg-black/30 text-zinc-300' : 'bg-white text-zinc-800'
                                    }`}>
                                        /commit "Add new feature"<br/>
                                        /health<br/>
                                        /brief
                                    </code>
                                </div>
                            </motion.div>
                        )}

                        {/* Daemons Tab */}
                        {activeTab === 'daemons' && (
                            <motion.div
                                key="daemons"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {groupedDaemons.map((group) => (
                                    <div key={group.key}>
                                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                                            isDark ? 'text-white' : 'text-zinc-900'
                                        }`}>
                                            <span className={`w-3 h-3 rounded-full bg-${group.color}-500`} />
                                            {group.label}
                                            <span className={`text-sm font-normal ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                ({group.daemons.length})
                                            </span>
                                        </h3>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {group.daemons.map((daemon) => (
                                                <div
                                                    key={daemon.name}
                                                    className={`p-4 rounded-xl border ${
                                                        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        <code className={`text-sm font-mono font-medium ${
                                                            isDark ? 'text-white' : 'text-zinc-900'
                                                        }`}>
                                                            {daemon.name}
                                                        </code>
                                                        {daemon.port && (
                                                            <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                                :{daemon.port}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                        {daemon.desc}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className={`p-6 rounded-xl ${
                                    isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                                }`}>
                                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        All Running Automatically
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                        These services run as macOS LaunchAgents. Use <code>/services</code> to manage them
                                        or <code>/health</code> to check status.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Automation Tab */}
                        {activeTab === 'automation' && (
                            <motion.div
                                key="automation"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {/* Hooks */}
                                <div>
                                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        Hooks System
                                    </h3>
                                    <div className={`p-6 rounded-xl border ${
                                        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'
                                    }`}>
                                        <p className={`text-sm mb-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                            Hooks run automatically on events. Configure in <code>~/.claude/settings.json</code>:
                                        </p>
                                        <pre className={`p-4 rounded-lg text-xs font-mono overflow-x-auto ${
                                            isDark ? 'bg-black/30 text-zinc-300' : 'bg-zinc-100 text-zinc-800'
                                        }`}>{`{
  "hooks": {
    "UserPromptSubmit": [{
      "type": "command",
      "command": "gate_check.sh",
      "timeout": 5,
      "statusMessage": "Checking MirrorGate..."
    }]
  }
}`}</pre>
                                    </div>
                                </div>

                                {/* Scheduled Tasks */}
                                <div>
                                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        Scheduled Automation
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {[
                                            { name: 'Morning Digest', schedule: 'Daily 7am', desc: 'Briefing + priorities' },
                                            { name: 'Site Deploy', schedule: '1st & 15th', desc: 'Fortnightly deployments' },
                                            { name: 'Weekly Audit', schedule: 'Sundays', desc: 'Vault health report' },
                                            { name: 'Backup', schedule: 'Every 6h', desc: 'Incremental backups' },
                                            { name: 'Log Rotate', schedule: 'Daily', desc: 'Clean old logs' },
                                            { name: 'Decay Check', schedule: 'Weekly', desc: 'Staleness cleanup' },
                                        ].map((task) => (
                                            <div
                                                key={task.name}
                                                className={`p-4 rounded-xl border ${
                                                    isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                                        {task.name}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                                                    }`}>
                                                        {task.schedule}
                                                    </span>
                                                </div>
                                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                    {task.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Plugins */}
                                <div>
                                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        Skill Plugins (9 Categories)
                                    </h3>
                                    <div className="grid sm:grid-cols-3 gap-3">
                                        {plugins.map((plugin) => (
                                            <div
                                                key={plugin.name}
                                                className={`p-4 rounded-xl border ${
                                                    isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CheckCircle size={14} className="text-emerald-500" />
                                                    <code className={`text-xs font-mono ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                                        {plugin.name}
                                                    </code>
                                                </div>
                                                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                    {plugin.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Repos Tab */}
                        {activeTab === 'repos' && (
                            <motion.div
                                key="repos"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className={`p-6 rounded-xl mb-6 ${
                                    isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-zinc-200'
                                }`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Github size={24} className={isDark ? 'text-white' : 'text-zinc-900'} />
                                        <div>
                                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                                116 Repositories
                                            </h3>
                                            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                github.com/MirrorDNA-Reflection-Protocol
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href="https://github.com/MirrorDNA-Reflection-Protocol"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium"
                                    >
                                        <ExternalLink size={16} />
                                        Browse All Repos
                                    </a>
                                </div>

                                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                    Key Repositories
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        { name: 'MirrorDNA', desc: 'Core protocol specification' },
                                        { name: 'MirrorGate', desc: 'Sovereign inference control plane' },
                                        { name: 'MirrorBrain', desc: 'Cognitive engine' },
                                        { name: 'ActiveMirrorOS', desc: 'Consumer product layer' },
                                        { name: 'LingOS', desc: 'Language layer for dialogue' },
                                        { name: 'mirrorrecall', desc: 'Session memory' },
                                        { name: 'mirrordna-skills', desc: 'Skill system (this page!)' },
                                        { name: 'glyph-engine', desc: 'Cryptographic attestation' },
                                        { name: 'SCD-Protocol', desc: 'Structured Contextual Distillation' },
                                        { name: 'TrustByDesign', desc: 'Compliance framework' },
                                        { name: 'AgentDNA', desc: 'Agent personality encoding' },
                                        { name: 'Glyphtrail', desc: 'Interaction lineage logs' },
                                    ].map((repo) => (
                                        <a
                                            key={repo.name}
                                            href={`https://github.com/MirrorDNA-Reflection-Protocol/${repo.name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                                                isDark
                                                    ? 'bg-white/5 border-white/10 hover:border-purple-500/30'
                                                    : 'bg-white border-zinc-200 hover:border-purple-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Github size={14} className={isDark ? 'text-zinc-400' : 'text-zinc-500'} />
                                                <code className={`text-sm font-mono font-medium ${
                                                    isDark ? 'text-white' : 'text-zinc-900'
                                                }`}>
                                                    {repo.name}
                                                </code>
                                            </div>
                                            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                {repo.desc}
                                            </p>
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6">
                <div className={`max-w-3xl mx-auto text-center p-8 rounded-2xl ${
                    isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20'
                        : 'bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-200'
                }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Build Your Own
                    </h2>
                    <p className={`mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Skills are markdown files. Daemons are LaunchAgents. Everything is open source.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="https://github.com/MirrorDNA-Reflection-Protocol/mirrordna-skills"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium"
                        >
                            <Github size={18} />
                            Clone Skills Repo
                        </a>
                        <Link
                            to="/docs"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${
                                isDark
                                    ? 'bg-white/10 text-white hover:bg-white/20'
                                    : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300'
                            }`}
                        >
                            <Book size={18} />
                            Read Docs
                        </Link>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}
