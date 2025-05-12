<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <router-link to="/">
          <img 
            src="https://k-kaneva.xn--80ahdri7a.site/assets/upload/logo.png" 
            alt="YES time for flowers"
            class="logo-image"
            @error="handleLogoError"
          >
        </router-link>
      </div>
      
      <!-- Мобильное меню (бургер) -->
      <button class="mobile-menu-btn" @click="toggleMenu" v-if="!isAdmin">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <nav :class="{ 'active': menuOpen }">
        <ul v-if="isAdmin">
          <li><router-link to="/admin">Админ панель</router-link></li>
          <li><button @click="logout" class="logout-btn">Выйти</button></li>
        </ul>
        <ul v-else>
          <li><router-link to="/product">Каталог</router-link></li>
          <li v-if="isAuthenticated"><router-link to="/cart">Корзина</router-link></li>
          <li v-if="isAuthenticated"><router-link to="/order">Заказы</router-link></li>
          <li v-if="isAuthenticated"><router-link to="/user">Личный кабинет</router-link></li>
          <li v-if="!isAuthenticated"><router-link to="/registr">Регистрация</router-link></li>
          <li v-if="!isAuthenticated"><router-link to="/login">Вход</router-link></li>
          <li v-if="isAuthenticated"><button @click="logout" class="logout-btn">Выйти</button></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      isAuthenticated: false,
      isAdmin: false,
      menuOpen: false
    };
  },
  created() {
    this.checkAuth();
    this.$router.afterEach(() => {
      this.checkAuth();
      this.menuOpen = false; // Закрываем меню при переходе
    });
  },
  methods: {
    async checkAuth() {
      const token = localStorage.getItem('authToken');
      this.isAuthenticated = !!token;
      
      if (this.isAuthenticated) {
        try {
          const response = await axios.get('https://k-kaneva.сделай.site/api/user', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          this.isAdmin = response.data.isAdmin || false;
        } catch (error) {
          console.error('Ошибка при проверке прав администратора:', error);
          this.isAdmin = false;
        }
      } else {
        this.isAdmin = false;
      }
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    handleLogoError(event) {
      // Заменяем битое изображение на текстовый логотип
      event.target.style.display = 'none';
      const textLogo = document.createElement('span');
      textLogo.textContent = 'YES time for flowers';
      textLogo.classList.add('text-logo');
      event.target.parentNode.appendChild(textLogo);
    },
    async logout() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('Пользователь не авторизован');
          this.isAuthenticated = false;
          this.isAdmin = false;
          return;
        }

        const response = await axios.get('https://k-kaneva.сделай.site/api/logout', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          localStorage.removeItem('authToken');
          this.isAuthenticated = false;
          this.isAdmin = false;
          
          if (this.$store) {
            this.$store.commit('clearAuthData');
          }
          
          console.log(response.data.message);
          this.$router.push('/login');
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('Пользователь не авторизован');
          localStorage.removeItem('authToken');
          this.isAuthenticated = false;
          this.isAdmin = false;
        } else {
          console.error('Ошибка при выходе из системы:', error);
        }
      }
    }
  }
};
</script>

<style scoped>
/* Основные стили */
.header {
  background-color: #2D3B22;
  color: white;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo a {
  display: flex;
  align-items: center;
  height: 100%;
  text-decoration: none;
}

.logo-image {
  height: 70px;
  width: auto;
  transition: opacity 0.3s;
}

.logo-image:hover {
  opacity: 0.8;
}

.text-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
  font-family: 'Playfair Display', serif;
}

nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 25px;
}

nav li {
  display: flex;
  align-items: center;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  padding: 5px 0;
  position: relative;
  font-size: 1rem;
}

nav a:hover {
  color: #a3cfbb;
}

nav a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #a3cfbb;
  transition: width 0.3s;
}

nav a:hover::after {
  width: 100%;
}

.router-link-active {
  color: #a3cfbb;
  font-weight: 600;
}

.router-link-active::after {
  width: 100%;
}

.logout-btn {
  background: none;
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  padding: 5px 0;
  transition: color 0.3s;
  position: relative;
}

.logout-btn:hover {
  color: #a3cfbb;
}

.logout-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #a3cfbb;
  transition: width 0.3s;
}

.logout-btn:hover::after {
  width: 100%;
}

/* Мобильное меню */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  z-index: 1001;
}

.mobile-menu-btn span {
  display: block;
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 5px 0;
  transition: all 0.3s;
}

/* Адаптивность */
@media (max-width: 768px) {
  .container {
    height: 60px;
    padding: 0 15px;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu-btn.active span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }
  
  .mobile-menu-btn.active span:nth-child(2) {
    opacity: 0;
  }
  
  .mobile-menu-btn.active span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }
  
  nav {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    background-color: #2D3B22;
    padding: 20px 0;
    transform: translateY(-150%);
    transition: transform 0.3s;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  }
  
  nav.active {
    transform: translateY(0);
  }
  
  nav ul {
    flex-direction: column;
    gap: 15px;
    padding: 0 20px;
  }
  
  nav a, .logout-btn {
    font-size: 1.1rem;
    padding: 8px 0;
    display: block;
  }
  
  .logo-image {
    height: 40px;
  }
  
  .text-logo {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .logo-image {
    height: 35px;
  }
}
</style>