import { evaluateExpression } from './mathParser';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  suggestedExpression?: string; // Expression to load into the calculator
  suggestedResult?: string;     // Calculated result
}

export interface AIChatContext {
  lastCalculatorResult?: string;
  currentCalculatorExpression?: string;
  history?: { expression: string; result: string }[];
}

/**
 * Clean and parse local math expressions from natural language.
 * E.g., "what is 15 percent of 200" -> 15% * 200 -> 0.15 * 200
 */
export const parseLocalNLP = (text: string, context: AIChatContext): { text: string; expression?: string; result?: string } => {
  const input = text.toLowerCase().trim();
  const lastAns = context.lastCalculatorResult || '0';

  // 1. Percentage checking: "15% of 200" or "15 percent of 200"
  const percentMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s+of\s+(\d+(?:\.\d+)?)/);
  if (percentMatch) {
    const rate = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const expr = `${rate}% * ${total}`;
    try {
      const val = evaluateExpression(expr);
      return {
        text: `To find ${rate}% of ${total}, multiply the value by the percentage in decimal form:\n\n$$\\text{Result} = ${total} \\times \\frac{${rate}}{100} = ${val}$$`,
        expression: `${rate}% * ${total}`,
        result: String(val),
      };
    } catch {
      // Ignore and fall through
    }
  }

  // 2. Square root checking: "square root of 144" or "sqrt of 144" or "sqrt 144"
  const sqrtMatch = input.match(/(?:square\s*root|sqrt)(?:\s+of)?\s+(\d+(?:\.\d+)?)/);
  if (sqrtMatch) {
    const num = sqrtMatch[1];
    const expr = `sqrt(${num})`;
    try {
      const val = evaluateExpression(expr);
      return {
        text: `The square root of ${num} is ${val}.\n$$\\sqrt{${num}} = ${val}$$`,
        expression: expr,
        result: String(val),
      };
    } catch {
      // Ignore
    }
  }

  // 3. Power checking: "5 to the power of 3" or "5 squared" or "5 cubed"
  const powerMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:to\s+the\s+power\s+of|^)\s*(\d+(?:\.\d+)?)/);
  if (powerMatch) {
    const base = powerMatch[1];
    const exp = powerMatch[2];
    const expr = `${base}^${exp}`;
    try {
      const val = evaluateExpression(expr);
      return {
        text: `${base} raised to the power of ${exp} is ${val}.\n$$${base}^{${exp}} = ${val}$$`,
        expression: expr,
        result: String(val),
      };
    } catch {}
  }
  
  if (input.match(/(\d+(?:\.\d+)?)\s*squared/)) {
    const num = input.match(/(\d+(?:\.\d+)?)\s*squared/)?.[1];
    if (num) {
      const expr = `${num}^2`;
      try {
        const val = evaluateExpression(expr);
        return {
          text: `${num} squared is ${val}.\n$$${num}^2 = ${val}$$`,
          expression: expr,
          result: String(val),
        };
      } catch {}
    }
  }

  // 4. Relative operations on last result: "add 15 to the previous result", "multiply last result by 3"
  if (input.includes('previous result') || input.includes('last result') || input.includes('last answer') || input.includes('prev answer') || input.includes('ans')) {
    const numberMatch = input.match(/(\d+(?:\.\d+)?)/);
    const amount = numberMatch ? numberMatch[1] : '';

    if (amount) {
      if (input.includes('add') || input.includes('plus')) {
        const expr = `${lastAns} + ${amount}`;
        return {
          text: `Adding ${amount} to your last result (${lastAns}):`,
          expression: expr,
          result: String(evaluateExpression(expr)),
        };
      }
      if (input.includes('subtract') || input.includes('minus') || input.includes('take away')) {
        const expr = `${lastAns} - ${amount}`;
        return {
          text: `Subtracting ${amount} from your last result (${lastAns}):`,
          expression: expr,
          result: String(evaluateExpression(expr)),
        };
      }
      if (input.includes('multiply') || input.includes('times')) {
        const expr = `${lastAns} * ${amount}`;
        return {
          text: `Multiplying your last result (${lastAns}) by ${amount}:`,
          expression: expr,
          result: String(evaluateExpression(expr)),
        };
      }
      if (input.includes('divide') || input.includes('divided by')) {
        const expr = `${lastAns} / ${amount}`;
        try {
          return {
            text: `Dividing your last result (${lastAns}) by ${amount}:`,
            expression: expr,
            result: String(evaluateExpression(expr)),
          };
        } catch (err: any) {
          return { text: `Error dividing: ${err.message}` };
        }
      }
    }
  }

  // 5. Basic word-based calculations: "add 15 and 25", "sum of 10, 20, 30", "multiply 5 by 8"
  const basicAdd = input.match(/(?:add|sum\s+of|plus)\s+(\d+(?:\.\d+)?)\s*(?:and|\+|,)\s*(\d+(?:\.\d+)?)/);
  if (basicAdd) {
    const expr = `${basicAdd[1]} + ${basicAdd[2]}`;
    return {
      text: `Calculating the sum of ${basicAdd[1]} and ${basicAdd[2]}:`,
      expression: expr,
      result: String(evaluateExpression(expr)),
    };
  }

  const basicSub = input.match(/(?:subtract|minus|take\s+away)\s+(\d+(?:\.\d+)?)\s*(?:from|and|-)\s*(\d+(?:\.\d+)?)/);
  if (basicSub) {
    // If it says "subtract 10 from 50", it means 50 - 10 = 40.
    // If it says "subtract 50 and 10", it could mean 50 - 10 = 40.
    const isFrom = input.includes('from');
    const expr = isFrom 
      ? `${basicSub[2]} - ${basicSub[1]}` 
      : `${basicSub[1]} - ${basicSub[2]}`;
    return {
      text: isFrom
        ? `Subtracting ${basicSub[1]} from ${basicSub[2]}:`
        : `Calculating the difference of ${basicSub[1]} and ${basicSub[2]}:`,
      expression: expr,
      result: String(evaluateExpression(expr)),
    };
  }

  const basicMult = input.match(/(?:multiply|times|product\s+of)\s+(\d+(?:\.\d+)?)\s*(?:by|and|\*)\s*(\d+(?:\.\d+)?)/);
  if (basicMult) {
    const expr = `${basicMult[1]} * ${basicMult[2]}`;
    return {
      text: `Multiplying ${basicMult[1]} by ${basicMult[2]}:`,
      expression: expr,
      result: String(evaluateExpression(expr)),
    };
  }

  const basicDiv = input.match(/(?:divide|divided\s+by)\s+(\d+(?:\.\d+)?)\s*(?:by|into|and|\/)\s*(\d+(?:\.\d+)?)/);
  if (basicDiv) {
    const expr = `${basicDiv[1]} / ${basicDiv[2]}`;
    try {
      return {
        text: `Dividing ${basicDiv[1]} by ${basicDiv[2]}:`,
        expression: expr,
        result: String(evaluateExpression(expr)),
      };
    } catch (err: any) {
      return { text: `Error: ${err.message}` };
    }
  }

  // 6. Direct arithmetic expression inside conversational text: e.g. "can you solve (5+5)*10/2?"
  // Regex to match a basic mathematical expression: numbers, operators, brackets
  const mathExprRegex = /((?:(?:\d+(?:\.\d+)?)|[\+\-\*\/\(\)\^]|sqrt|pi|e|\s|%)+)/;
  const matches = input.match(mathExprRegex);
  if (matches) {
    // Find the longest substring that actually compiles/evaluates as math
    const candidate = matches[0].trim();
    // Exclude simple single numbers
    if (candidate.length > 2 && /[\+\-\*\/\(\)\^%]/.test(candidate)) {
      try {
        const val = evaluateExpression(candidate);
        return {
          text: `I analyzed your query and extracted this expression: \`${candidate}\`.\n\nHere is the result:`,
          expression: candidate,
          result: String(val),
        };
      } catch {
        // Fallback to conversational text
      }
    }
  }

  // 7. General chat fallback
  const genericReplies: { [key: string]: string } = {
    hello: "Hello! I'm your AI Mathematical Assistant. You can type math formulas, ask me to calculate percentages, solve algebra, or explain concepts. Try typing: *'what is 15 percent of 350?'*",
    hi: "Hi! How can I help you calculate today?",
    help: "I can help you in several ways:\n\n1. **Natural Language Math**: Type 'what is 25% of 800' or 'sqrt of 169 plus 12'\n2. **Calculator Operations**: Use the buttons, or type expressions directly in the input\n3. **Syntax Error Fixes**: If you make an error on the keypad, I will offer a quick button to correct it!\n4. **Gemini API (Optional)**: Provide a Gemini API key in settings to unlock complete mathematical tutoring, word problem solving, and explanations.",
    clear: "To clear the calculator screen, click the **AC** button on the keypad or type Backspace/Escape.",
    history: "Your calculator history is saved automatically on the left sidebar. You can search, reuse past calculations, or clear history anytime.",
    about: "This is a premium AI-powered Calculator App. It uses a hybrid processing system (local NLP + Gemini integration) to make calculations seamless and educational.",
  };

  for (const key of Object.keys(genericReplies)) {
    if (input.includes(key)) {
      return { text: genericReplies[key] };
    }
  }

  return {
    text: "I'm not quite sure how to calculate that locally. If you're looking for help with a complex math concept or word problem, consider adding a **Gemini API Key** in settings to enable full conversational intelligence!",
  };
};

