<template>
  <div class="home-page">
    <!-- Герой-секция с прямоугольником и изображением -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1>“YES time for flowers” представляет собой не просто цветочный магазин, 
            а целый цветочный клуб.</h1>
          <router-link to="/product" class="catalog-btn">В каталог</router-link>
        </div>
        <div class="hero-image">
          <img src="https://k-kaneva.xn--80ahdri7a.site/assets/upload/pionMain.png" alt="Цветочная композиция">
        </div>
      </div>
    </section>

    <!-- Секция "Наши новинки" -->
    <section class="new-products-section">
      <h2 class="section-title">Наши новинки</h2>
      <div v-if="loadingNewProducts" class="loading-container">
        <div class="spinner"></div>
        <p>Загрузка товаров...</p>
      </div>
      <div v-else-if="newProducts.length === 0" class="empty-catalog">
        <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No products" class="empty-icon">
        <h3>Товары не найдены</h3>
      </div>
      <div v-else class="products-grid">
        <div v-for="product in newProducts" :key="product.id_product" class="product-card">
          <div class="product-badge">В наличии</div>
          
          <div class="product-image-container">
            <img 
              :src="product.photo || 'https://via.placeholder.com/300'" 
              :alt="product.name" 
              class="product-image" 
              @error="setDefaultImage"
            >
          </div>
          
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-category">Категория: {{ product.category_name }}</p>
            <p class="product-price">{{ formatPrice(product.price) }} ₽</p>
            
            <div class="product-actions">
              <button @click="showProductDetails(product.id_product)" class="btn-details">
                <i class="fas fa-info-circle"></i> Подробнее
              </button>
              
              <button 
                v-if="isAuthenticated" 
                @click="addToCart(product.id_product)" 
                class="btn-cart"
                :disabled="addingToCart"
              >
                <i :class="addingToCart ? 'fas fa-spinner fa-spin' : 'fas fa-shopping-cart'"></i>
                {{ addingToCart ? 'Добавление...' : 'В корзину' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Секция "Почему выбирают нас" -->
    <section class="advantages-section">
      <h2 class="section-title">Почему выбирают нас</h2>
      <div class="advantages-grid">
        <div class="advantage-card">
          <div class="advantage-icon">🌿</div>
          <h3>Свежие цветы</h3>
          <p>Только свежесрезанные цветы от проверенных поставщиков</p>
        </div>
        <div class="advantage-card">
          <div class="advantage-icon">🚚</div>
          <h3>Быстрая доставка</h3>
          <p>Доставим ваш букет в течение 2 часов по городу</p>
        </div>
        <div class="advantage-card">
          <div class="advantage-icon">💰</div>
          <h3>Доступные цены</h3>
          <p>Широкий выбор букетов для любого бюджета</p>
        </div>
      </div>
    </section>

    <!-- Модальное окно с деталями товара -->
    <transition name="fade">
      <div v-if="selectedProduct" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="modal-content">
            <div class="modal-gallery">
              <img 
                :src="selectedProduct.photo || 'https://via.placeholder.com/500'" 
                :alt="selectedProduct.name" 
                class="modal-main-image"
              >
            </div>
            
            <div class="modal-details">
              <h2 class="modal-title">{{ selectedProduct.name }}</h2>
              
              <div class="price-section">
                <span class="current-price">{{ formatPrice(selectedProduct.price) }} ₽</span>
              </div>
              
              <div class="availability in-stock">
                Есть в наличии
              </div>
              
              <div class="product-meta">
                <div class="meta-item">
                  <i class="fas fa-tag"></i>
                  <span>Категория: {{ selectedProduct.category_name }}</span>
                </div>
              </div>
              
              <div class="product-description" v-if="selectedProduct.description">
                <h3><i class="fas fa-align-left"></i> Описание</h3>
                <p>{{ selectedProduct.description }}</p>
              </div>
              
              <button 
                v-if="isAuthenticated" 
                @click="addToCart(selectedProduct.id_product)" 
                class="btn-add-to-cart"
                :disabled="addingToCart"
              >
                <i :class="addingToCart ? 'fas fa-spinner fa-spin' : 'fas fa-cart-plus'"></i>
                {{ addingToCart ? 'Добавляем...' : 'Добавить в корзину' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Уведомление о добавлении в корзину -->
    <transition name="slide-up">
      <div v-if="showSuccessMessage" class="notification">
        <div class="notification-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="notification-content">
          <h4>Товар добавлен в корзину!</h4>
          <p>Вы можете продолжить покупки или перейти к оформлению заказа</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data() {
    return {
      newProducts: [],
      categories: [], // Добавляем массив для категорий
      loadingNewProducts: true,
      selectedProduct: null,
      isAuthenticated: false,
      addingToCart: false,
      showSuccessMessage: false
    };
  },
  mounted() {
    this.checkAuth();
    this.fetchNewProducts();
  },
  methods: {
    async checkAuth() {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          this.isAuthenticated = true;
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      }
    },
    
    async fetchCategories() {
      try {
        const response = await axios.get('https://k-kaneva.сделай.site/api/categories');
        if (response.data && response.data.data) {
          this.categories = response.data.data;
        }
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    },
    
    async fetchNewProducts() {
      try {
        // Сначала загружаем категории
        await this.fetchCategories();
        
        const response = await axios.get('https://k-kaneva.сделай.site/api/product');
        if (response.data && response.data.data) {
          const allProducts = response.data.data.map(product => {
            const photo = product.photo 
              ? product.photo.replace(
                  '/home/kaneva/web/k-kaneva.xn--80ahdri7a.site/public_html',
                  'https://k-kaneva.сделай.site'
                )
              : '';
            
            // Находим название категории по id_category
            const category = this.categories.find(c => c.id === product.id_category);
            const category_name = category ? category.name : 'Неизвестная категория';
            
            return {
              ...product,
              photo,
              category_name // Добавляем название категории к продукту
            };
          });
          
          // Сортируем по id (предполагая, что больший id = новее товар)
          const sortedProducts = allProducts.sort((a, b) => b.id_product - a.id_product);
          this.newProducts = sortedProducts.slice(0, 3);
        }
      } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
      } finally {
        this.loadingNewProducts = false;
      }
    },
    
    setDefaultImage(event) {
      event.target.src = 'https://via.placeholder.com/300';
    },
    
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },
    
    async showProductDetails(id_product) {
      try {
        const response = await axios.get(`https://k-kaneva.сделай.site/api/product/${id_product}`);
        if (response.data && response.data.data) {
          const photo = response.data.data.photo 
            ? response.data.data.photo.replace(
                '/home/kaneva/web/k-kaneva.xn--80ahdri7a.site/public_html',
                'https://k-kaneva.сделай.site'
              )
            : '';
          
          // Находим полную информацию о товаре из списка newProducts, чтобы получить category_name
          const fullProductInfo = this.newProducts.find(p => p.id_product === id_product);
          
          this.selectedProduct = {
            ...response.data.data,
            photo,
            category_name: fullProductInfo?.category_name || 'Неизвестная категория'
          };
          // Блокируем прокрутку страницы
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
        }
      } catch (error) {
        console.error('Ошибка при загрузке деталей товара:', error);
      }
    },
    
    // Остальные методы без изменений
    closeModal() {
      this.selectedProduct = null;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    },
    
    async addToCart(id_product) {
      if (!this.isAuthenticated) return;
      
      this.addingToCart = true;
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
          'https://k-kaneva.сделай.site/api/cart',
          { id_product },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.status === 201) {
          this.showSuccessNotification();
        }
      } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
      } finally {
        this.addingToCart = false;
      }
    },
    
    showSuccessNotification() {
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
  }
};
</script>

