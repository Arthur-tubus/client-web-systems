export interface RegisterPayload {
  name: string;
  email: string;
  age: string;
}

/**
 * Імітація реального HTTP-запиту (наприклад, fetch('/api/register', ...)).
 * Форма (FormBuilder) не знає і не повинна знати, що всередині —
 * setTimeout, fetch чи щось третє. Вона працює лише з контрактом
 * "Promise<void>, який може відхилитись з Error".
 *
 * Це та межа, на якій студентам варто пояснити: коли з'явиться
 * реальний бекенд, змінюється тільки цей файл — UI-шар лишається незмінним.
 */
export function registerUser(payload: RegisterPayload): Promise<void> {
  return new Promise((resolve, reject) => {
    const delay = 700 + Math.random() * 600; // імітація мережевої затримки

    setTimeout(() => {
      // Імітація бізнес-помилки з сервера (наприклад, email вже зайнятий)
      if (payload.email.toLowerCase() === 'taken@example.com') {
        reject(new Error('Користувач із такою поштою вже зареєстрований'));
        return;
      }

      // Імітація випадкової мережевої помилки (~20% запитів) —
      // щоб студенти побачили обробку catch не лише "на папері"
      if (Math.random() < 0.2) {
        reject(new Error('Мережева помилка. Спробуйте ще раз.'));
        return;
      }

      resolve();
    }, delay);
  });
}
