document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('form.auth-form');

  forms.forEach(form => {
    const inputs = form.querySelectorAll('input[data-required-error]');

    // Добавляем обработчики событий для каждого поля ввода
    inputs.forEach(input => {
      // Валидация при вводе (режим реального времени)
      input.addEventListener('input', function() {
        validateField(this, true);
      });

      // Валидация при потере фокуса
      input.addEventListener('blur', function() {
        validateField(this, false);
      });
    });

    // Обработчик отправки формы
    form.addEventListener('submit', async function(e) {
      e.preventDefault(); // Отменяем стандартную отправку

      let isFormValid = true;

      // Проверяем все поля перед отправкой
      inputs.forEach(input => {
        if (!validateField(input, false)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) return;

      // Подготавливаем данные формы для отправки
      const formData = new FormData(form);

      try {
        // Отправляем запрос на сервер
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value
          }
        });

        // Обрабатываем ответ сервера
        if (response.ok) {
          const data = await response.json();

          // Если есть URL для перенаправления (успешный вход/регистрация)
          if (data.redirect_url) {
            window.location.href = data.redirect_url;
          }
          // Если есть ошибки сервера
          else if (data.errors) {
            displayServerErrors(form, data.errors);
          }
        }
        // Обработка других статусов ответа
        else {
          const data = await response.json();
          if (data.errors) {
            displayServerErrors(form, data.errors);
          }
        }
      } catch (error) {
        console.error('Ошибка при отправке формы:', error);
      }
    });
  });

  /**
   * Валидация отдельного поля формы
   * @param {HTMLInputElement} input - Поле ввода для валидации
   * @param {boolean} isRealTimeCheck - Флаг проверки в реальном времени
   * @returns {boolean} - Результат валидации
   */
  function validateField(input, isRealTimeCheck) {
    const errorElement = input.nextElementSibling;
    let isValid = true;
    let errorMessage = '';

    // Проверка обязательных полей
    if (input.required && !input.value.trim()) {
      errorMessage = input.dataset.requiredError;
      isValid = false;
    }
    // Проверка по регулярному выражению
    else if (input.dataset.pattern && !new RegExp(input.dataset.pattern).test(input.value)) {
      errorMessage = input.dataset.patternError;
      isValid = false;
    }
    // Проверка email
    else if (input.type === 'email' && !isValidEmail(input.value)) {
      errorMessage = input.dataset.typeError;
      isValid = false;
    }
    // Проверка длины пароля
    else if (input.dataset.minLength && (
      input.value.length < parseInt(input.dataset.minLength) ||
      input.value.length > parseInt(input.dataset.maxLength)
    )) {
      errorMessage = input.dataset.lengthError;
      isValid = false;
    }
    // Проверка совпадения паролей
    else if (input.dataset.match) {
      const matchField = document.querySelector(input.dataset.match);
      if (matchField && input.value !== matchField.value) {
        errorMessage = input.dataset.matchError;
        isValid = false;
      }
    }

    // Обновление UI только если:
    // - это не проверка в реальном времени ИЛИ
    // - поле не пустое
    if (!isRealTimeCheck || input.value.trim() !== '') {
      // Сброс предыдущих состояний
      input.classList.remove('valid', 'invalid');
      errorElement.style.display = 'none';

      // Показ ошибки, если есть
      if (!isValid) {
        input.classList.add('invalid');
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      }
      // Показ успешного состояния, если поле заполнено корректно
      else if (input.value.trim() !== '') {
        input.classList.add('valid');
      }
    }

    return isValid;
  }

  /**
   * Валидация email
   * @param {string} email - Email для проверки
   * @returns {boolean} - Результат валидации
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Отображение ошибок сервера
   * @param {HTMLFormElement} form - Форма
   * @param {Object} errors - Объект с ошибками
   */
  function displayServerErrors(form, errors) {
    Object.keys(errors).forEach(field => {
      const input = form.querySelector(`[name=${field}]`);
      if (input) {
        const errorElement = input.nextElementSibling;
        input.classList.add('invalid');
        errorElement.textContent = errors[field];
        errorElement.style.display = 'block';
      }
    });
  }
});