<style scoped>
.home-page {
  font-family: 'Montserrat', sans-serif;
  color: #333;
}

/* Герой-секция */
.hero-section {
  position: relative;
  min-height: 70vh;
  background-color: #2D3B22;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  overflow: hidden;
}

.hero-container {
  display: flex;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  align-items: center;
}

.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 40px;
  color: white;
  z-index: 1;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.3;
}

.catalog-btn {
  display: inline-block;
  padding: 15px 30px;
  background-color: white;
  color: #2D3B22;
  text-decoration: none;
  font-size: 1.2rem;
  border-radius: 30px;
  transition: all 0.3s ease;
  border: 2px solid white;
  font-weight: bold;
  align-self: flex-start;
}

.catalog-btn:hover {
  background-color: transparent;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.hero-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.hero-image img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 10px;
}

/* Секция "Наши новинки" */
.new-products-section {
  padding: 80px 20px;
  background-color: white;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2D3B22;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
}

.section-title::after {
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

/* Стили для товаров (взяты из каталога) */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #2D3B22;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-catalog {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.05);
}

.empty-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
}

.product-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #2D3B22;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
}

.product-image-container {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 1rem;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-info {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #2D3B22;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-category {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.product-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #567041;
  margin-bottom: 1.2rem;
}

.product-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.btn-details, .btn-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-details {
  background: #567041;
  color: white;
}

.btn-details:hover {
  background: #83aa64;
}

.btn-cart {
  background: #2D3B22;
  color: white;
}

.btn-cart:hover {
  background: #567041;
}

.btn-cart:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

/* Секция преимуществ */
.advantages-section {
  padding: 80px 20px;
  text-align: center;
  background-color: #f9f9f9;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.advantage-card {
  background: white;
  padding: 30px 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.advantage-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.advantage-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #2D3B22;
}

.advantage-card h3 {
  color: #2D3B22;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.advantage-card p {
  color: #666;
  line-height: 1.6;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0,0,0,0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
  font-size: 1.2rem;
  z-index: 10;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(0,0,0,0.2);
  color: #e74c3c;
}

.modal-content {
  display: flex;
  flex-direction: row;
}

.modal-gallery {
  flex: 0 0 40%;
  max-width: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 2rem;
}

.modal-main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.modal-details {
  flex: 1;
  padding: 2rem;
}

.modal-title {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #2D3B22;
}

.price-section {
  margin: 1.5rem 0;
}

.current-price {
  font-size: 2rem;
  font-weight: 700;
  color: #567041;
}

.availability {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.availability.in-stock {
  background: #e8f8f0;
  color: #567041;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.meta-item i {
  color: #7f8c8d;
}

.product-description {
  margin: 1.5rem 0;
}

.product-description h3 {
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #567041;
}

.product-description h3 i {
  color: #2D3B22;
}

.product-description p {
  line-height: 1.6;
  color: #555;
}

.btn-add-to-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #2D3B22, #83aa64);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
}

.btn-add-to-cart:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
}

