<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h1>Админ-панель</h1>
      <div class="admin-actions">
        <button @click="showAddProductModal" class="btn-add">
          <i class="fas fa-plus"></i> Добавить товар
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка товаров...</p>
    </div>

    <div v-else-if="products.length === 0" class="empty-catalog">
      <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No products" class="empty-icon">
      <h3>Товары не найдены</h3>
      <p>Начните с добавления нового товара</p>
    </div>

    <div v-else class="products-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Изображение</th>
            <th>Название</th>
            <th>Цена</th>
            <th>Категория</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id_product">
            <td>{{ product.id_product }}</td>
            <td>
              <img :src="getPhotoUrl(product.photo)" :alt="product.name" class="product-thumbnail">
            </td>
            <td>{{ product.name }}</td>
            <td>{{ formatPrice(product.price) }} ₽</td>
            <td>{{ product.category || '-' }}</td>
            <td class="actions">
              <button @click="viewProduct(product)" class="btn-view">
                <i class="fas fa-eye"></i> Просмотр
              </button>
              <button @click="editProduct(product)" class="btn-edit">
                <i class="fas fa-edit"></i> Редактировать
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно добавления товара -->
    <transition name="fade">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
          
          <h2 class="modal-title">{{ editingProduct ? 'Редактировать товар' : 'Добавить товар' }}</h2>
          
          <form @submit.prevent="submitProductForm" class="product-form">
            <div class="form-group">
              <label>Название товара</label>
              <input type="text" v-model="currentProduct.name" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Цена (₽)</label>
                <input type="number" v-model="currentProduct.price" min="0" step="0.01" required>
              </div>
            </div>
            
            <div class="form-group">
              <label>Категория</label>
              <input type="text" v-model="currentProduct.category">
            </div>
            
            <div class="form-group">
              <label>Описание</label>
              <textarea v-model="currentProduct.description" rows="4"></textarea>
            </div>
            
            <div class="form-group">
              <label>Изображение</label>
              <input type="file" @change="handleFileUpload" accept="image/*">
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Предпросмотр">
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-cancel">Отмена</button>
              <button type="submit" class="btn-submit" :disabled="submitting">
                {{ submitting ? 'Сохранение...' : (editingProduct ? 'Сохранить изменения' : 'Добавить товар') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Модальное окно просмотра товара -->
    <transition name="fade">
      <div v-if="showViewModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container view-modal">
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="modal-content">
            <div class="modal-gallery">
              <img :src="getPhotoUrl(currentProduct.photo)" :alt="currentProduct.name" class="modal-main-image">
            </div>
            
            <div class="modal-details">
              <h2 class="modal-title">{{ currentProduct.name }}</h2>
              
              <div class="price-section">
                <span class="current-price">{{ formatPrice(currentProduct.price) }} ₽</span>
              </div>
              
              <div class="product-meta">
                <div class="meta-item" v-if="currentProduct.category">
                  <i class="fas fa-tag"></i>
                  <span>Категория: {{ currentProduct.category }}</span>
                </div>
              </div>
              
              <div class="product-description" v-if="currentProduct.description">
                <h3><i class="fas fa-align-left"></i> Описание</h3>
                <p>{{ currentProduct.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Уведомление -->
    <transition name="slide-up">
      <div v-if="showNotification" class="notification" :class="notificationType">
        <div class="notification-icon">
          <i :class="notificationIcon"></i>
        </div>
        <div class="notification-content">
          <h4>{{ notificationTitle }}</h4>
          <p>{{ notificationMessage }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminPanel',
  data() {
    return {
      products: [],
      loading: true,
      showAddModal: false,
      showViewModal: false,
      currentProduct: {
        name: '',
        price: 0,
        category: '',
        description: '',
        photo: null
      },
      editingProduct: null,
      imagePreview: null,
      submitting: false,
      showNotification: false,
      notificationTitle: '',
      notificationMessage: '',
      notificationType: 'success',
      notificationIcon: 'fas fa-check-circle'
    };
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    getPhotoUrl(photoPath) {
      if (!photoPath) return 'https://via.placeholder.com/100';
      // Если это уже URL (превью), возвращаем как есть
      if (photoPath.startsWith('http') || photoPath.startsWith('data:')) return photoPath;
      // Иначе преобразуем путь с бэкенда в URL
      return `https://k-kaneva.сделай.site/assets/upload/${photoPath.split('/').pop()}`;
    },

    async fetchProducts() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('https://k-kaneva.сделай.site/api/product', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.data) {
          this.products = response.data.data;
        }
      } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        this.showAlert('Ошибка', 'Не удалось загрузить товары', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    formatPrice(price) {
      return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : '0';
    },
    
    showAddProductModal() {
      this.resetForm();
      this.showAddModal = true;
      this.editingProduct = null;
    },
    
    viewProduct(product) {
      this.currentProduct = { ...product };
      this.showViewModal = true;
    },
    
    editProduct(product) {
      this.currentProduct = { ...product };
      this.imagePreview = this.getPhotoUrl(product.photo);
      this.showAddModal = true;
      this.editingProduct = product;
    },
    
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.currentProduct.photo = file;
        
        // Создаем превью изображения
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    
    resetForm() {
      this.currentProduct = {
        name: '',
        price: 0,
        category: '',
        description: '',
        photo: null
      };
      this.imagePreview = null;
    },
    
    closeModal() {
      this.showAddModal = false;
      this.showViewModal = false;
      this.resetForm();
      this.editingProduct = null;
    },
    
    async submitProductForm() {
  this.submitting = true;
  const token = localStorage.getItem('authToken');
  
  try {
    const formData = new FormData();
    // Добавляем все обязательные поля
    formData.append('Product[name]', this.currentProduct.name || '');
    formData.append('Product[price]', this.currentProduct.price || 0);
    formData.append('Product[id_category]', this.currentProduct.category || ''); // Изменил на id_category
    formData.append('Product[description]', this.currentProduct.description || '');
    
    if (this.currentProduct.photo instanceof File) {
      formData.append('photo', this.currentProduct.photo);
    } else if (this.editingProduct?.photo) {
      // Если редактируем и фото не меняли, отправляем существующее фото
      formData.append('photo', this.editingProduct.photo);
    }

    // Для отладки - посмотрим что отправляем
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    const url = this.editingProduct 
      ? `https://k-kaneva.сделай.site/api/admin/product/${this.editingProduct.id_product}`
      : 'https://k-kaneva.сделай.site/api/admin/product';
    
    const response = await axios({
      method: 'post',
      url,
      data: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.status === 200 || response.status === 201) {
      this.showAlert('Успех', this.editingProduct ? 'Товар успешно обновлен' : 'Товар успешно добавлен', 'success');
      this.fetchProducts();
      this.closeModal();
    }
  } catch (error) {
    console.error('Полная ошибка:', error);
    console.error('Ответ сервера:', error.response?.data);
    
    let errorMessage = 'Не удалось сохранить товар';
    if (error.response?.data?.errors) {
      // Форматируем ошибки валидации в читаемый вид
      const errors = error.response.data.errors;
      errorMessage = Object.entries(errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
    }
    
    this.showAlert('Ошибка валидации', errorMessage, 'error');
  } finally {
    this.submitting = false;
  }
},
    
    showAlert(title, message, type = 'success') {
      this.notificationTitle = title;
      this.notificationMessage = message;
      this.notificationType = type;
      
      if (type === 'success') {
        this.notificationIcon = 'fas fa-check-circle';
      } else if (type === 'error') {
        this.notificationIcon = 'fas fa-exclamation-circle';
      }
      
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
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
  
  .admin-panel {
    font-family: 'Montserrat', sans-serif;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    color: #333;
  }
  
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .admin-header h1 {
    font-size: 2rem;
    color: #2D3B22;
  }
  
  .btn-add {
    background: #2D3B22;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-add:hover {
    background: #567041;
    transform: translateY(-2px);
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
  
  .products-table {
    margin-top: 2rem;
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    border-radius: 10px;
    overflow: hidden;
  }
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background: #2D3B22;
    color: white;
    font-weight: 600;
  }
  
  tr:hover {
    background-color: #f8f9fa;
  }
  
  .product-thumbnail {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 5px;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-view, .btn-edit {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  
  .btn-view {
    background: #3498db;
    color: white;
  }
  
  .btn-view:hover {
    background: #2980b9;
  }
  
  .btn-edit {
    background: #f39c12;
    color: white;
  }
  
  .btn-edit:hover {
    background: #e67e22;
  }
  
  /* Модальные окна */
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
  }
  
  .modal-container {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    animation: modalFadeIn 0.3s ease-out;
    padding: 2rem;
  }
  
  .view-modal {
    max-width: 900px;
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
  
  .modal-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #2D3B22;
    text-align: center;
  }
  
  .product-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-row {
    display: flex;
    gap: 1.5rem;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  label {
    font-weight: 600;
    color: #555;
  }
  
  input, textarea {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: inherit;
    font-size: 1rem;
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  input[type="file"] {
    padding: 0.5rem;
  }
  
  .image-preview {
    margin-top: 1rem;
  }
  
  .image-preview img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 6px;
    border: 1px solid #eee;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .btn-cancel, .btn-submit {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn-cancel {
    background: #eee;
    color: #555;
  }
  
  .btn-cancel:hover {
    background: #ddd;
  }
  
  .btn-submit {
    background: #2D3B22;
    color: white;
  }
  
  .btn-submit:hover {
    background: #567041;
  }
  
  .btn-submit:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
  
  /* Модальное окно просмотра */
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
    border-radius: 8px;
  }
  
  .modal-main-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .modal-details {
    flex: 1;
    padding: 0 2rem;
  }
  
  .price-section {
    margin: 1.5rem 0;
  }
  
  .current-price {
    font-size: 2rem;
    font-weight: 700;
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
  }
  
  .notification.success {
    border-left: 5px solid #2ecc71;
  }
  
  .notification.error {
    border-left: 5px solid #e74c3c;
  }
  
  .notification-icon {
    font-size: 2rem;
  }
  
  .notification.success .notification-icon {
    color: #2ecc71;
  }
  
  .notification.error .notification-icon {
    color: #e74c3c;
  }
  
  .notification-content h4 {
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
    .modal-content {
      flex-direction: column;
    }
    
    .modal-gallery {
      flex: 0 0 auto;
      max-width: 100%;
      height: 250px;
      margin-bottom: 1.5rem;
    }
  }
  
  @media (max-width: 768px) {
    .admin-panel {
      padding: 1rem;
    }
    
    .admin-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .form-row {
      flex-direction: column;
      gap: 1rem;
    }
    
    .modal-container {
      width: 95%;
      padding: 1.5rem;
    }
    
    .actions {
      flex-direction: column;
    }
    
    .btn-view, .btn-edit {
      width: 100%;
      justify-content: center;
    }
  }
  
  @media (max-width: 480px) {
    .notification {
      width: calc(100% - 40px);
      right: 20px;
      bottom: 20px;
    }
  }
  </style>