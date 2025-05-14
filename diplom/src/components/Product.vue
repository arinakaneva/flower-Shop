<template>
  <div class="catalog-page">
    <h1 class="catalog-title">Каталог товаров</h1>
    
    <!-- Фильтры и сортировка -->
    <div class="filters-container">
      <div class="sort-options">
        <label for="sort">Сортировать по:</label>
        <select id="sort" v-model="sortOption" @change="applySorting">
          <option value="price-asc">Цена (по возрастанию)</option>
          <option value="price-desc">Цена (по убыванию)</option>
          <option value="name-asc">Название (А-Я)</option>
          <option value="name-desc">Название (Я-А)</option>
        </select>
      </div>
      
      <div class="filter-options">
        <label for="category">Фильтр по категории:</label>
        <select id="category" v-model="selectedCategory" @change="applyFilters">
          <option value="">Все категории</option>
          <option v-for="category_name in uniqueCategories" :key="category_name" :value="category_name">
            {{ category_name }}
          </option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка товаров...</p>
    </div>
    
    <div v-else-if="filteredProducts.length === 0" class="empty-catalog">
      <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No products" class="empty-icon">
      <h3>Товары не найдены</h3>
      <p>Попробуйте изменить параметры поиска</p>
    </div>
    
    <div v-else class="products-grid">
      <div v-for="product in filteredProducts" :key="product.id_product" class="product-card">
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
  name: 'Catalog',
  data() {
    return {
      products: [],
      filteredProducts: [],
      loading: true,
      selectedProduct: null,
      isAuthenticated: false,
      addingToCart: false,
      showSuccessMessage: false,
      sortOption: 'price-asc',
      selectedCategory: '',
      uniqueCategories: []
    };
  },
  mounted() {
    this.checkAuth();
    this.fetchProducts();
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
    
    async fetchProducts() {
      try {
        const response = await axios.get('https://k-kaneva.сделай.site/api/product');
        if (response.data && response.data.data) {
          this.products = response.data.data.map(product => {
            const photo = product.photo 
              ? product.photo.replace(
                  '/home/kaneva/web/k-kaneva.xn--80ahdri7a.site/public_html',
                  'https://k-kaneva.сделай.site'
                )
              : '';
            return {
              ...product,
              photo
            };
          });
          
          // Получаем уникальные категории из category_name
          this.uniqueCategories = [...new Set(this.products.map(p => p.category_name))];
          this.applyFilters();
        }
      } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
      } finally {
        this.loading = false;
      }
    },
    
    applyFilters() {
      // Применяем фильтр по категории (теперь сравниваем category_name)
      if (this.selectedCategory) {
        this.filteredProducts = this.products.filter(
          product => product.category_name === this.selectedCategory
        );
      } else {
        this.filteredProducts = [...this.products];
      }
      
      // Применяем сортировку
      this.applySorting();
    },
    
    // Остальные методы остаются без изменений
    applySorting() {
      if (!this.filteredProducts.length) return;
      
      switch (this.sortOption) {
        case 'price-asc':
          this.filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          this.filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'name-asc':
          this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          break;
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
      
      // Находим полную информацию о товаре из списка products, чтобы получить category_name
      const fullProductInfo = this.products.find(p => p.id_product === id_product);
      
      this.selectedProduct = {
        ...response.data.data,
        photo,
        category_name: fullProductInfo?.category_name || '' // Добавляем category_name
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
    
    closeModal() {
      this.selectedProduct = null;
      // Восстанавливаем прокрутку страницы
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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  overflow-x: hidden;
}

.catalog-page {
  font-family: 'Montserrat', sans-serif;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  color: #333;
}

.catalog-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2D3B22;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
}

.catalog-title::after {
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

.filters-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.sort-options, .filter-options {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.sort-options label, .filter-options label {
  font-weight: 600;
  color: #2D3B22;
}

.sort-options select, .filter-options select {
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  font-family: 'Montserrat', sans-serif;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-options select:hover, .filter-options select:hover {
  border-color: #83aa64;
}

.sort-options select:focus, .filter-options select:focus {
  outline: none;
  border-color: #2D3B22;
  box-shadow: 0 0 0 2px rgba(131, 170, 100, 0.2);
}

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
@media (max-width: 768px) {
  .catalog-page {
    padding: 1rem;
  }
  
  .catalog-title {
    font-size: 2rem;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .sort-options, .filter-options {
    width: 100%;
  }
  
  .sort-options select, .filter-options select {
    width: 100%;
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

@media (max-width: 480px) {
  .product-card {
    max-width: 100%;
  }
  
  .notification {
    width: calc(100% - 40px);
    right: 20px;
    bottom: 20px;
  }
}
</style>