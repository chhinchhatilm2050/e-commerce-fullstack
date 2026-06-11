import sanitize from 'sanitize-html';

export type SanitizedValue = string | number | boolean | null | undefined | SanitizedObject | SanitizedValue[];

export interface SanitizedObject {   
  [key: string]: SanitizedValue;
}

const sanitizeValue = (value: unknown): SanitizedValue => {
  if (typeof value === 'string') {
    return sanitize(value, {
      allowedTags: [],
      allowedAttributes: {},
    });
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (typeof value === 'object' && value !== null) {
    return sanitizeObject(value as SanitizedObject);
  }
  return value as SanitizedValue;
};

export const sanitizeObject = (obj: Record<string, unknown>): SanitizedObject => {
  if (!obj || typeof obj !== 'object') return obj as SanitizedObject;
  return Object.keys(obj).reduce((acc: SanitizedObject, key) => {
    acc[key] = sanitizeValue(obj[key]);
    return acc;
  }, {} as SanitizedObject);
};