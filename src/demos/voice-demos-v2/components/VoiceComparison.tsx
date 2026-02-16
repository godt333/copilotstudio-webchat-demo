/**
 * VoiceComparison Component
 * =========================
 * Decision flow diagram and feature comparison table for all voice integration options.
 * 
 * Options covered:
 * 1. Speech Ponyfill - Direct Line + client-side Speech SDK
 * 2. Proxy Bot - Middleware architecture for logging/auth
 * 3. Voice Live API - Server-side unified voice pipeline
 * 4. Telephony IVR - Phone-based IVR with Contact Center
 */

import React, { useState } from 'react';

// ─── Decision Flow Questions ─────────────────────────────────────────────────

interface DecisionNode {
  id: string;
  question: string;
  options: {
    label: string;
    nextId: string | null;
    recommendation?: string;
  }[];
}

const DECISION_TREE: DecisionNode[] = [
  {
    id: 'start',
    question: 'What is your primary interface?',
    options: [
      { label: '🌐 Web Browser', nextId: 'web-needs' },
      { label: '📞 Phone / PSTN', nextId: 'phone-result' },
    ],
  },
  {
    id: 'web-needs',
    question: 'Do you need server-side logging, custom auth, or message transformation?',
    options: [
      { label: '✅ Yes, I need middleware', nextId: 'middleware-ai' },
      { label: '❌ No, direct connection is fine', nextId: 'direct-ai' },
    ],
  },
  {
    id: 'middleware-ai',
    question: 'Do you want built-in generative AI (GPT-4o) or use your own Copilot Studio agent?',
    options: [
      { label: '🤖 Use Copilot Studio agent', nextId: 'proxy-result' },
      { label: '🧠 Built-in GPT-4o / GPT-5', nextId: 'vla-result' },
    ],
  },
  {
    id: 'direct-ai',
    question: 'Do you want built-in generative AI (GPT-4o) or use your own Copilot Studio agent?',
    options: [
      { label: '🤖 Use Copilot Studio agent', nextId: 'ponyfill-result' },
      { label: '🧠 Built-in GPT-4o / GPT-5', nextId: 'vla-result' },
    ],
  },
  {
    id: 'ponyfill-result',
    question: '',
    options: [{ label: '', nextId: null, recommendation: 'ponyfill' }],
  },
  {
    id: 'proxy-result',
    question: '',
    options: [{ label: '', nextId: null, recommendation: 'proxy' }],
  },
  {
    id: 'vla-result',
    question: '',
    options: [{ label: '', nextId: null, recommendation: 'vla' }],
  },
  {
    id: 'phone-result',
    question: '',
    options: [{ label: '', nextId: null, recommendation: 'ivr' }],
  },
];

const RECOMMENDATIONS = {
  ponyfill: {
    icon: '🔊',
    title: 'Speech Ponyfill',
    color: '#10b981',
    tagline: 'Direct to Copilot Studio with client-side voice',
    description: 'Best for: Adding voice to existing Copilot Studio agents without infrastructure changes.',
    pros: ['No middleware needed', 'Simple architecture', 'Uses Copilot Studio topics/AI', 'Works with Direct Line token endpoint'],
    cons: ['Two auth flows (DL + Speech)', 'No server-side logging', 'Speech SDK adds ~200KB'],
  },
  proxy: {
    icon: '🤖',
    title: 'Proxy Bot',
    color: '#8b5cf6',
    tagline: 'Middleware layer for control and observability',
    description: 'Best for: Enterprise scenarios requiring logging, custom auth, or message transformation.',
    pros: ['Full conversation logging', 'Custom authentication', 'Message transformation', 'Multi-bot routing'],
    cons: ['Extra infrastructure (Bot Service)', 'Added latency (~50-100ms)', 'Two Direct Line connections'],
  },
  vla: {
    icon: '🎙️',
    title: 'Voice Live API',
    color: '#f59e0b',
    tagline: 'Server-side unified voice with built-in AI',
    description: 'Best for: New voice-first applications with built-in GPT-4o capabilities.',
    pros: ['Minimal client (~5KB)', 'Built-in AI models', 'Native barge-in & VAD', 'Single WebSocket'],
    cons: ['Requires relay server', 'Separate from Copilot Studio', 'Newer API (less samples)'],
  },
  ivr: {
    icon: '📞',
    title: 'Telephony / IVR',
    color: '#ec4899',
    tagline: 'Phone-based voice with Contact Center integration',
    description: 'Best for: Enterprise contact centers with PSTN requirements and live agent handoff.',
    pros: ['Phone/PSTN support', 'Live agent handoff', 'Contact Center analytics', 'Queue management'],
    cons: ['Complex infrastructure', 'Dynamics 365 licensing', 'Higher cost', 'Longer setup'],
  },
};

