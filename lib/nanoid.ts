import { nanoid } from 'nanoid';

/**
 * Generate a 8-character nanoid for organization IDs
 * Uses URL-safe characters: A-Z, a-z, 0-9, _, -
 */
export function generateOrgId(): string {
  return nanoid(8);
}

/**
 * Validate that a string is a valid 8-character nanoid
 * @param id - The ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidOrgId(id: string): boolean {
  return id.length === 8 && /^[A-Za-z0-9_-]+$/.test(id);
}
