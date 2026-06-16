import sanitize from 'sanitize-html';

export type SanitizedValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | SanitizedObject
  | SanitizedValue[];

export interface SanitizedObject {
  [key: string]: SanitizedValue;
}

const SANITIZE_OPTIONS: sanitize.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

const sanitizeValue = (value: unknown): SanitizedValue => {
  if (value === null || value === undefined) return value; // ✅ explicit null/undefined guard

  if (typeof value === 'string') {
    return sanitize(value, SANITIZE_OPTIONS); // ✅ extracted constant
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object') { // null already handled above
    return sanitizeObject(value as Record<string, unknown>); // ✅ correct cast
  }

  return value as SanitizedValue; // number, boolean, etc.
};

export const sanitizeObject = (
  obj: Record<string, unknown>,
): SanitizedObject => {
  if (!obj || typeof obj !== 'object') return {}; // ✅ return {} not obj

  return Object.keys(obj).reduce<SanitizedObject>((acc, key) => { // ✅ typed reduce
    acc[key] = sanitizeValue(obj[key]);
    return acc;
  }, {});
};