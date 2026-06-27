import { useState, useEffect, useCallback } from 'react';
import { evaluateExpression, validateExpression } from '../utils/mathParser';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export const useCalculator = () => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [suggestedFix, setSuggestedFix] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_calculator_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  // Save history helper
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('ai_calculator_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  // Perform validation on the expression
  const runValidation = useCallback((expr: string) => {
    if (!expr) {
      setError(null);
      setSuggestedFix(null);
      return;
    }
    const validation = validateExpression(expr);
    if (!validation.isValid) {
      setError(validation.error || 'Syntax error');
      setSuggestedFix(validation.suggestedFix || null);
    } else {
      setError(null);
      setSuggestedFix(null);
    }
  }, []);

  // Compute active preview
  useEffect(() => {
    if (!expression) {
      setResult('');
      setError(null);
      setSuggestedFix(null);
      return;
    }

    if (isCalculated) {
      return; // If we just hit equals, don't re-evaluate the active expression as a preview
    }

    // Try previewing the math results
    try {
      // Run loose validation for preview (we don't show trailing operator errors as severe during active typing)
      const val = evaluateExpression(expression);
      setResult(String(val));
      setError(null);
      setSuggestedFix(null);
    } catch {
      // If preview fails, don't update result, and don't spam hard errors during active typing
      // unless we explicitly run check validations
    }
  }, [expression, isCalculated]);

  const clear = useCallback(() => {
    setExpression('');
    setResult('');
    setError(null);
    setSuggestedFix(null);
    setIsCalculated(false);
  }, []);

  const backspace = useCallback(() => {
    setIsCalculated(false);
    setExpression((prev) => {
      if (!prev) return '';
      // If we are deleting functions like sqrt(, log(, etc.
      if (prev.endsWith('sqrt(')) {
        return prev.slice(0, -5);
      }
      return prev.slice(0, -1);
    });
  }, []);

  const inputDigit = useCallback((digit: string) => {
    setIsCalculated(false);
    setError(null);
    setSuggestedFix(null);
    setExpression((prev) => {
      // Avoid double decimals in a single number group
      if (digit === '.') {
        // Find last number sequence
        const parts = prev.split(/[\+\-\*\/\(\)\^%×÷]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes('.')) {
          return prev; // Ignore double dot
        }
      }
      
      return prev + digit;
    });
  }, []);

  const inputOperator = useCallback((op: string) => {
    setIsCalculated(false);
    setError(null);
    setSuggestedFix(null);
    setExpression((prev) => {
      if (!prev) {
        if (op === '-') return '-'; // Allow starting expression with negative number
        return '';
      }

      const lastChar = prev.trim().slice(-1);
      
      // If last char is operator, replace it (unless it's negative sign for unary representation)
      if (['+', '-', '*', '/', '^', '%', '×', '÷'].includes(lastChar)) {
        // If it's a double minus, keep it or replace it
        if (lastChar === '-' && prev.length === 1) return prev; // Keep initial minus
        return prev.slice(0, -1) + op;
      }
      
      return prev + op;
    });
  }, []);

  const inputParenthesis = useCallback(() => {
    setIsCalculated(false);
    setError(null);
    setSuggestedFix(null);
    setExpression((prev) => {
      if (!prev) return '(';
      
      // Smart balance calculation
      let openCount = 0;
      let closeCount = 0;
      for (const char of prev) {
        if (char === '(') openCount++;
        if (char === ')') closeCount++;
      }
      
      const lastChar = prev.slice(-1);
      const isLastDigitOrCloseBracket = /\d|\)/.test(lastChar);
      
      if (openCount > closeCount && isLastDigitOrCloseBracket) {
        return prev + ')';
      } else {
        // If last character is operator, number, etc.
        // If last character is a digit or close bracket, and no open brackets left, multiply implicitly: *(
        if (isLastDigitOrCloseBracket) {
          return prev + '×(';
        }
        return prev + '(';
      }
    });
  }, []);

  const loadExpression = useCallback((expr: string) => {
    setExpression(expr);
    setResult('');
    setError(null);
    setSuggestedFix(null);
    setIsCalculated(false);
  }, []);

  const calculate = useCallback(() => {
    if (!expression) return;
    
    // First validate
    const validation = validateExpression(expression);
    if (!validation.isValid) {
      setError(validation.error || 'Syntax error');
      setSuggestedFix(validation.suggestedFix || null);
      return;
    }

    try {
      const mathResult = evaluateExpression(expression);
      const formattedResult = String(mathResult);
      
      setResult(formattedResult);
      setIsCalculated(true);
      setError(null);
      setSuggestedFix(null);

      // Save to history
      const newItem: HistoryItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        expression,
        result: formattedResult,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      saveHistory([newItem, ...history]);
    } catch (err: any) {
      setError(err.message || 'Calculation error');
      setSuggestedFix(null);
    }
  }, [expression, history]);

  // History operations
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    saveHistory(history.filter(item => item.id !== id));
  }, [history]);

  // Keyboard interceptor logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside form inputs (search box or chat assistant)
      if (document.activeElement) {
        const tag = document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.getAttribute('contenteditable') === 'true') {
          return;
        }
      }

      const key = e.key;

      if (key >= '0' && key <= '9') {
        inputDigit(key);
      } else if (key === '.') {
        inputDigit('.');
      } else if (key === '+') {
        inputOperator('+');
      } else if (key === '-') {
        inputOperator('-');
      } else if (key === '*') {
        inputOperator('×');
      } else if (key === '/') {
        e.preventDefault(); // Prevent standard page search triggers in browser
        inputOperator('÷');
      } else if (key === '^') {
        inputOperator('^');
      } else if (key === '%') {
        inputOperator('%');
      } else if (key === '(') {
        setExpression(prev => prev + '(');
      } else if (key === ')') {
        setExpression(prev => prev + ')');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
      } else if (key === 'Backspace') {
        backspace();
      } else if (key === 'Escape') {
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputDigit, inputOperator, calculate, backspace, clear]);

  return {
    expression,
    result,
    error,
    suggestedFix,
    history,
    isCalculated,
    inputDigit,
    inputOperator,
    inputParenthesis,
    clear,
    backspace,
    calculate,
    loadExpression,
    clearHistory,
    deleteHistoryItem,
    runValidation,
  };
};
