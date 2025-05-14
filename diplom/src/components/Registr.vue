<template>
  <div class="registration-page">
    <div class="registration-container">
      <div >
        <h1 class="registration-title">Регистрация</h1>
        
      </div>
      <form @submit.prevent="handleSubmit" class="registration-form">
        <div class="form-group">
          <label for="name">Имя:</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            required
            placeholder="Введите ваше имя"
            class="form-input"
            :class="{ 'error': errors.name }"
            :disabled="isLoading"
            @blur="validateName"
          >
          <p v-if="errors.name" class="error-message">{{ errors.name }}</p>
        </div>
        
        <div class="form-group">
          <label for="surname">Фамилия:</label>
          <input
            type="text"
            id="surname"
            v-model="form.surname"
            required
            placeholder="Введите вашу фамилию"
            class="form-input"
            :class="{ 'error': errors.surname }"
            :disabled="isLoading"
            @blur="validateSurname"
          >
          <p v-if="errors.surname" class="error-message">{{ errors.surname }}</p>
        </div>
        
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder="Введите ваш email"
            class="form-input"
            :class="{ 'error': errors.email }"
            :disabled="isLoading"
            @blur="validateEmail"
          >
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
        </div>
        
        <div class="form-group">
          <label for="phone">Телефон:</label>
          <input
            type="tel"
            id="phone"
            v-model="form.phone"
            required
            placeholder="Введите ваш телефон"
            class="form-input"
            :class="{ 'error': errors.phone }"
            :disabled="isLoading"
            @blur="validatePhone"
          >
          <p v-if="errors.phone" class="error-message">{{ errors.phone }}</p>
        </div>
        
        <div class="form-group">
          <label for="password">Пароль:</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="Придумайте пароль (минимум 8 символов)"
            class="form-input"
            :class="{ 'error': errors.password }"
            :disabled="isLoading"
            @blur="validatePassword"
          >
          <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
        </div>
        
        <div class="form-group">
          <label for="password_repetition">Повторите пароль:</label>
          <input
            type="password"
            id="password_repetition"
            v-model="form.password_repetition"
            required
            placeholder="Повторите пароль"
            class="form-input"
            :class="{ 'error': errors.password_repetition || (!passwordsMatch && form.password_repetition) }"
            :disabled="isLoading"
            @blur="validatePasswordRepetition"
          >
          <p v-if="errors.password_repetition" class="error-message">{{ errors.password_repetition }}</p>
          <p v-if="!passwordsMatch && form.password_repetition && !errors.password_repetition" class="error-message">Пароли не совпадают</p>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isLoading || !isFormValid">
          <span v-if="!isLoading">Зарегистрироваться</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>
      
      <div v-if="submitted" class="success-message">
        <p>Регистрация прошла успешно! Перенаправляем на страницу входа...</p>
      </div>
      
      <div v-if="serverError" class="error-message server-error">
        {{ serverError }}
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'RegistrationPage',
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      form: {
        name: '',
        surname: '',
        email: '',
        phone: '',
        password: '',
        password_repetition: ''
      },
      errors: {
        name: '',
        surname: '',
        email: '',
        phone: '',
        password: '',
        password_repetition: ''
      },
      submitted: false,
      isLoading: false,
      serverError: '',
      redirectTimer: null
    };
  },
  computed: {
    passwordsMatch() {
      return this.form.password === this.form.password_repetition;
    },
    isFormValid() {
      return Object.values(this.errors).every(error => !error) && 
             this.passwordsMatch &&
             Object.values(this.form).every(field => field !== '');
    }
  },
  methods: {
    validateName() {
      const cyrillicRegex = /^[а-яё\s\-]+$/iu;
      if (!this.form.name) {
        this.errors.name = 'Поле обязательно для заполнения';
      } else if (!cyrillicRegex.test(this.form.name)) {
        this.errors.name = 'Только кириллица, пробелы и дефисы';
      } else {
        this.errors.name = '';
      }
    },
    validateSurname() {
      const cyrillicRegex = /^[а-яё\s\-]+$/iu;
      if (!this.form.surname) {
        this.errors.surname = 'Поле обязательно для заполнения';
      } else if (!cyrillicRegex.test(this.form.surname)) {
        this.errors.surname = 'Только кириллица, пробелы и дефисы';
      } else {
        this.errors.surname = '';
      }
    },
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.form.email) {
        this.errors.email = 'Поле обязательно для заполнения';
      } else if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Введите корректный email';
      } else {
        this.errors.email = '';
      }
    },
    validatePhone() {
      const phoneRegex = /^\+?[0-9\-\s()]+$/;
      if (!this.form.phone) {
        this.errors.phone = 'Поле обязательно для заполнения';
      } else if (!phoneRegex.test(this.form.phone)) {
        this.errors.phone = 'Неверный формат телефона';
      } else {
        this.errors.phone = '';
      }
    },
    validatePassword() {
      if (!this.form.password) {
        this.errors.password = 'Поле обязательно для заполнения';
      } else if (this.form.password.length < 8) {
        this.errors.password = 'Минимум 8 символов';
      } else {
        this.errors.password = '';
      }
    },
    validatePasswordRepetition() {
      if (!this.form.password_repetition) {
        this.errors.password_repetition = 'Поле обязательно для заполнения';
      } else if (!this.passwordsMatch) {
        this.errors.password_repetition = 'Пароли должны совпадать';
      } else {
        this.errors.password_repetition = '';
      }
    },
    async handleSubmit() {
      if (this.isLoading || !this.isFormValid) return;
      
      this.isLoading = true;
      this.serverError = '';

      try {
        const response = await fetch('https://k-kaneva.сделай.site/api/registr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.form)
        });

        const data = await response.json();

        if (response.ok) {
          this.submitted = true;
          this.resetForm();
          
          // Перенаправление через 2 секунды
          this.redirectTimer = setTimeout(() => {
            this.router.push('/login');
          }, 2000);
        } else {
          if (data.errors) {
            for (const [field, message] of Object.entries(data.errors)) {
              if (this.errors.hasOwnProperty(field)) {
                this.errors[field] = message[0];
              }
            }
          } else if (data.message) {
            this.serverError = data.message;
          } else {
            this.serverError = 'Произошла ошибка при регистрации';
          }
        }
      } catch (error) {
        console.error('Ошибка сети:', error);
        this.serverError = 'Произошла ошибка при отправке данных';
      } finally {
        this.isLoading = false;
      }
    },
    resetForm() {
      this.form = {
        name: '',
        surname: '',
        email: '',
        phone: '',
        password: '',
        password_repetition: ''
      };
      this.errors = {
        name: '',
        surname: '',
        email: '',
        phone: '',
        password: '',
        password_repetition: ''
      };
    }
  },
  beforeUnmount() {
    // Очищаем таймер при размонтировании компонента
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }
};
</script>