//document.addEventListener('DOMContentLoaded', function() {
//  const forms = document.querySelectorAll('form');
//
//  forms.forEach(form => {
//    const inputs = form.querySelectorAll('input[data-required-error]');
//
//    inputs.forEach(input => {
//      input.addEventListener('input', function() {
//        validateField(this, true);
//      });
//
//      input.addEventListener('blur', function() {
//        validateField(this, false);
//      });
//    });
//  });
//
//  function validateField(input, isRealTimeCheck) {
//    const errorElement = input.nextElementSibling;
//    let isValid = true;
//    let errorMessage = '';
//
//    if (input.required && !input.value.trim()) {
//      errorMessage = input.dataset.requiredError;
//      isValid = false;
//    }
//
//    else if (input.dataset.pattern && !new RegExp(input.dataset.pattern).test(input.value)) {
//      errorMessage = input.dataset.patternError;
//      isValid = false;
//    }
//
//    else if (input.type === 'email' && !isValidEmail(input.value)) {
//      errorMessage = input.dataset.typeError;
//      isValid = false;
//    }
//
//    else if (input.dataset.minLength && (
//        input.value.length < parseInt(input.dataset.minLength) || input.value.length > parseInt(input.dataset.maxLength)
//        )) {
//      errorMessage = input.dataset.lengthError;
//      isValid = false;
//    }
//
//    else if (input.dataset.match) {
//      const matchField = document.querySelector(input.dataset.match);
//      if (matchField && input.value !== matchField.value) {
//        errorMessage = input.dataset.matchError;
//        isValid = false;
//      }
//    }
//
//    if (!isRealTimeCheck || input.value.trim() !== '') {
//      input.classList.remove('valid', 'invalid');
//      errorElement.style.display = 'none';
//
//      if (!isValid) {
//        input.classList.add('invalid');
//        errorElement.textContent = errorMessage;
//        errorElement.style.display = 'block';
//      }
//      else if (input.value.trim() !== '') {
//        input.classList.add('valid');
//      }
//    }
//
//    return isValid;
//  }
//
//  function isValidEmail(email) {
//    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//  }
//});


