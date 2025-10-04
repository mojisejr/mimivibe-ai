export declare function isValidEmail(email: string): boolean;
export declare function isValidEventType(eventType: string): boolean;
export declare function sanitizeString(str: string, maxLength?: number): string;
export declare function validatePagination(page?: string, limit?: string): {
    page: number;
    limit: number;
    offset: number;
};
export interface ValidationError {
    field: string;
    message: string;
}
export declare function validateUserProfileUpdate(data: any): ValidationError[];
//# sourceMappingURL=validations.d.ts.map