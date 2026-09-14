import type { FieldConfig, FormBuilderOptions } from './types';
import { runValidators } from './validators';

/**
 * buildForm<T> — єдина точка, що вміє:
 *  1. згенерувати DOM-розмітку форми з конфігурації полів;
 *  2. валідувати кожне поле "наживо" (blur) і повністю перед сабмітом;
 *  3. викликати onSubmit(data), показати спінер на кнопці,
 *     і коректно відобразити або успіх, або помилку запиту.
 *
 * T обмежений Record<string, string> — усі значення полів у DOM завжди
 * рядки; перетворення в number/boolean — відповідальність викликача
 * (див. main.ts), а не білдера. Це свідоме архітектурне рішення:
 * форма не повинна знати про доменні типи, лише про рядкові значення полів.
 */
export function buildForm<T extends Record<string, string>>(
  options: FormBuilderOptions<T>
): HTMLFormElement {
  const form = document.createElement('form');
  form.className = 'fb-form';
  form.noValidate = true; // вимикаємо нативну валідацію браузера — керуємо самі

  const inputs = new Map<keyof T, HTMLInputElement | HTMLSelectElement>();
  const errorNodes = new Map<keyof T, HTMLElement>();

  options.fields.forEach((field) => {
    const { wrapper, control, errorNode } = renderField(field);
    inputs.set(field.name, control);
    errorNodes.set(field.name, errorNode);

    control.addEventListener('blur', () => {
      validateField(field, control.value, errorNode);
    });

    form.append(wrapper);
  });

  const statusBanner = document.createElement('div');
  statusBanner.className = 'fb-status';
  statusBanner.hidden = true;

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'fb-submit';
  submitBtn.textContent = options.submitLabel;

  form.append(statusBanner, submitBtn);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideStatus(statusBanner);

    // 1. Повна валідація всіх полів перед відправкою
    let isFormValid = true;
    const data = {} as T;

    options.fields.forEach((field) => {
      const control = inputs.get(field.name)!;
      const errorNode = errorNodes.get(field.name)!;
      const valid = validateField(field, control.value, errorNode);
      if (!valid) isFormValid = false;
      data[field.name] = control.value as T[typeof field.name];
    });

    if (!isFormValid) {
      showStatus(statusBanner, 'Виправте помилки у формі', 'error');
      return;
    }

    // 2. Async submit зі станом завантаження та обробкою помилок
    setLoading(submitBtn, true);
    try {
      await options.onSubmit(data);
      showStatus(statusBanner, 'Успішно збережено', 'success');
      form.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Сталася невідома помилка';
      showStatus(statusBanner, message, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });

  return form;
}

function validateField<T>(
  field: FieldConfig<T>,
  value: string,
  errorNode: HTMLElement
): boolean {
  const error = runValidators(value, field.validators);
  errorNode.textContent = error ?? '';
  errorNode.hidden = !error;
  return error === null;
}

function renderField<T>(field: FieldConfig<T>): {
  wrapper: HTMLElement;
  control: HTMLInputElement | HTMLSelectElement;
  errorNode: HTMLElement;
} {
  const wrapper = document.createElement('div');
  wrapper.className = 'fb-field';

  const label = document.createElement('label');
  label.className = 'fb-label';
  label.textContent = field.label;
  label.htmlFor = field.name;

  let control: HTMLInputElement | HTMLSelectElement;

  if (field.type === 'select') {
    const select = document.createElement('select');
    select.className = 'fb-control';
    (field.options ?? []).forEach((opt) => {
      const optionEl = document.createElement('option');
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      select.append(optionEl);
    });
    control = select;
  } else {
    const input = document.createElement('input');
    input.type = field.type;
    input.className = 'fb-control';
    if (field.placeholder) input.placeholder = field.placeholder;
    control = input;
  }

  control.id = field.name;
  control.name = field.name;

  const errorNode = document.createElement('span');
  errorNode.className = 'fb-error';
  errorNode.hidden = true;

  wrapper.append(label, control, errorNode);
  return { wrapper, control, errorNode };
}

function setLoading(button: HTMLButtonElement, isLoading: boolean): void {
  if (isLoading) {
    button.dataset.label = button.dataset.label ?? button.textContent ?? '';
    button.textContent = 'Відправка…';
  } else {
    button.textContent = button.dataset.label ?? button.textContent ?? '';
  }
  button.disabled = isLoading;
  button.classList.toggle('fb-submit--loading', isLoading);
}

function showStatus(node: HTMLElement, message: string, type: 'success' | 'error'): void {
  node.textContent = message;
  node.className = `fb-status fb-status--${type}`;
  node.hidden = false;
}

function hideStatus(node: HTMLElement): void {
  node.hidden = true;
  node.textContent = '';
}