//document.addEventListener('DOMContentLoaded', function() {
//  // Обрабатываем все формы на странице
//  const forms = document.querySelectorAll('form');
//
//  forms.forEach(form => {
//    // Создаем контейнер для общих ошибок (только для auth-form)
//    if (form.classList.contains('auth-form')) {
//      const generalErrorContainer = document.createElement('div');
//      generalErrorContainer.className = 'general-error-container';
//      form.prepend(generalErrorContainer);
//    }
//
//    const inputs = form.querySelectorAll('input[data-required-error], textarea[data-required-error]');
//
//    // Добавляем обработчики событий для каждого поля
//    inputs.forEach(input => {
//      input.addEventListener('input', function() {
//        validateField(this, true);
//        hideGeneralError(form);
//      });
//
//      input.addEventListener('blur', function() {
//        validateField(this, false);
//      });
//    });
//
//    // Обработчик отправки формы
//    form.addEventListener('submit', async function(e) {
//      if (form.classList.contains('auth-form')) {
//        e.preventDefault();
//        hideGeneralError(form);
//
//        let isFormValid = true;
//        inputs.forEach(input => {
//          if (!validateField(input, false)) {
//            isFormValid = false;
//          }
//        });
//
//        if (!isFormValid) return;
//
//        try {
//          const formData = new FormData(form);
//          const response = await fetch(form.action, {
//            method: 'POST',
//            body: formData,
//            headers: {
//              'X-Requested-With': 'XMLHttpRequest',
//              'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value
//            }
//          });
//
//          const data = await response.json();
//
//          if (response.ok && data.redirect_url) {
//            window.location.href = data.redirect_url;
//          } else {
//            handleFormErrors(form, data.errors || {});
//          }
//        } catch (error) {
//          console.error('Ошибка при отправке формы:', error);
//          showGeneralError(form, 'Произошла ошибка. Пожалуйста, попробуйте еще раз.');
//        }
//      }
//      // Обычные формы будут работать как обычно
//    });
//  });
//
//  /**
//   * Валидация поля формы
//   * @param {HTMLInputElement} input - Поле для валидации
//   * @param {boolean} isRealTimeCheck - Флаг проверки в реальном времени
//   * @returns {boolean} - Результат валидации
//   */
//  function validateField(input, isRealTimeCheck) {
//    const errorElement = input.nextElementSibling;
//    let isValid = true;
//    let errorMessage = '';
//
//    if (input.required && !input.value.trim()) {
//      errorMessage = input.dataset.requiredError || 'Это поле обязательно для заполнения';
//      isValid = false;
//    }
//    else if (input.dataset.pattern && !new RegExp(input.dataset.pattern).test(input.value)) {
//      errorMessage = input.dataset.patternError || 'Неверный формат';
//      isValid = false;
//    }
//    else if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
//      errorMessage = input.dataset.typeError || 'Введите корректный email';
//      isValid = false;
//    }
//    else if (input.dataset.minLength && (
//      input.value.length < parseInt(input.dataset.minLength) ||
//      (input.dataset.maxLength && input.value.length > parseInt(input.dataset.maxLength))
//    )) {
//      errorMessage = input.dataset.lengthError || 'Некорректная длина';
//      isValid = false;
//    }
//    else if (input.dataset.match) {
//      const matchField = document.querySelector(input.dataset.match);
//      if (matchField && input.value !== matchField.value) {
//        errorMessage = input.dataset.matchError || 'Значения не совпадают';
//        isValid = false;
//      }
//    }
//
//    if (!isRealTimeCheck || input.value.trim() !== '') {
//      input.classList.remove('valid', 'invalid');
//      errorElement.style.display = 'none';
//
//      if (!isValid) {
//        input.classList.add('invalid');
//        errorElement.textContent = errorMessage;
//        errorElement.style.display = 'block';
//      }
//      else if (input.value.trim() !== '') {
//        input.classList.add('valid');
//      }
//    }
//
//    return isValid;
//  }
//
//  /**
//   * Показать общую ошибку формы
//   * @param {HTMLFormElement} form - Форма
//   * @param {string} message - Сообщение об ошибке
//   */
//  function showGeneralError(form, message) {
//    const container = form.querySelector('.general-error-container');
//    if (!container) return;
//
//    container.innerHTML = `
//      <div class="general-error-message">
//        ${message}
//      </div>
//    `;
//    container.style.display = 'block';
//  }
//
//  /**
//   * Скрыть общую ошибку формы
//   * @param {HTMLFormElement} form - Форма
//   */
//  function hideGeneralError(form) {
//    const container = form.querySelector('.general-error-container');
//    if (container) {
//      container.style.display = 'none';
//    }
//  }
//
//  /**
//   * Обработка ошибок формы с сервера
//   * @param {HTMLFormElement} form - Форма
//   * @param {Object} errors - Объект с ошибками
//   */
//  function handleFormErrors(form, errors) {
//    // Очищаем все предыдущие ошибки
//    form.querySelectorAll('.error-message').forEach(el => {
//      el.style.display = 'none';
//    });
//
//    // Показываем общие ошибки
//    if (errors.__all__) {
//      showGeneralError(form, errors.__all__);
//    }
//
//    // Показываем ошибки для полей
//    Object.entries(errors).forEach(([fieldName, errorMessage]) => {
//      if (fieldName === '__all__') return;
//
//      const input = form.querySelector(`[name="${fieldName}"]`);
//      if (input) {
//        const errorElement = input.nextElementSibling;
//        input.classList.add('invalid');
//        errorElement.textContent = errorMessage;
//        errorElement.style.display = 'block';
//      }
//    });
//  }
//
//  /**
//   * Проверка валидности email
//   * @param {string} email - Email для проверки
//   * @returns {boolean} - Результат проверки
//   */
//  function isValidEmail(email) {
//    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//  }
//});