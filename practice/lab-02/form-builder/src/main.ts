import './style.css';
import { buildForm } from './core/FormBuilder';
import { required, minLength, isEmail, isInteger, inRange } from './core/validators';
import { registerUser } from './api/fakeApi';

/**
 * Форма-специфічний тип. FormBuilder generic — конкретну форму
 * ми описуємо тут, у "точці використання", а не всередині ядра.
 */
interface RegisterFormData extends Record<string, string> {
  name: string;
  email: string;
  age: string;
}

const app = document.getElementById('app')!;

const title = document.createElement('h1');
title.className = 'page-title';
title.textContent = 'Реєстрація (демо)';

const wrapper = document.createElement('div');
wrapper.className = 'page-wrapper';

const form = buildForm<RegisterFormData>({
  fields: [
    {
      name: 'name',
      label: "Ім'я",
      type: 'text',
      placeholder: 'Тарас',
      validators: [required(), minLength(2, 'Мінімум 2 символи')],
    },
      {
      name: 'surname',
      label: "Прізвище",
      type: 'text',
      placeholder: 'Шевченко',
      validators: [required(), minLength(2, 'Мінімум 2 символи')],
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      // Спробувати taken@example.com — щоб побачити "бізнес"-помилку сервера
      validators: [required(), isEmail()],
    },
    {
      name: 'age',
      label: 'Вік',
      type: 'text',
      placeholder: '18',
      validators: [required(), isInteger(), inRange(16, 100, 'Вік має бути від 16 до 100')],
    },
  ],
  submitLabel: 'Зареєструватись',
  onSubmit: (data) => registerUser(data),
});

const hint = document.createElement('p');
hint.className = 'fb-hint';
hint.textContent =
  '~20% запитів завершуються "мережевою помилкою" випадково — для демонстрації catch. ' +
  'Спробуйте також email taken@example.com.';

wrapper.append(title, form, hint);
app.append(wrapper);
