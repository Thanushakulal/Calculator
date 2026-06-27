import { useState } from 'react';
import { Search, Trash2, X, ChevronRight, CornerDownLeft, RefreshCw } from 'lucide-react';
import type { HistoryItem } from '../hooks/useCalculator';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectExpression: (expr: string) => void;
  onSelectResult: (res: string) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onClose?: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectExpression,
  onSelectResult,
  onDeleteItem,
  onClearHistory,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHistory = history.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.expression.toLowerCase().includes(query) ||
      item.result.toLowerCase().includes(query)
    );
  });

  return (
    <div id="history-panel-container" className="flex flex-col h-full text-sm font-medium" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--panel-border)' }}>
        <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '700' }}>History Log</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {history.length > 0 && (
            <button
              id="history-clear-all-btn"
              onClick={onClearHistory}
              title="Clear all history"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Trash2 size={16} />
            </button>
          )}
          {onClose && (
            <button 
              id="history-close-panel-btn"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--panel-border)' }}>
        <div style={{ display: 'flex', position: 'relative' }}>
          <input
            id="history-search-input-field"
            type="text"
            placeholder="Search equations or results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '10px',
              border: '1px solid var(--panel-border)',
              background: 'rgba(0, 0, 0, 0.05)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.85rem',
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          {searchQuery && (
            <button
              id="history-search-clear-btn"
              onClick={() => setSearchQuery('')}
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
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* List Container */}
      <div id="history-items-container" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {filteredHistory.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px', color: 'var(--text-tertiary)', textAlign: 'center', gap: '8px' }}>
            <RefreshCw size={24} style={{ opacity: 0.5 }} />
            <span>{searchQuery ? 'No matching logs found' : 'Calculator history is empty'}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className="fade-in-up"
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'var(--user-msg-bg)',
                  border: '1px solid var(--user-msg-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative',
                }}
              >
                {/* Delete Button */}
                <button
                  id={`history-item-delete-btn-${item.id}`}
                  onClick={() => onDeleteItem(item.id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                >
                  <X size={14} />
                </button>

                {/* Expression */}
                <div style={{ wordBreak: 'break-all', paddingRight: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {item.expression}
                </div>

                {/* Result */}
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  = {item.result}
                </div>

                {/* Footer buttons / reuse */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--panel-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    {item.timestamp}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      id={`history-item-reuse-expr-${item.id}`}
                      onClick={() => onSelectExpression(item.expression)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--panel-border)',
                        background: 'rgba(0, 0, 0, 0.02)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sidebar-active-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)')}
                    >
                      <CornerDownLeft size={10} />
                      Eq
                    </button>
                    <button
                      id={`history-item-reuse-ans-${item.id}`}
                      onClick={() => onSelectResult(item.result)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--panel-border)',
                        background: 'rgba(0, 0, 0, 0.02)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sidebar-active-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)')}
                    >
                      <ChevronRight size={10} />
                      Ans
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
