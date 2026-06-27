import { evaluate } from 'mathjs';

/**
 * Normalizes input expression for internal evaluation
 * Replaces human-friendly symbols (×, ÷) with machine-readable operators (*, /)
 * Handles implicit multiplication for parentheses, e.g., 2(3) -> 2*(3)
 */
export const normalizeExpression = (expr: string): string => {
  let normalized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-') // Support special minus characters if pasted
    .replace(/π/g, 'pi')
    .replace(/e/g, 'e');

  // Handle cases like "5% * 2" -> "5% * 2" in mathjs, mathjs natively handles "5%" as "0.05".
  // However, we want to make sure it doesn't break. In mathjs, "10%" is evaluated as "0.1".
  
  // Fix implicit multiplication before parentheses, e.g. "2(3+4)" -> "2*(3+4)"
  // and ")(" -> ")*(" or "number(" -> "number*("
  normalized = normalized.replace(/(\d)(\()/g, '$1*$2');
  normalized = normalized.replace(/(\))(\()/g, '$1*$2');
  normalized = normalized.replace(/(\))(\d)/g, '$1*$2');
  
  return normalized;
};

/**
 * Safely evaluates a math expression.
 * Returns the computed number or throws an error.
 */
export const evaluateExpression = (expr: string): number => {
  const normalized = normalizeExpression(expr);
  if (!normalized.trim()) return 0;
  
  // mathjs evaluate handles standard mathematical operator precedence
  const result = evaluate(normalized);
  
  if (typeof result !== 'number' && typeof result !== 'object') {
    throw new Error('Invalid calculation result');
  }

  // Handle mathjs BigNumber or fraction objects if any, though standard evaluate returns number for basic arithmetic
  if (result && typeof result === 'object' && 'toNumber' in result) {
    return (result as any).toNumber();
  }
  
  if (Number.isNaN(result)) {
    throw new Error('Calculation resulted in NaN');
  }
  
  if (!Number.isFinite(result)) {
    throw new Error('Division by zero or infinity');
  }
  
  return result;
};

/**
 * Validates expression structure and suggests a corrected version if errors are found.
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestedFix?: string;
}

export const validateExpression = (expr: string): ValidationResult => {
  const trimmed = expr.trim();
  if (!trimmed) {
    return { isValid: true };
  }

  const normalized = normalizeExpression(trimmed);

  // 1. Check parenthesization
  let openCount = 0;
  let closedCount = 0;
  for (let i = 0; i < normalized.length; i++) {
    if (normalized[i] === '(') openCount++;
    if (normalized[i] === ')') closedCount++;
  }

  if (openCount > closedCount) {
    // Missing closing brackets
    const diff = openCount - closedCount;
    const fix = trimmed + ')'.repeat(diff);
    return {
      isValid: false,
      error: `Missing ${diff} closing parenthesis`,
      suggestedFix: fix,
    };
  } else if (closedCount > openCount) {
    // Missing opening brackets at the front
    const diff = closedCount - openCount;
    const fix = '('.repeat(diff) + trimmed;
    return {
      isValid: false,
      error: `Missing ${diff} opening parenthesis`,
      suggestedFix: fix,
    };
  }

  // 2. Check for duplicate adjacent operators like ++, --, **, //, or combinations like +*, *+
  // We allow double negatives as unary minus, like "5--3" (which mathjs evaluates as 5 - (-3) = 8).
  // But other combinations are invalid.
  const badOperatorCombo = /[\+\*\/]{2,}|[\+\-\*\/][\*\/]/;
  if (badOperatorCombo.test(normalized)) {
    // Clean up duplicate operators, keeping the last operator or standardizing
    let cleaned = trimmed;
    // Replace duplicate operators with single ones
    cleaned = cleaned.replace(/\+{2,}/g, '+');
    cleaned = cleaned.replace(/\*{2,}/g, '*');
    cleaned = cleaned.replace(/\/{2,}/g, '/');
    cleaned = cleaned.replace(/×{2,}/g, '×');
    cleaned = cleaned.replace(/÷{2,}/g, '÷');
    // Replace combination operators like "+*" or "*+" with the second one
    cleaned = cleaned.replace(/[\+\-\*\/×÷\s]+([\+\-\*\/×÷])/g, ' $1 ');
    
    return {
      isValid: false,
      error: 'Invalid operator sequence',
      suggestedFix: cleaned.replace(/\s+/g, ''),
    };
  }

  // 3. Check for trailing operators
  const trailingOp = /[\+\-\*\/×÷]$/;
  if (trailingOp.test(trimmed)) {
    const fix = trimmed.slice(0, -1).trim();
    return {
      isValid: false,
      error: 'Expression ends with an operator',
      suggestedFix: fix,
    };
  }

  // 4. Try parsing with mathjs
  try {
    const result = evaluate(normalized);
    if (Number.isNaN(result)) {
      return { isValid: false, error: 'Calculated value is not a number' };
    }
  } catch (err: any) {
    return {
      isValid: false,
      error: err.message || 'Syntax error',
    };
  }

  return { isValid: true };
};
