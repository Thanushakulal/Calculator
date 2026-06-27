import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Key, Trash2, RotateCcw, X, Check, Eye, EyeOff } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';

interface SettingsPanelProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onClearHistory: () => void;
  onClose?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  theme,
  setTheme,
  onClearHistory,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);

  // Load API key from local storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsSaved(true);
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsSaved(false);
  };

  const handleResetApp = () => {
    if (window.confirm('Are you sure you want to reset all app settings? This will clear history, API keys, and theme settings.')) {
      localStorage.clear();
      onClearHistory();
      setTheme('system');
      setApiKey('');
      setIsSaved(false);
      alert('Application reset successfully.');
    }
  };

  return (
    <div id="settings-panel-container" className="flex flex-col h-full text-sm font-medium" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--panel-border)' }}>
        <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '700' }}>App Settings</h2>
        {onClose && (
          <button 
            id="settings-close-panel-btn"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Scrollable Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Theme Settings */}
        <div>
          <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', marginBottom: '10px' }}>Appearance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              id="settings-theme-btn-light"
              onClick={() => setTheme('light')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 8px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: theme === 'light' ? 'var(--accent-primary)' : 'var(--panel-border)',
                background: theme === 'light' ? 'var(--sidebar-active-bg)' : 'rgba(255,255,255,0.02)',
                color: theme === 'light' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Sun size={18} />
              <span style={{ fontSize: '0.8rem' }}>Light</span>
            </button>
            <button
              id="settings-theme-btn-dark"
              onClick={() => setTheme('dark')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 8px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: theme === 'dark' ? 'var(--accent-primary)' : 'var(--panel-border)',
                background: theme === 'dark' ? 'var(--sidebar-active-bg)' : 'rgba(255,255,255,0.02)',
                color: theme === 'dark' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Moon size={18} />
              <span style={{ fontSize: '0.8rem' }}>Dark</span>
            </button>
            <button
              id="settings-theme-btn-system"
              onClick={() => setTheme('system')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 8px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: theme === 'system' ? 'var(--accent-primary)' : 'var(--panel-border)',
                background: theme === 'system' ? 'var(--sidebar-active-bg)' : 'rgba(255,255,255,0.02)',
                color: theme === 'system' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Monitor size={18} />
              <span style={{ fontSize: '0.8rem' }}>System</span>
            </button>
          </div>
        </div>

        {/* Gemini API Settings */}
        <div>
          <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', marginBottom: '10px' }}>AI Assistant</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Add a Gemini Developer API Key to unlock complex problem-solving, detailed explanations, and fully conversational AI.
            </p>
            <div style={{ display: 'flex', position: 'relative', marginTop: '4px' }}>
              <input
                id="settings-api-key-input-field"
                type={showKey ? 'text' : 'password'}
                placeholder="Paste Gemini API Key..."
                value={apiKey}
                disabled={isSaved}
                onChange={(e) => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 32px',
                  borderRadius: '10px',
                  border: '1px solid var(--panel-border)',
                  background: 'rgba(0, 0, 0, 0.05)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.85rem',
                }}
              />
              <Key size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <button
                id="settings-api-key-visibility-toggle"
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {isSaved ? (
                <button
                  id="settings-api-key-remove-btn"
                  onClick={handleRemoveKey}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  <Trash2 size={14} /> Remove Key
                </button>
              ) : (
                <button
                  id="settings-api-key-save-btn"
                  onClick={handleSaveKey}
                  disabled={!apiKey.trim()}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: apiKey.trim() ? 'var(--accent-gradient)' : 'var(--panel-border)',
                    color: apiKey.trim() ? '#ffffff' : 'var(--text-tertiary)',
                    cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    boxShadow: apiKey.trim() ? '0 2px 8px var(--accent-gradient-glow)' : 'none',
                  }}
                >
                  <Check size={14} /> Save Key
                </button>
              )}
            </div>
            
            <a 
              id="settings-gemini-studio-link"
              href="https://aistudio.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none', marginTop: '2px', display: 'inline-block' }}
            >
              Get a free API key here &rarr;
            </a>
          </div>
        </div>

        {/* Clear Data Settings */}
        <div>
          <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', marginBottom: '10px' }}>Data Management</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              id="settings-clear-history-btn"
              onClick={onClearHistory}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--panel-border)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--number-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            >
              <Trash2 size={16} style={{ color: 'var(--text-secondary)' }} />
              <span>Clear Calculator History</span>
            </button>
            <button
              id="settings-reset-app-btn"
              onClick={handleResetApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--panel-border)',
                background: 'rgba(255,255,255,0.02)',
                color: '#ef4444',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            >
              <RotateCcw size={16} />
              <span>Reset Application Settings</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
