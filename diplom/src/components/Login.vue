<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>Вход в систему</h1>
        <div class="logo-decoration"></div>
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
        <div class="form-group">
          <label for="password">Пароль:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Введите ваш пароль"
            class="form-input"
            :disabled="isLoading"
          />
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
      isLoading: false
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
  min-height: 65vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(45, 59, 34, 0.1);
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.login-header {
  margin-bottom: 32px;
  text-align: center;
  position: relative;
}

.login-header h1 {
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

.login-form {
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

.error-message {
  margin-top: 20px;
  padding: 12px;
  background-color: #fff0f0;
  color: #d32f2f;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  border: 1px solid #ffd0d0;
}

@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .form-input, .submit-btn {
    padding: 12px 14px;
  }
}
</style>