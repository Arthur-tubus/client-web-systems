import type { FieldValidator } from './types';

/**
 * Кожна фабрика повертає FieldValidator.
 * Композиція (масив валідаторів на полі) дозволяє комбінувати правила
 * без написання окремої функції на кожну комбінацію "обов'язкове + email".
 */

export const required = (message = "Поле обов'язкове"): FieldValidator => {
  return (value) => (value.trim().length === 0 ? message : null);
};

export const minLength = (min: number, message?: string): FieldValidator => {
  return (value) =>
    value.trim().length > 0 && value.trim().length < min
      ? message ?? `Мінімум ${min} символів`
      : null;
};

export const isEmail = (message = 'Некоректний email'): FieldValidator => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (value) => (value.trim().length > 0 && !EMAIL_REGEX.test(value) ? message : null);
};

export const isInteger = (message = 'Значення має бути цілим числом'): FieldValidator => {
  return (value) => (value.trim().length > 0 && !/^\d+$/.test(value.trim()) ? message : null);
};

export const inRange = (min: number, max: number, message?: string): FieldValidator => {
  return (value) => {
    if (value.trim().length === 0) return null;
    const num = Number(value);
    if (Number.isNaN(num) || num < min || num > max) {
      return message ?? `Значення має бути від ${min} до ${max}`;
    }
    return null;
  };
};

/**
 * Прогонити значення через усі валідатори поля.
 * Повертає ПЕРШУ помилку (найпростіша UX-модель для навчального прикладу).
 */
export function runValidators(value: string, validators: FieldValidator[] = []): string | null {
  for (const validate of validators) {
    const error = validate(value);
    if (error) return error;
  }
  return null;
}