/**
 * Call Gemini API directly from the client.
 * Uses systemInstructions to direct Gemini to produce clean responses and tag calculable math formulas.
 */
export const queryGemini = async (
  prompt: string,
  apiKey: string,
  context: AIChatContext,
  chatHistory: Message[]
): Promise<{ text: string; expression?: string; result?: string }> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Build structural conversational context
  const historyPrompt = chatHistory
    .slice(-6) // Include last 6 messages to stay under rate/token bounds and maintain context
    .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
    .join('\n');

  const systemInstruction = `You are a mathematical assistant inside a premium AI Calculator web app.
Your goals:
1. Help the user solve math equations, explain concepts, and solve word problems step-by-step.
2. Keep explanations clear, professional, and visually engaging (use Markdown and LaTeX notation where helpful).
3. If the user wants to perform a mathematical calculation (or if a word problem resolves to an expression), you MUST format the mathematical formula to be executed in the calculator inside a special block at the very end of your response: [CALC: expression].
   - The expression inside [CALC: ...] must only contain standard calculator syntax: numbers, operators (+, -, *, /, ^), decimal (.), and functions like sqrt() or trig functions like sin(), cos(), tan(), and parentheses. Use % for percentages.
   - Example: If the user says "add 25% of 800 to 50", explain the step and add [CALC: (25% * 800) + 50] at the end.
   - Example: If the user says "what is the square root of 900", explain and write [CALC: sqrt(900)].
   - Only output [CALC: ...] if there is a concrete mathematical expression that can be evaluated on the calculator screen.
4. Reference current state context if relevant:
   - Current calculator screen: "${context.currentCalculatorExpression || '0'}"
   - Last calculated answer: "${context.lastCalculatorResult || '0'}"
   - Calculation history: ${JSON.stringify(context.history || [])}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${historyPrompt}\n\nUser: ${prompt}`
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      throw new Error('Received empty response from Gemini API');
    }

    // Extract [CALC: expression] block
    const calcRegex = /\[CALC:\s*([^\]]+)\]/;
    const match = replyText.match(calcRegex);
    let expression: string | undefined = undefined;
    let result: string | undefined = undefined;
    let cleanText = replyText.replace(calcRegex, '').trim();

    if (match && match[1]) {
      const parsedExpression = match[1].trim();
      expression = parsedExpression;
      try {
        result = String(evaluateExpression(parsedExpression));
      } catch {
        // If calculation fails, we just don't offer the result, but keep the expression
      }
    }

    return {
      text: cleanText,
      expression,
      result
    };
  } catch (err: any) {
    console.error('Gemini query failed:', err);
    throw err;
  }
};
