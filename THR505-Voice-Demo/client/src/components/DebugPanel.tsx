/**
 * Debug Panel Component
 * =====================
 * Shows real-time debug information for demo purposes.
 * Displays tokens, connection status, and network traffic.
 */

import React, { useState, useEffect } from 'react';

interface NetworkEntry {
  id: string;
  method: string;
  url: string;
  status: number | 'pending';
  time: number;
}

interface DebugPanelProps {
  connectionStatus: string;
  conversationId: string | null;
  locale: string | null;
  directLineToken?: string | null;
  speechToken?: string | null;
  speechRegion?: string | null;
  listeningStatus?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  connectionStatus,
  conversationId,
  locale,
  directLineToken,
  speechToken,
  speechRegion,
  listeningStatus,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [networkLog, setNetworkLog] = useState<NetworkEntry[]>([]);

  // Intercept fetch calls to log network traffic
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : '';
      const method = (args[1]?.method || 'GET').toUpperCase();
      const id = Date.now().toString();
      
      // Add pending entry
      setNetworkLog(prev => [
        { id, method, url: url.substring(0, 50), status: 'pending', time: Date.now() },
        ...prev.slice(0, 19), // Keep last 20 entries
      ]);
      
      try {
        const response = await originalFetch(...args);
        
        // Update with status
        setNetworkLog(prev => 
          prev.map(entry => 
            entry.id === id 
              ? { ...entry, status: response.status, time: Date.now() - entry.time }
              : entry
          )
        );
        
        return response;
      } catch (error) {
        setNetworkLog(prev => 
          prev.map(entry => 
            entry.id === id 
              ? { ...entry, status: 0, time: Date.now() - entry.time }
              : entry
          )
        );
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const maskToken = (token: string | null | undefined) => {
    if (!token) return 'N/A';
    if (token.length < 20) return token;
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  };

  const getStatusClass = (status: string) => {
    if (status === 'connected') return 'success';
    if (status === 'error') return 'error';
    if (status === 'connecting' || status === 'fetching-tokens') return 'warning';
    return '';
  };

  return (
    <div className={`debug-panel ${expanded ? 'expanded' : ''}`}>
      <div className="debug-panel-header" onClick={() => setExpanded(!expanded)}>
        <h4>🔧 Debug Panel</h4>
        <button className="debug-panel-toggle">
          {expanded ? '▼' : '▲'}
        </button>
      </div>
      
      {expanded && (
        <div className="debug-panel-content">
          {/* Connection Info */}
          <div className="debug-section">
            <h5>Connection</h5>
            <div className="debug-item">
              <span className="label">Status:</span>
              <span className={`value ${getStatusClass(connectionStatus)}`}>
                {connectionStatus}
              </span>
            </div>
            <div className="debug-item">
              <span className="label">Conversation ID:</span>
              <span className="value">{conversationId || 'N/A'}</span>
            </div>
            <div className="debug-item">
              <span className="label">Locale:</span>
              <span className="value">{locale || 'N/A'}</span>
            </div>
            <div className="debug-item">
              <span className="label">Listening:</span>
              <span className="value">{listeningStatus || 'idle'}</span>
            </div>
          </div>

          {/* Tokens */}
          <div className="debug-section">
            <h5>Tokens</h5>
            <div className="debug-item">
              <span className="label">Direct Line:</span>
              <span className="value">{maskToken(directLineToken)}</span>
            </div>
            <div className="debug-item">
              <span className="label">Speech:</span>
              <span className="value">{maskToken(speechToken)}</span>
            </div>
            <div className="debug-item">
              <span className="label">Speech Region:</span>
              <span className="value">{speechRegion || 'N/A'}</span>
            </div>
          </div>

          {/* Network Log */}
          <div className="debug-section">
            <h5>Network Traffic</h5>
            <div className="debug-network-log">
              {networkLog.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic' }}>No requests yet</div>
              ) : (
                networkLog.map(entry => (
                  <div key={entry.id} className="network-entry">
                    <span className="method">{entry.method}</span>
                    <span className="url" title={entry.url}>{entry.url}</span>
                    <span className={`status ${typeof entry.status === 'number' && entry.status < 400 ? 'ok' : 'error'}`}>
                      {entry.status === 'pending' ? '⏳' : entry.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
