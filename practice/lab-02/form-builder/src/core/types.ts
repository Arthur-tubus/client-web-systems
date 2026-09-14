/**
 * Одна функція-валідатор для конкретного поля.
 * Повертає рядок помилки або null, якщо значення валідне.
 * Валідатори навмисно "тупі" й не знають нічого про DOM чи форму в цілому —
 * це чисті функції (string) => string | null, які легко тестувати окремо.
 */
export type FieldValidator = (value: string) => string | null;

export type FieldType = 'text' | 'email' | 'number' | 'password' | 'select';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Опис одного поля форми.
 * `name` типізований через keyof T — це і є місце, де Generics
 * дають реальну користь: неможливо описати поле, якого немає в T,
 * і неможливо помилитись у назві при зборі даних форми.
 */
export interface FieldConfig<T> {
  name: keyof T & string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: SelectOption[]; // тільки для type === 'select'
  validators?: FieldValidator[];
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface FormBuilderOptions<T extends Record<string, string>> {
  fields: FieldConfig<T>[];
  submitLabel: string;
  /**
   * onSubmit повертає Promise — форма сама показує стан завантаження
   * і ловить помилку, якщо запит впав.
   */
  onSubmit: (data: T) => Promise<void>;
}
