import React from 'react';
import { Delete, History, Sparkles, Settings } from 'lucide-react';

interface CalculatorProps {
  expression: string;
  result: string;
  error: string | null;
  isCalculated: boolean;
  onInputDigit: (digit: string) => void;
  onInputOperator: (op: string) => void;
  onInputParenthesis: (p: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onToggleHistory?: () => void;
  onToggleAI?: () => void;
  onToggleSettings?: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  expression,
  result,
  error,
  isCalculated,
  onInputDigit,
  onInputOperator,
  onInputParenthesis,
  onClear,
  onBackspace,
  onCalculate,
  onToggleHistory,
  onToggleAI,
  onToggleSettings,
}) => {
  return (
    <div
      id="calculator-widget"
      className="glass-panel"
      style={{
        width: '100%',
        maxWidth: '400px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        zIndex: 5,
        margin: '0 auto',
      }}
    >
      {/* Top Utilities / Sidebar triggers for mobile/tab sizes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          id="calc-toggle-history-btn"
          onClick={onToggleHistory}
          title="Toggle history panel"
          style={{
            background: 'var(--special-bg)',
            border: '1px solid var(--panel-border)',
            color: 'var(--text-secondary)',
            padding: '8px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <History size={16} />
          <span className="hidden-mobile">History</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            id="calc-toggle-ai-btn"
            onClick={onToggleAI}
            title="Toggle AI chat assistant"
            style={{
              background: 'var(--ai-msg-bg)',
              border: '1px solid var(--ai-msg-border)',
              color: 'var(--accent-primary)',
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          >
            <Sparkles size={16} />
            <span>AI Ask</span>
          </button>

          <button
            id="calc-toggle-settings-btn"
            onClick={onToggleSettings}
            title="Toggle settings panel"
            style={{
              background: 'var(--special-bg)',
              border: '1px solid var(--panel-border)',
              color: 'var(--text-secondary)',
              padding: '8px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div
        id="calc-screen-display"
        style={{
          background: 'var(--calc-display-bg)',
          border: '1px solid var(--calc-display-border)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          minHeight: '120px',
          maxHeight: '160px',
          overflow: 'hidden',
          position: 'relative',
        }}
        className={error ? 'shake-element' : ''}
      >
        {/* Math input display */}
        <div
          id="calc-display-expression"
          style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            wordBreak: 'break-all',
            width: '100%',
            textAlign: 'right',
            overflowY: 'auto',
            maxHeight: '60px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {expression || '0'}
        </div>

        {/* Live preview / Result display */}
        <div
          id="calc-display-result"
          style={{
            fontSize: isCalculated ? '2.25rem' : '1.75rem',
            fontWeight: '700',
            color: isCalculated ? 'var(--text-primary)' : 'var(--text-tertiary)',
            wordBreak: 'break-all',
            textAlign: 'right',
            width: '100%',
            transition: 'all 0.15s ease',
          }}
        >
          {result && (isCalculated ? `= ${result}` : result)}
        </div>

        {/* Live dynamic validation feedback */}
        {error && (
          <div id="calc-error-message" style={{ position: 'absolute', bottom: '4px', right: '16px', color: '#ef4444', fontSize: '0.72rem', fontWeight: '600' }}>
            {error}
          </div>
        )}
      </div>

      {/* Keypad Grid */}
      <div
        id="calc-keypad"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}
      >
        {/* Advanced Row (Trig / Pow / Roots) */}
        <button id="calc-btn-sqrt" className="calc-btn calc-btn-special" onClick={() => onInputOperator('sqrt(')}>√</button>
        <button id="calc-btn-pow" className="calc-btn calc-btn-special" onClick={() => onInputOperator('^')}>^</button>
        <button id="calc-btn-open-paren" className="calc-btn calc-btn-special" onClick={() => onInputParenthesis('(')}>(</button>
        <button id="calc-btn-close-paren" className="calc-btn calc-btn-special" onClick={() => onInputParenthesis(')')}>)</button>

        {/* Row 2 */}
        <button id="calc-btn-ac" className="calc-btn calc-btn-special" style={{ color: '#ef4444' }} onClick={onClear}>AC</button>
        <button id="calc-btn-backspace" className="calc-btn calc-btn-special" onClick={onBackspace}>
          <Delete size={20} />
        </button>
        <button id="calc-btn-percent" className="calc-btn calc-btn-special" onClick={() => onInputOperator('%')}>%</button>
        <button id="calc-btn-divide" className="calc-btn calc-btn-op" onClick={() => onInputOperator('÷')}>÷</button>

        {/* Row 3 */}
        <button id="calc-btn-3" className="calc-btn calc-btn-number" onClick={() => onInputDigit('1')}>1</button>
        <button id="calc-btn-2" className="calc-btn calc-btn-number" onClick={() => onInputDigit('2')}>2</button>
        <button id="calc-btn-1" className="calc-btn calc-btn-number" onClick={() => onInputDigit('3')}>3</button>
        <button id="calc-btn-multiply" className="calc-btn calc-btn-op" onClick={() => onInputOperator('×')}>×</button>

        {/* Row 4 */}
        <button id="calc-btn-4" className="calc-btn calc-btn-number" onClick={() => onInputDigit('4')}>4</button>
        <button id="calc-btn-5" className="calc-btn calc-btn-number" onClick={() => onInputDigit('5')}>5</button>
        <button id="calc-btn-6" className="calc-btn calc-btn-number" onClick={() => onInputDigit('6')}>6</button>
        <button id="calc-btn-subtract" className="calc-btn calc-btn-op" onClick={() => onInputOperator('-')}>-</button>

        {/* Row 5 */}
        <button id="calc-btn-7" className="calc-btn calc-btn-number" onClick={() => onInputDigit('7')}>7</button>
        <button id="calc-btn-8" className="calc-btn calc-btn-number" onClick={() => onInputDigit('8')}>8</button>
        <button id="calc-btn-9" className="calc-btn calc-btn-number" onClick={() => onInputDigit('9')}>9</button>
        <button id="calc-btn-add" className="calc-btn calc-btn-op" onClick={() => onInputOperator('+')}>+</button>

        {/* Row 6 */}
        <button id="calc-btn-0" className="calc-btn calc-btn-number" style={{ gridColumn: 'span 2' }} onClick={() => onInputDigit('0')}>0</button>
        <button id="calc-btn-decimal" className="calc-btn calc-btn-number" onClick={() => onInputDigit('.')}>.</button>
        <button id="calc-btn-equals" className="calc-btn calc-btn-accent" onClick={onCalculate}>=</button>
      </div>
    </div>
  );
};
