<template>
  <div class="cart-page">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Загрузка корзины...</p>
    </div>
    
    <div v-if="error" class="error-message">
      <div class="error-content">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <p>{{ error }}</p>
        <button @click="fetchCartItems" class="retry-button">Попробовать снова</button>
      </div>
    </div>
    
    <div v-if="!loading && !error" class="cart-content">
      <h1 class="page-title">Ваша корзина</h1>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.73 22.73L1.27 1.27 0 2.54l4.39 4.39 2.21 4.66-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h7.46l1.38 1.38c-.5.36-.83.95-.83 1.62 0 1.1.89 2 1.99 2 .67 0 1.26-.33 1.62-.84L21.46 24l1.27-1.27zM7.42 15c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h2.36l2 2H7.42zm8.13-2c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H6.54l9.01 9zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
        <h3>Ваша корзина пуста</h3>
        <p>Начните покупки, чтобы добавить товары в корзину</p>
        <router-link to="/product" class="catalog-button">
          Перейти в каталог
        </router-link>
      </div>
      
      <div v-else>
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id_product" class="cart-item">
            <div class="item-image">
              <div class="image-placeholder">
                <img :src="getImageUrl(item.photo)" :alt="item.name || 'Товар ' + item.id_product" class="item-image">
              </div>
            </div>
            <div class="item-details">
              <h3 class="item-title">Товар: {{ item.name }}</h3>
              <div class="item-price">Цена: {{ formatPrice(item.price) }}</div>
              <div class="item-total">Сумма: {{ formatPrice(item.total_price) }}</div>
            </div>
            <div class="quantity-controls">
              <div class="quantity-value">{{ item.quantity }}</div>
              <button @click="removeFromCart(item.id_product)" class="quantity-btn minus" title="Удалить">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="cart-summary">
          <div class="summary-details">
            <div class="summary-row">
              <span>Итого:</span>
              <span class="total-amount">{{ formatPrice(totalAmount) }}</span>
            </div>
          </div>
          <button class="checkout-btn" @click="showCheckoutModal">
            <span>Оформить заказ</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно оформления заказа -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <button class="modal-close" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        <h2 class="modal-title">Оформление заказа</h2>
        <form @submit.prevent="submitOrder" class="order-form">
          <div class="form-group">
            <label for="name">Имя:</label>
            <input type="text" id="name" v-model="orderData.name" required placeholder="Ваше имя">
          </div>
          
          <div class="form-group">
            <label for="phone">Телефон:</label>
            <input type="tel" id="phone" v-model="orderData.phone" required placeholder="+7 (XXX) XXX-XX-XX">
          </div>
          
          <div class="form-group">
            <label for="address">Адрес доставки:</label>
            <input type="text" id="address" v-model="orderData.address" required placeholder="Город, улица, дом, квартира">
          </div>
          
          <div class="form-group">
            <label for="pay">Способ оплаты:</label>
            <select id="pay" v-model="orderData.pay" required>
              <option value="" disabled selected>Выберите способ оплаты</option>
              <option value="Наличные">Наличные</option>
              <option value="Банковская карта">Банковская карта</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="comment">Комментарий к заказу:</label>
            <textarea id="comment" v-model="orderData.comment" placeholder="Ваши пожелания к заказу"></textarea>
          </div>
          
          <input type="hidden" v-model="orderData.id_cart">
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Отмена</button>
            <button type="submit" class="submit-btn">
              <span>Подтвердить заказ</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartPage',
  data() {
    return {
      cartItems: [],
      loading: true,
      error: null,
      showModal: false,
      orderData: {
        name: '',
        phone: '',
        address: '',
        pay: '',
        comment: '',
        id_cart: null
      }
    }
  },
  computed: {
    totalAmount() {
      return this.cartItems.reduce((sum, item) => sum + item.total_price, 0)
    }
  },
  mounted() {
    this.fetchCartItems()
  },
  methods: {
    async fetchCartItems() {
      try {
        this.loading = true
        this.error = null
        
        const token = localStorage.getItem('authToken')
        if (!token) {
          this.error = 'Вы не авторизованы'
          return
        }
        
        const response = await fetch('https://k-kaneva.сделай.site/api/cart', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || 'Ошибка при загрузке корзины')
        }
        
        const data = await response.json()
        this.cartItems = data.data || []
        
        if (data.data && data.data.length > 0) {
          this.orderData.id_cart = data.data[0].id_cart || null;
        }
      } catch (err) {
        console.error('Ошибка при загрузке корзины:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    
    getImageUrl(dbPath) {
      if (!dbPath) return '';
      if (dbPath.startsWith('http')) return dbPath;
      if (dbPath.includes('/public_html/')) {
        const parts = dbPath.split('/public_html/');
        return `https://k-kaneva.сделай.site/${parts[1]}`;
      }
      if (dbPath.startsWith('assets/')) {
        return `https://k-kaneva.сделай.site/${dbPath}`;
      }
      return `https://k-kaneva.сделай.site/assets/upload/${dbPath}`;
    },
    
    async removeFromCart(id_product) {
      try {
        this.loading = true
        this.error = null
        
        const token = localStorage.getItem('authToken')
        if (!token) {
          throw new Error('Вы не авторизованы')
        }
        
        const response = await fetch(`https://k-kaneva.сделай.site/api/cart/${id_product}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.status === 204) {
          this.fetchCartItems()
          return
        }
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || 'Ошибка при удалении товара')
        }
        
      } catch (err) {
        console.error('Ошибка при удалении товара:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(price)
    },
    
    showCheckoutModal() {
      this.showModal = true;
    },
    
    closeModal() {
      this.showModal = false;
    },
    
    async submitOrder() {
      try {
        this.loading = true;
        this.error = null;
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Вы не авторизованы');
        }
        
        const response = await fetch('https://k-kaneva.сделай.site/api/order', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.orderData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Ошибка при оформлении заказа');
        }
        
        const data = await response.json();
        this.closeModal();
        this.$router.push('/order');
      } catch (err) {
        console.error('Ошибка при оформлении заказа:', err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
/* Основные стили */
:root {
  --litegreen-color: #3E4D31;
  --litegreen-hover: #2D3B22;
  --accent-color: #a7d77f;
  --background-color: #F9F9FF;
  --text-color: #2D3436;
  --light-text: #636E72;
  --error-color: #D63031;
  --success-color: #83aa64;
  --border-color: #64b84d;
  --white: #FFFFFF;
  --shadow: 0 4px 12px rgba(108, 92, 231, 0.1);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Montserrat', sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.6;
}

/* Стили страницы корзины */
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2D3B22;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
}

.page-title::after {
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

/* Стили для состояния загрузки */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(108, 92, 231, 0.2);
  border-radius: 50%;
  border-top-color: var(--litegreen-color);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Стили для ошибки */
.error-message {
  background-color: rgba(214, 48, 49, 0.1);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  text-align: center;
}

.error-content svg {
  width: 40px;
  height: 40px;
  fill: var(--error-color);
  margin-bottom: 15px;
}

.error-content p {
  color: var(--error-color);
  font-weight: 500;
  margin-bottom: 15px;
}

.retry-button {
  background-color: var(--error-color);
  color: var(--white);
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-button:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

/* Стили для пустой корзины */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background-color: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin: 30px 0;
}

.empty-cart-icon {
  width: 80px;
  height: 80px;
  background-color: rgba(108, 92, 231, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-cart-icon svg {
  width: 40px;
  height: 40px;
  fill: var(--litegreen-color);
}

.empty-cart h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: var(--litegreen-color);
}

.empty-cart p {
  color: var(--light-text);
  margin-bottom: 20px;
  max-width: 400px;
}

.catalog-button {
  background-color: var(--litegreen-color);
  color: var(--white);
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.catalog-button:hover {
  background-color: var(--litegreen-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

/* Стили для списка товаров */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.cart-item {
  display: flex;
  background-color: var(--white);
  border:#83aa64;
  border: 2px;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  transition: var(--transition);
  position: relative;
  align-items: center;
}

.cart-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(108, 92, 231, 0.15);
}

.item-image {
  width: 100px;
  height: 100px;
  margin-right: 20px;
  flex-shrink: 0;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background-color: rgba(108, 92, 231, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder svg {
  width: 40px;
  height: 40px;
  fill: var(--litegreen-color);
  opacity: 0.5;
}

.item-details {
  flex-grow: 1;
}

.item-title {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: var(--litegreen-color);
}

.item-price, .item-quantity, .item-total {
  font-size: 0.95rem;
  margin-bottom: 5px;
  color: var(--light-text);
}

.item-total {
  font-weight: 600;
  color: var(--text-color);
}

/* Стили для управления количеством */
.quantity-controls {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 5px;
}

.quantity-btn {
  background: none;
  border: 1px solid var(--litegreen-color);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: var(--transition);
}

.quantity-btn svg {
  width: 16px;
  height: 16px;
  fill: var(--litegreen-color);
}

.quantity-btn:hover {
  background-color: rgba(62, 77, 49, 0.1);
}

.quantity-btn.minus:hover {
  background-color: rgba(214, 48, 49, 0.1);
}

.quantity-btn.minus:hover svg {
  fill: var(--error-color);
}

.quantity-value {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
}

/* Стили для итоговой суммы */
.cart-summary {
  background-color: var(--white);
  border-radius: 12px;
  padding: 25px;
  box-shadow: var(--shadow);
  margin-top: 20px;
}

.summary-details {
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1rem;
}

.total-amount {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--litegreen-color);
}

.checkout-btn {
  width: 100%;
  background-color: #2D3B22;
  color: #FFFFFF;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.checkout-btn svg {
  width: 20px;
  height: 20px;
  fill: #FFFFFF;
}

.checkout-btn:hover {
  background-color: #83aa64;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

/* Стили для модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(45, 52, 54, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  position: relative;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: var(--transition);
}

.modal-close svg {
  width: 20px;
  height: 20px;
  fill: var(--light-text);
}

.modal-close:hover {
  background-color: rgba(214, 48, 49, 0.1);
}

.modal-close:hover svg {
  fill: var(--error-color);
}

.modal-title {
  color: var(--litegreen-color);
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: var(--text-color);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--litegreen-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.cancel-btn {
  background-color: var(--white);
  color: var(--error-color);
  border: 1px solid var(--error-color);
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  flex: 1;
}

.cancel-btn:hover {
  background-color: rgba(214, 48, 49, 0.1);
}

.submit-btn {
  background-color: var(--success-color);
  color: var(--white);
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn svg {
  width: 18px;
  height: 18px;
  fill: var(--white);
}

.submit-btn:hover {
  background-color: #00a884;
  transform: translateY(-2px);
}

/* Адаптивные стили */
@media (max-width: 768px) {
  .cart-page {
    padding: 15px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .cart-item {
    flex-direction: column;
    padding: 15px;
    align-items: flex-start;
  }
  
  .item-image {
    width: 100%;
    height: auto;
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .quantity-controls {
    margin-left: 0;
    margin-top: 15px;
  }
  
  .modal-content {
    padding: 20px;
    margin: 15px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .empty-cart {
    padding: 30px 15px;
  }
  
  .empty-cart h3 {
    font-size: 1.3rem;
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
}
</style>