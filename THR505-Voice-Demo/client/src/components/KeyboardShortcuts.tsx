/**
 * Keyboard Shortcuts Component
 * ============================
 * Displays available keyboard shortcuts and handles key events.
 */

import React, { useEffect, useState, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onClearChat?: () => void;
  onToggleMic?: () => void;
  onToggleDebug?: () => void;
  onToggleSound?: () => void;
}

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onClearChat,
  onToggleMic,
  onToggleDebug,
  onToggleSound,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: Shortcut[] = [
    { key: 'Ctrl+L', description: 'Clear chat', action: () => onClearChat?.() },
    { key: 'Ctrl+M', description: 'Toggle mic', action: () => onToggleMic?.() },
    { key: 'Ctrl+D', description: 'Debug panel', action: () => onToggleDebug?.() },
    { key: 'Ctrl+S', description: 'Toggle sound', action: () => onToggleSound?.() },
    { key: '?', description: 'Show shortcuts', action: () => setShowHelp(prev => !prev) },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check for ? key (without modifiers)
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Don't trigger if typing in an input
      if ((e.target as HTMLElement).tagName !== 'INPUT' && 
          (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }
    }

    // Handle Ctrl shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'l':
          e.preventDefault();
          onClearChat?.();
          break;
        case 'm':
          e.preventDefault();
          onToggleMic?.();
          break;
        case 'd':
          e.preventDefault();
          onToggleDebug?.();
          break;
        case 's':
          // Only if not in an input
          if ((e.target as HTMLElement).tagName !== 'INPUT' && 
              (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
            onToggleSound?.();
          }
          break;
      }
    }

    // Escape to close help
    if (e.key === 'Escape' && showHelp) {
      setShowHelp(false);
    }
  }, [onClearChat, onToggleMic, onToggleDebug, onToggleSound, showHelp]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) {
    return null;
  }

  return (
    <div className="keyboard-shortcuts">
      <h5>⌨️ Keyboard Shortcuts</h5>
      {shortcuts.map(shortcut => (
        <div key={shortcut.key} className="shortcut-item">
          <span>{shortcut.description}</span>
          <span className="shortcut-key">{shortcut.key}</span>
        </div>
      ))}
      <div style={{ marginTop: '8px', fontSize: '0.7rem', opacity: 0.7 }}>
        Press ESC or ? to close
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