// ─── Comparison Table Data ───────────────────────────────────────────────────

const COMPARISON_FEATURES = [
  {
    category: 'Architecture',
    features: [
      { name: 'Client SDK Required', ponyfill: 'Speech SDK + Web Chat (~200KB)', proxy: 'Speech SDK + Web Chat (~200KB)', vla: 'Web Audio only (~5KB)', ivr: 'None (phone)' },
      { name: 'Server Component', ponyfill: 'Token server only', proxy: 'Token server + Bot Service', vla: 'WebSocket relay server', ivr: 'Azure Comm Services + Contact Center' },
      { name: 'Connection Type', ponyfill: 'Two WebSockets (DL + Speech)', proxy: 'Two WebSockets (DL + Speech)', vla: 'Single WebSocket', ivr: 'PSTN / SIP' },
    ],
  },
  {
    category: 'Voice Processing',
    features: [
      { name: 'STT Location', ponyfill: 'Client → Azure Speech', proxy: 'Client → Azure Speech', vla: 'Server-side (Azure)', ivr: 'Server-side (Azure)' },
      { name: 'TTS Location', ponyfill: 'Client (Speech SDK)', proxy: 'Client (Speech SDK)', vla: 'Server-side (Azure)', ivr: 'Server-side (Azure)' },
      { name: 'Barge-In', ponyfill: 'Custom (BargeInController)', proxy: 'Custom (BargeInController)', vla: 'Native (built-in)', ivr: 'Native (built-in)' },
      { name: 'Voice Options', ponyfill: '600+ neural voices', proxy: '600+ neural voices', vla: '600+ neural voices', ivr: '600+ neural voices' },
    ],
  },
  {
    category: 'Bot / AI',
    features: [
      { name: 'AI Engine', ponyfill: 'Copilot Studio', proxy: 'Copilot Studio', vla: 'GPT-4o / GPT-5 / Phi', ivr: 'Copilot Studio' },
      { name: 'Dialog Management', ponyfill: 'Topics & Actions', proxy: 'Topics & Actions', vla: 'Instructions + Tool calls', ivr: 'Topics & Actions' },
      { name: 'Knowledge Sources', ponyfill: 'Copilot connectors', proxy: 'Copilot connectors', vla: 'Tool/function calling', ivr: 'Copilot connectors' },
    ],
  },
  {
    category: 'Enterprise Features',
    features: [
      { name: 'Server-Side Logging', ponyfill: '❌ No', proxy: '✅ Yes', vla: '✅ Yes', ivr: '✅ Yes' },
      { name: 'Custom Auth', ponyfill: '❌ No', proxy: '✅ Yes', vla: '✅ Yes', ivr: '✅ Yes' },
      { name: 'Live Agent Handoff', ponyfill: '⚠️ Limited', proxy: '⚠️ Limited', vla: '❌ No', ivr: '✅ Native' },
      { name: 'Analytics', ponyfill: 'Copilot Studio only', proxy: 'Custom + Copilot Studio', vla: 'Custom only', ivr: 'Contact Center + Copilot' },
    ],
  },
  {
    category: 'Deployment',
    features: [
      { name: 'Setup Complexity', ponyfill: '⭐⭐ Low', proxy: '⭐⭐⭐ Medium', vla: '⭐⭐⭐ Medium', ivr: '⭐⭐⭐⭐⭐ High' },
      { name: 'Infrastructure Cost', ponyfill: '💰 Low', proxy: '💰💰 Medium', vla: '💰💰 Medium', ivr: '💰💰💰💰 High' },
      { name: 'Microsoft Support', ponyfill: '✅ GA', proxy: '✅ GA', vla: '✅ GA (New)', ivr: '✅ GA' },
    ],
  },
];

