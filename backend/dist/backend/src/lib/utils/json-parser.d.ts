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
export declare function parseAIResponse<T = any>(response: string): ParsedResponse<T>;
/**
 * Validate that parsed JSON has required fields
 */
export declare function validateJsonStructure<T>(data: any, requiredFields: string[]): {
    isValid: boolean;
    missingFields?: string[];
    data?: T;
};
/**
 * Combined parsing and validation for AI responses
 */
export declare function parseAndValidateAIResponse<T>(response: string, requiredFields: string[]): ParsedResponse<T>;
/**
 * Enhanced error logging for AI response parsing
 */
export declare function logParsingError(node: string, response: string, error: string): void;
//# sourceMappingURL=json-parser.d.ts.map