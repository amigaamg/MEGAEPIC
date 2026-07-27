import { DATA_TYPE_REGISTRY } from './types';
import type { UniversalDataType, DataTypeValidation } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDataTypeValue(
  type: UniversalDataType,
  value: unknown,
  customValidation?: DataTypeValidation,
): ValidationResult {
  const schema = DATA_TYPE_REGISTRY[type];
  if (!schema) return { valid: false, errors: [`Unknown data type: ${type}`] };

  const validation: DataTypeValidation = customValidation || schema.validation || {};
  const errors: string[] = [];

  if (value === null || value === undefined) {
    if (validation.required) {
      errors.push(`${schema.label} is required`);
    }
    return { valid: errors.length === 0, errors };
  }

  switch (schema.baseType) {
    case 'boolean':
      if (typeof value !== 'boolean') errors.push(`${schema.label} must be a boolean`);
      break;

    case 'number': {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${schema.label} must be a number`);
      } else {
        if (type === 'integer' && !Number.isInteger(value)) {
          errors.push(`${schema.label} must be a whole number`);
        }
        if (validation.min !== undefined && value < validation.min) {
          errors.push(`${schema.label} must be >= ${validation.min} (got ${value})`);
        }
        if (validation.max !== undefined && value > validation.max) {
          errors.push(`${schema.label} must be <= ${validation.max} (got ${value})`);
        }
      }
      break;
    }

    case 'string': {
      if (typeof value !== 'string') {
        errors.push(`${schema.label} must be a string`);
      } else {
        if (validation.minLength !== undefined && value.length < validation.minLength) {
          errors.push(`${schema.label} must be at least ${validation.minLength} characters`);
        }
        if (validation.maxLength !== undefined && value.length > validation.maxLength) {
          errors.push(`${schema.label} must be at most ${validation.maxLength} characters`);
        }
        if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
          errors.push(`${schema.label} format is invalid`);
        }
        if (validation.enumValues && !validation.enumValues.includes(value)) {
          errors.push(`${schema.label} must be one of: ${validation.enumValues.join(', ')}`);
        }
      }
      break;
    }

    case 'date': {
      if (typeof value !== 'string') {
        errors.push(`${schema.label} must be a string`);
      } else if (type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        errors.push(`${schema.label} must be in YYYY-MM-DD format`);
      } else if (type === 'datetime' && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
        errors.push(`${schema.label} must be in ISO datetime format`);
      } else if (type === 'time' && !/^\d{2}:\d{2}$/.test(value)) {
        errors.push(`${schema.label} must be in HH:MM format`);
      }
      break;
    }

    case 'array': {
      if (!Array.isArray(value)) {
        errors.push(`${schema.label} must be an array`);
      } else if (validation.enumValues) {
        for (const v of value) {
          if (!validation.enumValues.includes(v as string)) {
            errors.push(`"${String(v)}" is not a valid option for ${schema.label}`);
          }
        }
      }
      break;
    }

    case 'object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`${schema.label} must be an object`);
      }
      break;
    }

    case 'binary':
      break;
  }

  return { valid: errors.length === 0, errors };
}

export function validateVitalSign(
  type: 'pulse_bpm' | 'temperature_c' | 'pressure_mmhg' | 'weight_kg' | 'height_cm',
  value: number,
): ValidationResult {
  return validateDataTypeValue(type, value);
}

export function validateClinicalValue(
  type: UniversalDataType,
  value: unknown,
  context?: { patientAge?: number; pregnant?: boolean },
): ValidationResult {
  const result = validateDataTypeValue(type, value, undefined);
  if (!result.valid) return result;

  // Context-sensitive checks
  if (type === 'weight_kg' && context?.patientAge !== undefined) {
    const age = context.patientAge;
    const weight = value as number;
    if (age < 1 && weight > 20) {
      result.errors.push(`Weight ${weight}kg is too high for an infant <1 year`);
    }
    if (age > 12 && weight < 15) {
      result.errors.push(`Weight ${weight}kg is too low for age ${age} years`);
    }
  }

  return { valid: result.errors.length === 0, errors: result.errors };
}