// ─── Decision Flow Component ─────────────────────────────────────────────────

const DecisionFlow: React.FC = () => {
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [history, setHistory] = useState<string[]>([]);

  const currentNode = DECISION_TREE.find(n => n.id === currentNodeId);
  const recommendation = currentNode?.options[0]?.recommendation;
  const rec = recommendation ? RECOMMENDATIONS[recommendation as keyof typeof RECOMMENDATIONS] : null;

  const handleSelect = (nextId: string | null) => {
    if (nextId) {
      setHistory(prev => [...prev, currentNodeId]);
      setCurrentNodeId(nextId);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCurrentNodeId(prev);
    }
  };

  const handleReset = () => {
    setCurrentNodeId('start');
    setHistory([]);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '32px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ fontSize: '1.5rem' }}>🧭</span>
        <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.25rem' }}>Decision Flow: Which Voice Option?</h3>
      </div>

      {/* Progress indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['start', ...history, currentNodeId].filter((v, i, a) => a.indexOf(v) === i).map((id, _idx) => (
          <div key={id} style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: id === currentNodeId ? '#60a5fa' : '#475569',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {rec ? (
        /* Recommendation Result */
        <div style={{
          background: `linear-gradient(135deg, ${rec.color}22 0%, ${rec.color}11 100%)`,
          border: `2px solid ${rec.color}`,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '2rem' }}>{rec.icon}</span>
            <div>
              <div style={{ color: rec.color, fontWeight: 700, fontSize: '1.25rem' }}>{rec.title}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{rec.tagline}</div>
            </div>
          </div>
          <p style={{ color: '#e2e8f0', marginBottom: '16px', lineHeight: 1.6 }}>{rec.description}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '8px' }}>✅ Pros</div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                {rec.pros.map((p, i) => <li key={i} style={{ marginBottom: '4px' }}>{p}</li>)}
              </ul>
            </div>
            <div>
              <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '8px' }}>⚠️ Considerations</div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                {rec.cons.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
              </ul>
            </div>
          </div>

          <button
            onClick={handleReset}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#475569',
              border: 'none',
              borderRadius: '8px',
              color: '#f1f5f9',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            ↺ Start Over
          </button>
        </div>
      ) : (
        /* Question */
        <div>
          <div style={{
            color: '#f1f5f9',
            fontSize: '1.1rem',
            fontWeight: 500,
            marginBottom: '20px',
          }}>
            {currentNode?.question}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentNode?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt.nextId)}
                style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                  border: '1px solid #475569',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#60a5fa';
                  e.currentTarget.style.transform = 'translateX(8px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#475569';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <button
              onClick={handleBack}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              ← Back
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Comparison Table Component ──────────────────────────────────────────────

