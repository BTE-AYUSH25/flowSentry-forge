// src/storage/storageAdapter.ts

/**
 * MODULE 9: Storage & State Module
 *
 * Responsibility:
 * - Persist and retrieve minimal state via key-value access
 *
 * IMPORTANT:
 * - This module does NOT understand the data it stores
 * - This module does NOT perform analytics
 * - This module does NOT enforce schemas
 * - This module does NOT infer meaning from values
 */

// -----------------------------
// Types (implicit by contract)
// -----------------------------

export type StorageValue = unknown;

// -----------------------------
// Custom Error
// -----------------------------

export class StorageError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// -----------------------------
// Internal Storage (In-Memory)
// -----------------------------

/**
 * NOTE:
 * - This is a minimal in-memory implementation
 * - In production, this is backed by Forge Storage / DB
 *
 * Beginner mistake:
 * - Putting business logic inside storage
 * DON'T.
 */
const store: Record<string, StorageValue> = {};

// -----------------------------
// CONTRACT FUNCTION: save
// -----------------------------

export function save(key: string, value: StorageValue): void {
  if (!key || typeof key !== "string") {
    throw new StorageError(
      "DATA_CORRUPTED",
      "Storage key must be a non-empty string"
    );
  }

  try {
    // Beginner mistake:
    // Mutating value or deep cloning unnecessarily
    store[key] = value;
  } catch {
    throw new StorageError(
      "STORAGE_LIMIT_EXCEEDED",
      "Unable to save value"
    );
  }
}

// -----------------------------
// CONTRACT FUNCTION: load
// -----------------------------

export function load(key: string): StorageValue {
  if (!key || typeof key !== "string") {
    throw new StorageError(
      "DATA_CORRUPTED",
      "Storage key must be a non-empty string"
    );
  }

  if (!(key in store)) {
    // Important:
    // Absence is NOT an error condition per contract
    return null;
  }

  try {
    return store[key];
  } catch {
    throw new StorageError(
      "DATA_CORRUPTED",
      "Stored data could not be read"
    );
  }
}
