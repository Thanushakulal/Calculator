import { useState, useEffect } from 'react';
import { useCalculator } from './hooks/useCalculator';
import { useTheme } from './hooks/useTheme';
import { Calculator } from './components/Calculator';
import { HistoryPanel } from './components/HistoryPanel';
import { AIAssistant } from './components/AIAssistant';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const calc = useCalculator();
  const { theme, setTheme } = useTheme();
  
  // Responsive sidebar toggles
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showAI, setShowAI] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Set sidebars active by default on larger desktop screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowHistory(true);
        setShowAI(true);
      } else {
        setShowHistory(false);
        setShowAI(false);
      }
    };

    // Run on initial load
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleApplyExpression = (expr: string) => {
    calc.loadExpression(expr);
  };

  return (
    <div id="app-dashboard-container" className="app-layout">
      {/* Accessibility-friendly Heading for SEO & Screen Readers */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        AI-Powered Smart Calculator Web Application
      </h1>

      {/* 1. History Sidebar */}
      {showHistory && (
        <div id="history-sidebar-container" className={`glass-panel panel-container sidebar-panel active`}>
          <HistoryPanel
            history={calc.history}
            onSelectExpression={(expr) => calc.loadExpression(expr)}
            onSelectResult={(res) => calc.inputDigit(res)}
            onDeleteItem={(id) => calc.deleteHistoryItem(id)}
            onClearHistory={calc.clearHistory}
            onClose={window.innerWidth < 1024 ? () => setShowHistory(false) : undefined}
          />
        </div>
      )}

      {/* 2. Main Calculator Container */}
      <div id="main-calculator-container" className="main-calc-panel">
        <Calculator
          expression={calc.expression}
          result={calc.result}
          error={calc.error}
          isCalculated={calc.isCalculated}
          onInputDigit={calc.inputDigit}
          onInputOperator={calc.inputOperator}
          onInputParenthesis={calc.inputParenthesis}
          onClear={calc.clear}
          onBackspace={calc.backspace}
          onCalculate={calc.calculate}
          onToggleHistory={() => {
            setShowHistory(!showHistory);
            if (window.innerWidth < 1024 && !showHistory) {
              setShowAI(false); // Close AI if history is opened on mobile
            }
          }}
          onToggleAI={() => {
            setShowAI(!showAI);
            if (window.innerWidth < 1024 && !showAI) {
              setShowHistory(false); // Close history if AI is opened on mobile
            }
          }}
          onToggleSettings={() => setShowSettings(true)}
        />
      </div>

      {/* 3. AI Chat Assistant Sidebar */}
      {showAI && (
        <div id="ai-sidebar-container" className={`glass-panel panel-container sidebar-panel active`}>
          <AIAssistant
            lastResult={calc.result}
            currentExpression={calc.expression}
            history={calc.history}
            calculatorError={calc.error}
            calculatorSuggestedFix={calc.suggestedFix}
            onApplyExpression={handleApplyExpression}
            onClose={window.innerWidth < 1024 ? () => setShowAI(false) : undefined}
          />
        </div>
      )}

      {/* 4. Settings Drawer Modal */}
      <div 
        id="settings-drawer-backdrop"
        className={`settings-drawer ${showSettings ? 'active' : ''}`}
        onClick={() => setShowSettings(false)}
      >
        <div 
          id="settings-drawer-dialog"
          className="glass-panel settings-content"
          onClick={(e) => e.stopPropagation()} // Stop click propagation to prevent closing
        >
          <SettingsPanel
            theme={theme}
            setTheme={setTheme}
            onClearHistory={calc.clearHistory}
            onClose={() => setShowSettings(false)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