const ComparisonTable: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Architecture');

  const columnColors = {
    ponyfill: '#10b981',
    proxy: '#8b5cf6',
    vla: '#f59e0b',
    ivr: '#ec4899',
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px repeat(4, 1fr)',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderBottom: '2px solid #e2e8f0',
      }}>
        <div style={{ padding: '16px', fontWeight: 600, color: '#64748b' }}>Feature</div>
        {[
          { key: 'ponyfill', icon: '🔊', label: 'Speech Ponyfill' },
          { key: 'proxy', icon: '🤖', label: 'Proxy Bot' },
          { key: 'vla', icon: '🎙️', label: 'Voice Live API' },
          { key: 'ivr', icon: '📞', label: 'Telephony IVR' },
        ].map(col => (
          <div key={col.key} style={{
            padding: '16px',
            textAlign: 'center',
            borderLeft: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{col.icon}</div>
            <div style={{
              fontWeight: 600,
              color: columnColors[col.key as keyof typeof columnColors],
              fontSize: '0.85rem',
            }}>
              {col.label}
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      {COMPARISON_FEATURES.map(category => (
        <div key={category.category}>
          {/* Category Header */}
          <button
            onClick={() => setExpandedCategory(
              expandedCategory === category.category ? null : category.category
            )}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f8fafc',
              border: 'none',
              borderBottom: '1px solid #e2e8f0',
              cursor: 'pointer',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <span>{category.category}</span>
            <span style={{
              transform: expandedCategory === category.category ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}>▼</span>
          </button>

          {/* Features */}
          {expandedCategory === category.category && category.features.map((feature, idx) => (
            <div
              key={feature.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '200px repeat(4, 1fr)',
                borderBottom: '1px solid #f1f5f9',
                background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
              }}
            >
              <div style={{
                padding: '12px 16px',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}>
                {feature.name}
              </div>
              {(['ponyfill', 'proxy', 'vla', 'ivr'] as const).map(col => (
                <div key={col} style={{
                  padding: '12px 16px',
                  borderLeft: '1px solid #f1f5f9',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                }}>
                  {feature[col]}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Quick Reference Cards ───────────────────────────────────────────────────

const QuickReferenceCards: React.FC = () => {
  const cards = [
    {
      icon: '🔊',
      title: 'Speech Ponyfill',
      color: '#10b981',
      useWhen: 'You have a Copilot Studio agent and want to add voice with minimal infrastructure',
      architecture: 'Browser → (Direct Line → Copilot Studio) + (Speech SDK → Azure Speech)',
    },
    {
      icon: '🤖',
      title: 'Proxy Bot',
      color: '#8b5cf6',
      useWhen: 'You need server-side logging, custom auth, or message transformation',
      architecture: 'Browser → Proxy Bot → Copilot Studio (with Speech SDK for voice)',
    },
    {
      icon: '🎙️',
      title: 'Voice Live API',
      color: '#f59e0b',
      useWhen: 'You want built-in GPT-4o with minimal client footprint and native barge-in',
      architecture: 'Browser → Your Server → Azure VLA (STT + AI + TTS unified)',
    },
    {
      icon: '📞',
      title: 'Telephony IVR',
      color: '#ec4899',
      useWhen: 'You need phone/PSTN support with live agent handoff and Contact Center',
      architecture: 'Phone → Azure Comm Services → Contact Center → Copilot Studio',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
    }}>
      {cards.map(card => (
        <div key={card.title} style={{
          background: `linear-gradient(135deg, ${card.color}11 0%, ${card.color}05 100%)`,
          border: `2px solid ${card.color}33`,
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
            <span style={{ fontWeight: 700, color: card.color }}>{card.title}</span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>USE WHEN:</div>
            <div style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5 }}>{card.useWhen}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>ARCHITECTURE:</div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#475569',
              background: '#f8fafc',
              padding: '8px',
              borderRadius: '6px',
            }}>
              {card.architecture}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const VoiceComparison: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <h2 style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          margin: '0 0 8px 0',
          color: '#1e293b',
        }}>
          <span>⚖️</span>
          Voice Integration Options — Comparison Guide
        </h2>
        <p style={{ color: '#64748b', margin: 0 }}>
          Choose the right voice architecture for your Copilot Studio integration
        </p>
      </div>

      {/* Quick Reference Cards */}
      <QuickReferenceCards />

      {/* Decision Flow */}
      <DecisionFlow />

      {/* Comparison Table */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#334155',
          marginBottom: '16px',
        }}>
          <span>📊</span>
          Feature Comparison Table
        </h3>
        <ComparisonTable />
      </div>

      {/* Footer Note */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid #93c5fd',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '1.25rem' }}>💡</span>
          <div>
            <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>Pro Tip</div>
            <div style={{ color: '#1d4ed8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Start with <strong>Speech Ponyfill</strong> for simplest setup. Add <strong>Proxy Bot</strong> if you need logging/auth.
              Consider <strong>Voice Live API</strong> for new voice-first apps. Use <strong>Telephony IVR</strong> for enterprise contact centers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceComparison;
