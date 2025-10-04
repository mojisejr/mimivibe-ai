import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Prompt Encryption Utilities
 * Uses AES-256-GCM for secure encryption with authentication
 */
export class PromptEncryption {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  /**
   * Derives encryption key from environment variable and salt
   */
  private static async deriveKey(salt: Buffer): Promise<Buffer> {
    const baseKey = process.env.PROMPT_ENCRYPTION_KEY;
    if (!baseKey) {
      throw new Error("PROMPT_ENCRYPTION_KEY environment variable is required");
    }

    if (baseKey.length < 32) {
      throw new Error(
        "PROMPT_ENCRYPTION_KEY must be at least 32 characters long"
      );
    }

    return (await scryptAsync(baseKey, salt, this.KEY_LENGTH)) as Buffer;
  }

  /**
   * Encrypts prompt content
   * @param content - Plain text prompt content
   * @returns Encrypted content as base64 string (salt:iv:tag:encrypted)
   */
  public static async encrypt(content: string): Promise<string> {
    try {
      // Generate random salt and IV
      const salt = randomBytes(this.SALT_LENGTH);
      const iv = randomBytes(this.IV_LENGTH);

      // Derive key from environment variable and salt
      const key = await this.deriveKey(salt);

      // Create cipher
      const cipher = createCipheriv(this.ALGORITHM, key, iv);

      // Encrypt content
      let encrypted = cipher.update(content, "utf8", "hex");
      encrypted += cipher.final("hex");

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Combine salt, iv, tag, and encrypted content
      const combined = Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, "hex"),
      ]);

      return combined.toString("base64");
    } catch (error) {
      throw new Error(
        `Encryption failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Decrypts prompt content
   * @param encryptedContent - Encrypted content as base64 string
   * @returns Decrypted plain text content
   */
  public static async decrypt(encryptedContent: string): Promise<string> {
    try {
      // Parse combined data
      const combined = Buffer.from(encryptedContent, "base64");

      // Extract components
      const salt = combined.subarray(0, this.SALT_LENGTH);
      const iv = combined.subarray(
        this.SALT_LENGTH,
        this.SALT_LENGTH + this.IV_LENGTH
      );
      const tag = combined.subarray(
        this.SALT_LENGTH + this.IV_LENGTH,
        this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH
      );
      const encrypted = combined.subarray(
        this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH
      );

      // Derive key
      const key = await this.deriveKey(salt);

      // Create decipher
      const decipher = createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      // Decrypt content
      let decrypted = decipher.update(encrypted, undefined, "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error(
        `Decryption failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Validates encryption configuration
   */
  public static validateConfig(): boolean {
    const key = process.env.PROMPT_ENCRYPTION_KEY;
    return !!(key && key.length >= 32);
  }

  /**
   * Securely clears sensitive data from memory
   */
  public static clearMemory(data: string): void {
    if (data) {
      // Fill the string with zeros (limited effectiveness in JavaScript)
      // This is more symbolic than truly secure due to JS garbage collection
      const length = data.length;
      let cleared = "";
      for (let i = 0; i < length; i++) {
        cleared += "\0";
      }
    }
  }
}
