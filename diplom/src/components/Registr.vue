<template>
  <div class="registration-page">
    <div class="background-floral"></div>
    
    <div v-if="!submitted" class="registration-container">
      <div class="registration-header">
        <h1>Регистрация</h1>
        <div class="logo-decoration"></div>
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
      
      <div v-if="serverError" class="error-message server-error">
        {{ serverError }}
      </div>
    </div>

    <div v-if="submitted" class="success-container">
      <div class="success-content">
        <svg class="success-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
        </svg>
        <h2>Регистрация успешно завершена!</h2>
        <p>Ваш аккаунт был создан. Теперь вы можете войти в систему.</p>
        <button @click="goToLogin" class="login-btn">Перейти к входу</button>
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
    },
    goToLogin() {
      this.router.push('/login');
    }
  },
  beforeUnmount() {
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
  min-height: 100vh;
  padding: 20px;
  position: relative;
  background-color: #f9f9f7;
}

.background-floral {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" opacity="0.05"><path d="M50,30 C55,20 65,20 70,30 C75,40 70,50 60,50 C70,50 75,60 70,70 C65,80 55,80 50,70 C45,80 35,80 30,70 C25,60 30,50 40,50 C30,50 25,40 30,30 C35,20 45,20 50,30 Z" fill="%232D3B22"/></svg>');
  background-repeat: repeat;
  z-index: 0;
}

.registration-container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(45, 59, 34, 0.1);
  padding: 40px;
  position: relative;
  z-index: 1;
}

.registration-header {
  margin-bottom: 32px;
  text-align: center;
  position: relative;
}

.registration-header h1 {
  color: #2D3B22;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
}

.logo-decoration {
  height: 4px;
  width: 60px;
  background: #2D3B22;
  margin: 0 auto;
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

.success-container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(45, 59, 34, 0.1);
  padding: 40px;
  position: relative;
  z-index: 1;
  text-align: center;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.success-icon {
  width: 80px;
  height: 80px;
  color: #4CAF50;
}

.success-container h2 {
  color: #2D3B22;
  font-size: 24px;
  margin-bottom: 10px;
}

.success-container p {
  color: #555;
  font-size: 16px;
  margin-bottom: 20px;
}

.login-btn {
  padding: 12px 24px;
  background-color: #2D3B22;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background-color: #465835;
  transform: translateY(-1px);
}

.login-btn:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .registration-container, .success-container {
    padding: 30px 20px;
  }
  
  .registration-header h1 {
    font-size: 24px;
  }
  
  .form-input, .submit-btn {
    padding: 12px 14px;
  }
  
  .success-icon {
    width: 60px;
    height: 60px;
  }
  
  .success-container h2 {
    font-size: 20px;
  }
}
</style>