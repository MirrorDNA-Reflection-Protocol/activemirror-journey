/**
 * Live Pulse — Real-time heartbeat of a sovereign AI system
 *
 * Data: src/data/pulse.json (auto-synced from system briefing API)
 */

import React, { useState, useEffect } from 'react';
import {
    Activity, Server, HardDrive, Cpu, Globe, GitBranch,
    Calendar, Smartphone, Shield, Zap, Radio
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useTheme } from '../contexts/ThemeContext';
import pulseData from '../data/pulse.json';

const getColors = (theme) => ({
    textPrimary: theme === 'dark' ? '#ffffff' : '#18181b',
    textSecondary: theme === 'dark' ? '#a1a1aa' : '#52525b',
});

function MetricCard({ icon: Icon, label, value, status, theme }) {
    const colors = getColors(theme);
    const statusColor = status === 'good' ? '#22c55e' : status === 'warn' ? '#f59e0b' : status === 'error' ? '#ef4444' : colors.textSecondary;

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={16} color={statusColor} />
                <span style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: 'monospace',
                }}>
                    {label}
                </span>
            </div>
            <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: statusColor,
                fontFamily: 'monospace',
                lineHeight: 1,
            }}>
                {value}
            </div>
        </div>
    );
}

export default function LivePulse() {
    const { theme } = useTheme();
    const colors = getColors(theme);
    const [pulse] = useState(pulseData || {});
    const [timeSince, setTimeSince] = useState('');

    useEffect(() => {
        const update = () => {
            if (pulse.timestamp) {
                const diff = Date.now() - new Date(pulse.timestamp).getTime();
                const mins = Math.floor(diff / 60000);
                if (mins < 1) setTimeSince('just now');
                else if (mins < 60) setTimeSince(mins + 'm ago');
                else setTimeSince(Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm ago');
            }
        };
        update();
        const interval = setInterval(update, 30000);
        return () => clearInterval(interval);
    }, [pulse.timestamp]);

    const alive = pulse.alive !== false;
    const servicesUp = pulse.services?.up || 0;
    const servicesDown = pulse.services?.down || 0;
    const shipsToday = pulse.ships_today || 0;

    return (
        <PageLayout>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '60px 24px 120px',
            }}>
                {/* Header */}
                <div style={{ marginBottom: '48px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '16px',
                    }}>
                        <Radio size={24} color={alive ? '#22c55e' : '#ef4444'} />
                        <h1 style={{
                            fontSize: '36px',
                            fontWeight: '800',
                            color: colors.textPrimary,
                            margin: 0,
                            letterSpacing: '-0.02em',
                        }}>
                            Live Pulse
                        </h1>
                    </div>

                    <p style={{
                        fontSize: '18px',
                        color: colors.textSecondary,
                        lineHeight: 1.6,
                        margin: '0 0 24px 0',
                    }}>
                        Real-time heartbeat of a sovereign AI operating system.
                        Running on a Mac Mini M4 in Goa, India. No cloud. No API keys.
                        Just hardware, code, and intent.
                    </p>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        flexWrap: 'wrap',
                    }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: alive ? '#22c55e' : '#ef4444',
                                animation: alive ? 'livepulse 2s ease-in-out infinite' : 'none',
                            }} />
                            <span style={{
                                fontSize: '14px',
                                fontFamily: 'monospace',
                                color: alive ? '#22c55e' : '#ef4444',
                                letterSpacing: '0.05em',
                            }}>
                                {alive ? 'SYSTEM ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                        {timeSince && (
                            <span style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                fontFamily: 'monospace',
                            }}>
                                Last pulse: {timeSince}
                            </span>
                        )}
                    </div>
                </div>

                {/* Heartbeat SVG */}
                {alive && (
                    <svg viewBox="0 0 400 60" style={{ width: '100%', height: '60px', opacity: 0.3 }}>
                        <path
                            d="M0,30 L80,30 L100,10 L120,50 L140,20 L160,40 L180,30 L400,30"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2"
                        />
                    </svg>
                )}

                {/* Metrics Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                    marginTop: '32px',
                }}>
                    <MetricCard icon={Server} label="Services" value={servicesUp + '\u2191' + (servicesDown > 0 ? ' ' + servicesDown + '\u2193' : '')} status={servicesDown === 0 ? 'good' : 'warn'} theme={theme} />
                    <MetricCard icon={Zap} label="Ships Today" value={shipsToday} status={shipsToday > 0 ? 'good' : 'neutral'} theme={theme} />
                    <MetricCard icon={HardDrive} label="Disk" value={pulse.disk_pct != null ? pulse.disk_pct + '%' : '\u2014'} status={pulse.disk_pct > 85 ? 'warn' : 'good'} theme={theme} />
                    <MetricCard icon={Cpu} label="Memory" value={pulse.memory_pct != null ? pulse.memory_pct + '%' : '\u2014'} status={pulse.memory_pct > 85 ? 'warn' : 'good'} theme={theme} />
                    <MetricCard icon={Globe} label="Domains" value={pulse.domains_up ? 'All Up' : 'Issue'} status={pulse.domains_up ? 'good' : 'error'} theme={theme} />
                    <MetricCard icon={GitBranch} label="Repos Active" value={(pulse.git?.dirty || 0) + ' dirty'} status="neutral" theme={theme} />
                    <MetricCard icon={Calendar} label="Upcoming" value={(pulse.upcoming_events || 0) + ' events'} status="neutral" theme={theme} />
                    <MetricCard icon={Smartphone} label="Pixel 9 Pro XL" value={pulse.phone_pixel_battery != null ? pulse.phone_pixel_battery + '%' : '\u2014'} status={pulse.phone_pixel_battery != null && pulse.phone_pixel_battery < 20 ? 'warn' : 'good'} theme={theme} />
                    <MetricCard icon={Smartphone} label="OnePlus 15" value={pulse.phone_oneplus_battery != null ? pulse.phone_oneplus_battery + '%' : '\u2014'} status={pulse.phone_oneplus_battery != null && pulse.phone_oneplus_battery < 20 ? 'warn' : 'good'} theme={theme} />
                    <MetricCard icon={Shield} label="Fact Integrity" value={pulse.fact_violations === 0 ? 'Clean' : pulse.fact_violations + ' issues'} status={pulse.fact_violations === 0 ? 'good' : 'error'} theme={theme} />
                    <MetricCard icon={Activity} label="Open Loops" value={pulse.open_loops || 0} status="neutral" theme={theme} />
                </div>

                {/* Philosophy Section */}
                <div style={{
                    marginTop: '64px',
                    padding: '32px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: colors.textPrimary,
                        marginBottom: '16px',
                    }}>
                        What you're seeing
                    </h2>
                    <div style={{
                        fontSize: '15px',
                        color: colors.textSecondary,
                        lineHeight: 1.8,
                    }}>
                        <p style={{ margin: '0 0 12px' }}>
                            This is a sovereign AI system — 116 repositories, 17 local models,
                            6 sentinels, running entirely on consumer hardware. No cloud compute.
                            No vendor lock-in. Every inference, every decision, every byte of data
                            stays on the machine.
                        </p>
                        <p style={{ margin: '0 0 12px' }}>
                            The pulse updates every few minutes from the live system. Services cycle.
                            Ships land. Sentinels scan. Agents hand off context to each other through
                            a memory bus that IS the system's identity.
                        </p>
                        <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.7 }}>
                            The model is interchangeable. The bus is identity.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes livepulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.4); opacity: 0.6; }
                }
            `}</style>
        </PageLayout>
    );
}
