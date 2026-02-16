import React, { useState } from 'react';
import TelephonyInfoPanels from './TelephonyInfoPanels';

type InnerTab = 'chat' | 'architecture' | 'connection' | 'resources';

const TelephonyIVR: React.FC = () => {
  const [innerTab, setInnerTab] = useState<InnerTab>('chat');
  const phoneNumber = '+17866870264';
  const displayNumber = '+1 (786) 687-0264';
  
  // QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=tel:${phoneNumber}`;

  return (
    <div className="chat-container">
      {/* Inner Sub-Tab Navigation */}
      <nav className="inner-tab-nav telephony-accent">
        {([
          { id: 'chat', icon: '📞', label: 'Chatbot' },
          { id: 'architecture', icon: '🏗️', label: 'Architecture' },
          { id: 'connection', icon: '🔌', label: 'Connection Flow' },
          { id: 'resources', icon: '📚', label: 'Resources' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            className={`inner-tab-btn ${innerTab === tab.id ? 'active' : ''}`}
            onClick={() => setInnerTab(tab.id)}
          >
            <span className="inner-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {innerTab === 'chat' ? (
        <div className="ivr-placeholder">
          <div className="ivr-icon"></div>
          <h2>Telephony / IVR Integration</h2>
          <p>
            Connect to the <strong>Citizen Advice</strong> bot via phone using
            <strong> LiveHub</strong> and <strong>Copilot Studio</strong>.
          </p>
          
          <div className="ivr-call-section">
            <div className="call-options">
              {/* QR Code */}
              <div className="qr-code-container">
                <img src={qrCodeUrl} alt="Scan to call" className="qr-code" />
                <p className="qr-label">Scan with your phone</p>
              </div>
              
              {/* Or divider */}
              <div className="call-divider">
                <span>OR</span>
              </div>
              
              {/* Manual dial */}
              <div className="manual-dial">
                <a href={`tel:${phoneNumber}`} className="ivr-call-button">
                  <span className="call-icon"></span>
                  <span className="call-text">
                    <strong>Call Now</strong>
                    <span className="call-number">{displayNumber}</span>
                  </span>
                </a>
                <p className="call-instruction">Click or dial manually</p>
              </div>
            </div>
          </div>

          <div className="ivr-features">
            <div className="ivr-feature">
              <span className="feature-icon"></span>
              <strong>Call Routing</strong>
              <p>LiveHub routes calls to Copilot Studio</p>
            </div>
            <div className="ivr-feature">
              <span className="feature-icon"></span>
              <strong>Voice Recognition</strong>
              <p>Azure Speech Services for STT/TTS</p>
            </div>
            <div className="ivr-feature">
              <span className="feature-icon"></span>
              <strong>Analytics</strong>
              <p>View transcripts in Copilot Studio</p>
            </div>
          </div>
          
          <div className="ivr-demo-tip">
            <strong> Demo Tip:</strong> After calling, check Copilot Studio Analytics to show the conversation transcript!
          </div>
        </div>
      ) : (
        <TelephonyInfoPanels activeTab={innerTab} />
      )}
    </div>
  );
};

export default TelephonyIVR;
