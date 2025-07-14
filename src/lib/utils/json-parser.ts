/**
 * JSON Parser Utility for AI Responses
 * Handles various AI response formats including markdown code blocks
 */

export interface ParsedResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rawResponse?: string;
}

/**
 * Safely parse JSON from AI responses that might contain markdown code blocks
 */
export function parseAIResponse<T = any>(response: string): ParsedResponse<T> {
  try {
    const cleanResponse = response.trim();
    
    // Store original response for debugging
    const result: ParsedResponse<T> = { success: false, rawResponse: cleanResponse };
    
    // Case 1: Direct JSON response
    if (cleanResponse.startsWith('{') && cleanResponse.endsWith('}')) {
      try {
        result.data = JSON.parse(cleanResponse);
        result.success = true;
        return result;
      } catch (error) {
        // Continue to other parsing methods
      }
    }
    
    // Case 2: Markdown code block with ```json
    const jsonBlockMatch = cleanResponse.match(/```json\s*\n([\s\S]*?)\n```/);
    if (jsonBlockMatch) {
      try {
        result.data = JSON.parse(jsonBlockMatch[1].trim());
        result.success = true;
        return result;
      } catch (error) {
        result.error = `Failed to parse JSON from markdown block: ${error}`;
        return result;
      }
    }
    
    // Case 3: Markdown code block with ```
    const codeBlockMatch = cleanResponse.match(/```\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      try {
        result.data = JSON.parse(codeBlockMatch[1].trim());
        result.success = true;
        return result;
      } catch (error) {
        result.error = `Failed to parse JSON from generic code block: ${error}`;
        return result;
      }
    }
    
    // Case 4: Try to extract JSON from mixed content
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        result.data = JSON.parse(jsonMatch[0]);
        result.success = true;
        return result;
      } catch (error) {
        result.error = `Failed to parse extracted JSON: ${error}`;
        return result;
      }
    }
    
    // Case 5: No JSON found
    result.error = `No valid JSON found in response: ${cleanResponse.substring(0, 200)}...`;
    return result;
    
  } catch (error) {
    return {
      success: false,
      error: `Unexpected error parsing AI response: ${error}`,
      rawResponse: response
    };
  }
}

/**
 * Validate that parsed JSON has required fields
 */
export function validateJsonStructure<T>(
  data: any,
  requiredFields: string[]
): { isValid: boolean; missingFields?: string[]; data?: T } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, missingFields: requiredFields };
  }
  
  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    return { isValid: false, missingFields };
  }
  
  return { isValid: true, data: data as T };
}

/**
 * Combined parsing and validation for AI responses
 */
export function parseAndValidateAIResponse<T>(
  response: string,
  requiredFields: string[]
): ParsedResponse<T> {
  const parsed = parseAIResponse<T>(response);
  
  if (!parsed.success) {
    return parsed;
  }
  
  const validated = validateJsonStructure<T>(parsed.data, requiredFields);
  
  if (!validated.isValid) {
    return {
      success: false,
      error: `Missing required fields: ${validated.missingFields?.join(', ')}`,
      rawResponse: response
    };
  }
  
  return {
    success: true,
    data: validated.data
  };
}

/**
 * Enhanced error logging for AI response parsing
 */
export function logParsingError(
  node: string,
  response: string,
  error: string
): void {
  console.error(`🚨 AI Response Parsing Error in ${node}:`, {
    error,
    responsePreview: response.substring(0, 300),
    responseLength: response.length,
    timestamp: new Date().toISOString()
  });
}