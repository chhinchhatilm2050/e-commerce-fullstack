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
  if (value === null || value === undefined) return value; 
  if (typeof value === 'string') {
    return sanitize(value, SANITIZE_OPTIONS); 
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object') {
    return sanitizeObject(value as Record<string, unknown>); 
  }

  return value as SanitizedValue; 
};

export const sanitizeObject = (
  obj: Record<string, unknown>,
): SanitizedObject => {
  if (!obj || typeof obj !== 'object') return {}; 

  return Object.keys(obj).reduce<SanitizedObject>((acc, key) => { 
    acc[key] = sanitizeValue(obj[key]);
    return acc;
  }, {});
};