import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, CornerDownLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { parseLocalNLP, queryGemini } from '../utils/aiEngine';
import type { Message, AIChatContext } from '../utils/aiEngine';

interface AIAssistantProps {
  lastResult: string;
  currentExpression: string;
  history: { expression: string; result: string }[];
  calculatorError: string | null;
  calculatorSuggestedFix: string | null;
  onApplyExpression: (expr: string) => void;
  onClose?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  lastResult,
  currentExpression,
  history,
  calculatorError,
  calculatorSuggestedFix,
  onApplyExpression,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I'm your AI Mathematical Assistant. 🧠\n\nYou can ask me math questions, request step-by-step solutions, or get help with formulas. Try writing something in natural language or choose a quick start option below!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestion chips
  const suggestions = [
    "what is 15% of 350?",
    "square root of 256 minus 4",
    "multiply last result by 10",
    "how do I solve a quadratic equation?",
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle messages sending
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Build chat context
    const context: AIChatContext = {
      lastCalculatorResult: lastResult,
      currentCalculatorExpression: currentExpression,
      history: history.map(h => ({ expression: h.expression, result: h.result })),
    };

    const apiKey = localStorage.getItem('gemini_api_key');

    try {
      let response: { text: string; expression?: string; result?: string };

      if (apiKey) {
        // Query Gemini API
        response = await queryGemini(textToSend, apiKey, context, messages);
      } else {
        // Fallback to local offline NLP
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate thinking latency
        response = parseLocalNLP(textToSend, context);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        timestamp: new Date(),
        suggestedExpression: response.expression,
        suggestedResult: response.result,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Error connecting to AI: ${err.message || 'Unknown error'}. Please verify your network connection and API key in settings.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple text formatter to format LaTeX $$...$$ blocks or inline backticks
  const renderMessageContent = (text: string) => {
    // Process math equations or paragraphs
    return text.split('\n\n').map((paragraph, index) => {
      // Check if it's a latex math block
      if (paragraph.startsWith('$$') && paragraph.endsWith('$$')) {
        const formula = paragraph.slice(2, -2).trim();
        return (
          <div key={index} className="math-block" style={{ fontSize: '1.05rem', margin: '8px 0', textAlign: 'center', width: '100%' }}>
            {formula}
          </div>
        );
      }
      
      // Highlight inline backticks `math`
      const parts = paragraph.split(/(`[^`]+`)/g);
      return (
        <p key={index} style={{ marginBottom: '8px', lineHeight: '1.45' }}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={pIdx} style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85em' }}>
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div id="ai-assistant-container" className="flex flex-col h-full text-sm font-medium" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--panel-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '700' }}>AI Math Assistant</h2>
        </div>
        {onClose && (
          <button 
            id="ai-close-panel-btn"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Message Area */}
      <div id="ai-chat-messages-container" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Render message history */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            id={`ai-msg-bubble-${msg.id}`}
            className={`msg-bubble ${msg.sender === 'ai' ? 'msg-ai' : 'msg-user'} fade-in-up`}
          >
            {renderMessageContent(msg.text)}

            {/* AI Suggested math expression button */}
            {msg.sender === 'ai' && msg.suggestedExpression && (
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--panel-border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Generated calculator expression:</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <code style={{ background: 'rgba(0, 0, 0, 0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', flex: 1, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {msg.suggestedExpression}
                  </code>
                  <button
                    id={`ai-apply-expr-btn-${msg.id}`}
                    onClick={() => onApplyExpression(msg.suggestedExpression!)}
                    style={{
                      background: 'var(--accent-gradient)',
                      border: 'none',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 5px var(--accent-gradient-glow)',
                    }}
                  >
                    <CornerDownLeft size={12} /> Use
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Live syntax error correction card */}
        {calculatorError && calculatorSuggestedFix && (
          <div
            id="ai-syntax-error-correction-card"
            className="shake-element"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '14px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignSelf: 'stretch',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
              <AlertCircle size={16} />
              <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Calculator Syntax Error</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: '1.3' }}>
              It looks like you have a syntax issue: "{calculatorError}". Would you like me to repair it?
            </p>
            <button
              id="ai-error-autofix-btn"
              onClick={() => onApplyExpression(calculatorSuggestedFix)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              <RefreshCw size={12} /> Auto-fix to: {calculatorSuggestedFix}
            </button>
          </div>
        )}

        {/* AI Typing loading indicator */}
        {isLoading && (
          <div id="ai-typing-indicator" className="msg-bubble msg-ai" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="typing-dots">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length < 3 && (
        <div id="ai-suggestion-chips-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 16px', borderTop: '1px solid var(--panel-border)', whiteSpace: 'nowrap' }}>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              id={`ai-suggestion-chip-${idx}`}
              onClick={() => handleSend(s)}
              style={{
                background: 'var(--special-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--panel-border)',
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--special-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--special-bg)')}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--panel-border)', display: 'flex', gap: '8px' }}>
        <input
          id="ai-chat-input-field"
          type="text"
          placeholder={localStorage.getItem('gemini_api_key') ? "Ask Gemini a math question..." : "Ask Assistant offline..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid var(--panel-border)',
            background: 'rgba(0, 0, 0, 0.05)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: '0.85rem',
          }}
        />
        <button
          id="ai-chat-send-btn"
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isLoading}
          style={{
            background: input.trim() && !isLoading ? 'var(--accent-gradient)' : 'var(--panel-border)',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            boxShadow: input.trim() && !isLoading ? '0 2px 8px var(--accent-gradient-glow)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