<style scoped>
.registration-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 65vh;
  background-color: #f5f5f5;
  padding: 20px;
  font-family: 'Montserrat', sans-serif;
}

.registration-container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(45, 59, 34, 0.1);
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.registration-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2D3B22;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
}

.registration-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 5px;
  background: linear-gradient(90deg, #2D3B22, #83aa64);
  border-radius: 2px;
}



.registration-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: #2D3B22;
  font-size: 14px;
  font-weight: 500;
}

.form-input {
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.form-input:focus {
  outline: none;
  border-color: #2D3B22;
  box-shadow: 0 0 0 2px rgba(45, 59, 34, 0.1);
}

.form-input:disabled {
  background-color: #eee;
  cursor: not-allowed;
}

.form-input.error {
  border-color: #ff4444;
}

.error-message {
  color: #ff4444;
  font-size: 0.8em;
  margin-top: 5px;
}

.server-error {
  margin-top: 20px;
  padding: 12px;
  background-color: #fff0f0;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  border: 1px solid #ffd0d0;
}

.submit-btn {
  padding: 14px;
  background-color: #2D3B22;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #465835;
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background-color: #a1a99a;
  cursor: not-allowed;
  opacity: 0.8;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-message {
  margin-top: 20px;
  padding: 15px;
  background-color: #dff0d8;
  border: 1px solid #d6e9c6;
  border-radius: 8px;
  color: #3c763d;
  text-align: center;
}

@media (max-width: 480px) {
  .registration-container {
    padding: 30px 20px;
  }
  
  .registration-title {
    font-size: 2rem;
  }
  
  .form-input, .submit-btn {
    padding: 12px 14px;
  }
}
</style>