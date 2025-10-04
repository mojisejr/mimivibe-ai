/**
 * Prompt Encryption Utilities
 * Uses AES-256-GCM for secure encryption with authentication
 */
export declare class PromptEncryption {
    private static readonly ALGORITHM;
    private static readonly KEY_LENGTH;
    private static readonly IV_LENGTH;
    private static readonly SALT_LENGTH;
    private static readonly TAG_LENGTH;
    /**
     * Derives encryption key from environment variable and salt
     */
    private static deriveKey;
    /**
     * Encrypts prompt content
     * @param content - Plain text prompt content
     * @returns Encrypted content as base64 string (salt:iv:tag:encrypted)
     */
    static encrypt(content: string): Promise<string>;
    /**
     * Decrypts prompt content
     * @param encryptedContent - Encrypted content as base64 string
     * @returns Decrypted plain text content
     */
    static decrypt(encryptedContent: string): Promise<string>;
    /**
     * Validates encryption configuration
     */
    static validateConfig(): boolean;
    /**
     * Securely clears sensitive data from memory
     */
    static clearMemory(data: string): void;
}
//# sourceMappingURL=prompt-encryption.d.ts.map