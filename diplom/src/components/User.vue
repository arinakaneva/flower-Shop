<template>
  <div class="personal-cabinet">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка данных...</p>
    </div>
    <div v-else-if="error" class="error">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
      <button @click="fetchUserData" class="retry-btn">Попробовать снова</button>
    </div>
    <div v-else class="user-profile">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-placeholder">
            {{ userInitials }}
          </div>
          <div class="user-info">
            <h2>{{ fullName }}</h2>
            <div class="user-role">{{ roleName }}</div>
          </div>
        </div>
        
        <div class="profile-details">
          <div class="detail-item">
            <div class="detail-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ user.email || 'Не указан' }}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <div class="detail-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Телефон</span>
              <span class="detail-value">{{ formattedPhone }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PersonalCabinet',
  data() {
    return {
      loading: true,
      error: null,
      user: {
        id_user: null,
        name: '',
        surname: '',
        email: '',
        phone: '',
        isAdmin: false
      }
    }
  },
  computed: {
    fullName() {
      return `${this.user.surname} ${this.user.name}`;
    },
    userInitials() {
      return `${this.user.surname.charAt(0)}${this.user.name.charAt(0)}`.toUpperCase();
    },
    formattedPhone() {
      if (!this.user.phone) return 'Не указан';
      const phone = this.user.phone.replace(/\D/g, '');
      return `${phone[0]} (${phone.substring(1, 4)}) ${phone.substring(4, 7)}-${phone.substring(7, 9)}-${phone.substring(9)}`;
    },
    roleName() {
      return this.user.isAdmin ? 'Администратор' : 'Пользователь';
    }
  },
  created() {
    this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      try {
        this.loading = true;
        this.error = null;
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('Вы не авторизованы');
        }
        
        const response = await fetch('https://k-kaneva.сделай.site/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
          throw new Error(data.error?.message || 'Вы не авторизованы');
        }
        
        if (!response.ok) {
          throw new Error(data.error?.message || 'Ошибка при получении данных');
        }
        
        // Обновляем данные пользователя в соответствии с API бэкенда
        this.user = {
          id_user: data.id_user,
          name: data.name,
          surname: data.surname,
          email: data.email,
          phone: data.phone,
          isAdmin: data.isAdmin
        };
        
        this.loading = false;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        console.error('Ошибка:', error);
      }
    },
  }
}
</script>

<style scoped>
/* Стили остаются без изменений */
.personal-cabinet {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Montserrat', sans-serif;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #2D3B22;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(74, 111, 165, 0.2);
  border-radius: 50%;
  border-top-color: #2D3B22;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  padding: 2rem;
  background: #fff5f5;
  border-radius: 12px;
  color: #d33;
}

.error-icon {
  width: 60px;
  height: 60px;
  background: #d33;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #d33;
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #b31a1a;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(211, 51, 51, 0.2);
}

.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #2D3B22 0%, #83aa64 100%);
  color: white;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.user-role {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.profile-details {
  padding: 1.5rem 2rem;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 1.25rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-icon {
  width: 44px;
  height: 44px;
  background: #f5f8ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.25rem;
  flex-shrink: 0;
  color: #2D3B22;
}

.detail-icon svg {
  width: 20px;
  height: 20px;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.detail-value {
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
}

@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .avatar-placeholder {
    margin-right: 0;
    margin-bottom: 1rem;
    width: 70px;
    height: 70px;
    font-size: 1.8rem;
  }

  .user-info h2 {
    font-size: 1.5rem;
  }

  .profile-details {
    padding: 1rem;
  }

  .detail-item {
    padding: 1rem 0;
  }

  .detail-icon {
    width: 36px;
    height: 36px;
    margin-right: 1rem;
  }
}
</style>