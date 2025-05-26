<template>
  <div class="login-page">
    <div class="login-container">
      <div>
        <h1 class="login-title">Вход в систему</h1>
      </div>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Введите ваш email"
            class="form-input"
            :disabled="isLoading"
          />
        </div>
        <div class="form-group password-group">
          <label for="password">Пароль:</label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              placeholder="Введите ваш пароль"
              class="form-input"
              :disabled="isLoading"
            />
            <span class="password-toggle" @click="togglePasswordVisibility">
              <i v-if="showPassword" class="eye-icon">👁️</i>
              <i v-else class="eye-icon">👁️</i>
            </span>
          </div>
        </div>
        <button 
          type="submit" 
          class="submit-btn" 
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="!isLoading">Войти</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      isLoading: false,
      showPassword: false
    }
  },
  computed: {
    isFormValid() {
      return this.email.trim() !== '' && this.password.trim() !== '';
    }
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async handleSubmit() {
      if (this.isLoading || !this.isFormValid) return;
      
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const response = await axios.post('https://k-kaneva.сделай.site/api/login', {
          email: this.email,
          password: this.password
        });

        if (response.status === 200 && response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          this.router.push('/');
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.errorMessage = 'Неправильный email или пароль';
        } else {
          this.errorMessage = 'Произошла ошибка при входе. Попробуйте позже.';
          console.error('Login error:', error);
        }
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    if (localStorage.getItem('authToken')) {
      this.router.push('/');
    }
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
  font-family: 'Montserrat', sans-serif;
  background-image: url('https://k-kaneva.xn--80ahdri7a.site/assets/upload/regis1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 0;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(45, 59, 34, 0.1);
  padding: 40px;
  position: relative;
  z-index: 1;
}

.login-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2D3B22;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
}

.login-title::after {
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center; /* Добавлено для центрирования */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%; /* Добавлено для одинаковой ширины */
  max-width:400px; /* Ограничение ширины как у кнопки */
}

.password-group {
  position: relative;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  user-select: none;
}

.eye-icon {
  font-size: 16px;
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
  background-color: rgba(249, 249, 249, 0.8);
  width: 100%; /* Изменено на 100% для заполнения родителя */
  box-sizing: border-box; /* Добавлено для правильного расчета ширины */
}

.form-input:focus {
  outline: none;
  border-color: #2D3B22;
  box-shadow: 0 0 0 2px rgba(45, 59, 34, 0.1);
}

.form-input:disabled {
  background-color: rgba(238, 238, 238, 0.8);
  cursor: not-allowed;
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
  width: 100%;
  max-width:400px /* Ограничение ширины */
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

.error-message {
  margin-top: 20px;
  padding: 12px;
  background-color: rgba(255, 240, 240, 0.8);
  color: #d32f2f;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  border: 1px solid #ffd0d0;
  width: 100%;
  max-width: 340px; /* Согласовано с другими элементами */
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 2rem;
  }
  
  .form-input, .submit-btn {
    padding: 12px 14px;
  }
}
</style>