.btn-add-to-cart:disabled {
  background: #95a5a6;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

/* Уведомление */
.notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  z-index: 1100;
  max-width: 400px;
  border-left: 5px solid #567041;
}

.notification-icon {
  font-size: 2rem;
  color: #567041;
}

.notification-content h4 {
  color: #567041;
  margin-bottom: 0.3rem;
}

.notification-content p {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Анимации */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Адаптивность */
@media (max-width: 992px) {
  .hero-content h1 {
    font-size: 2.2rem;
  }
  
  .hero-image img {
    max-height: 60vh;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: auto;
    padding: 60px 0;
  }
  
  .hero-container {
    flex-direction: column;
  }
  
  .hero-content {
    padding: 0 20px 30px;
    text-align: center;
    order: 1;
  }
  
  .hero-content h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  
  .catalog-btn {
    align-self: center;
    padding: 12px 25px;
    font-size: 1rem;
    margin-bottom: 20px;
  }
  
  .hero-image {
    padding: 20px;
    order: 2;
  }
  
  .hero-image img {
    max-height: 50vh;
  }
  
  .new-products-section, .advantages-section {
    padding: 60px 20px;
  }
  
  .section-title {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  
  .modal-container {
    width: 95%;
  }
  
  .modal-content {
    flex-direction: column;
  }
  
  .modal-gallery {
    flex: 0 0 auto;
    max-width: 100%;
    height: 250px;
  }
}

@media (max-width: 576px) {
  .hero-content h1 {
    font-size: 1.5rem;
  }
  
  .hero-image img {
    max-height: 40vh;
    max-width: 90%;
    margin: 0 auto;
    display: block;
    padding-bottom: 20px;
  }
  
  .advantage-card {
    padding: 20px 15px;
  }
  
  .advantage-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  .advantage-card h3 {
    font-size: 1.3rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .notification {
    width: calc(100% - 40px);
    right: 20px;
    bottom: 20px;
  }
}
</style>