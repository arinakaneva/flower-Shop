<template>
  <div class="orders-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка заказов...</p>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="!loading && !error">
      <h1 class="page-title">Заказы</h1>

      <div v-if="Object.keys(orders).length === 0 || (orders.on_moderation.length === 0 && orders.completed.length === 0 && orders.cancelled.length === 0)" class="empty-orders">
        <p>У вас еще нет заказов</p>
        <router-link to="/product" class="catalog-button">
          Перейти в каталог
        </router-link>
      </div>

      <div v-else class="orders-container">
        <!-- Фильтр по статусам -->
        <div class="status-filter">
          <label for="status-select">Фильтр по статусу:</label>
          <select id="status-select" v-model="selectedStatus" @change="filterOrders">
            <option value="all">Все заказы</option>
            <option value="on_moderation">В работе</option>
            <option value="completed">Завершённые</option>
            <option value="cancelled">Отмененные</option>
          </select>
        </div>

        <!-- Заказы в работе -->
        <div v-if="showSection('on_moderation')" class="order-section">
          <h2>В работе</h2>
          <div v-for="(order, index) in sortedOrders('on_moderation')" :key="'on_moderation-'+index" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <h3>Заказ #{{ order.info.id_order }}</h3>
                <p>Дата: {{ formatDate(order.info.created) }}</p>
                <p>Адрес доставки: {{ order.info.address }}</p>
                <p>Способ оплаты: {{ order.info.pay }}</p>
                <p v-if="order.info.comment">Комментарий: {{ order.info.comment }}</p>
                <p><strong>Общая сумма: {{ calculateOrderTotalSimple(order.items) }} ₽</strong></p>
              </div>
              <div class="order-status">
                <span class="status-badge on-moderation">В работе</span>
              </div>
            </div>
            
            <button @click="toggleOrderDetails(order.info.id_order)" class="toggle-items-btn">
              {{ expandedOrders.includes(order.info.id_order) ? 'Скрыть товары' : 'Посмотреть товары' }}
            </button>
            
            <div v-if="expandedOrders.includes(order.info.id_order)" class="order-items-expanded">
              <h4>Товары в заказе:</h4>
              <div v-for="(item, itemIndex) in order.items" :key="'item-'+itemIndex" class="order-item-expanded">
                <div class="item-image-container">
                  <img :src="getImageUrl(item.image)" :alt="item.name || 'Товар ' + item.id_product" class="item-image">
                </div>
                <div class="item-details">
                  <p><strong>{{ item.name || 'Товар #' + item.id_product }}</strong></p>
                  <p>Цена: {{ item.price }} ₽</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Завершенные заказы -->
        <div v-if="showSection('completed')" class="order-section">
          <h2>Завершённые</h2>
          <div v-for="(order, index) in sortedOrders('completed')" :key="'completed-'+index" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <h3>Заказ #{{ order.info.id_order }}</h3>
                <p>Дата: {{ formatDate(order.info.created) }}</p>
                <p>Адрес доставки: {{ order.info.address }}</p>
                <p>Способ оплаты: {{ order.info.pay }}</p>
                <p v-if="order.info.comment">Комментарий: {{ order.info.comment }}</p>
                <p><strong>Общая сумма: {{ calculateOrderTotalSimple(order.items) }} ₽</strong></p>
              </div>
              <div class="order-status">
                <span class="status-badge completed">Завершён</span>
              </div>
            </div>
            
            <button @click="toggleOrderDetails(order.info.id_order)" class="toggle-items-btn">
              {{ expandedOrders.includes(order.info.id_order) ? 'Скрыть товары' : 'Посмотреть товары' }}
            </button>
            
            <div v-if="expandedOrders.includes(order.info.id_order)" class="order-items-expanded">
              <h4>Товары в заказе:</h4>
              <div v-for="(item, itemIndex) in order.items" :key="'item-'+itemIndex" class="order-item-expanded">
                <div class="item-image-container">
                  <img :src="getImageUrl(item.image)" :alt="item.name || 'Товар ' + item.id_product" class="item-image">
                </div>
                <div class="item-details">
                  <p><strong>{{ item.name || 'Товар #' + item.id_product }}</strong></p>
                  <p>Цена: {{ item.price }} ₽</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Отмененные заказы -->
        <div v-if="showSection('cancelled')" class="order-section">
          <h2>Отмененные</h2>
          <div v-for="(order, index) in sortedOrders('cancelled')" :key="'cancelled-'+index" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <h3>Заказ #{{ order.info.id_order }}</h3>
                <p>Дата: {{ formatDate(order.info.created) }}</p>
                <p>Адрес доставки: {{ order.info.address }}</p>
                <p>Способ оплаты: {{ order.info.pay }}</p>
                <p v-if="order.info.comment">Комментарий: {{ order.info.comment }}</p>
                <p><strong>Общая сумма: {{ calculateOrderTotalSimple(order.items) }} ₽</strong></p>
              </div>
              <div class="order-status">
                <span class="status-badge cancelled">Отменен</span>
              </div>
            </div>
            
            <button @click="toggleOrderDetails(order.info.id_order)" class="toggle-items-btn">
              {{ expandedOrders.includes(order.info.id_order) ? 'Скрыть товары' : 'Посмотреть товары' }}
            </button>
            
            <div v-if="expandedOrders.includes(order.info.id_order)" class="order-items-expanded">
              <h4>Товары в заказе:</h4>
              <div v-for="(item, itemIndex) in order.items" :key="'item-'+itemIndex" class="order-item-expanded">
                <div class="item-image-container">
                  <img :src="getImageUrl(item.image)" :alt="item.name || 'Товар ' + item.id_product" class="item-image">
                </div>
                <div class="item-details">
                  <p><strong>{{ item.name || 'Товар #' + item.id_product }}</strong></p>
                  <p>Цена: {{ item.price }} ₽</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrdersPage',
  data() {
    return {
      orders: {
        on_moderation: [],
        completed: [],
        cancelled: []
      },
      loading: true,
      error: null,
      expandedOrders: [], // Массив для хранения ID раскрытых заказов
      selectedStatus: 'all' // Выбранный статус для фильтрации
    }
  },
  mounted() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      try {
        this.loading = true
        this.error = null
        
        const token = localStorage.getItem('authToken')
        if (!token) {
          throw new Error('Вы не авторизованы')
        }
        
        const response = await fetch('https://k-kaneva.сделай.site/api/order', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.status === 204) {
          this.orders = { on_moderation: [], completed: [], cancelled: [] }
          return
        }
        
        if (!response.ok) {
          let errorText = 'Ошибка при загрузке заказов'
          try {
            const errorData = await response.text()
            errorText = errorData || errorText
          } catch (e) {
            console.error('Не удалось прочитать текст ошибки:', e)
          }
          throw new Error(errorText)
        }
        
        const data = await response.json()
        this.orders = data.data || { on_moderation: [], completed: [], cancelled: [] }
      } catch (err) {
        console.error('Ошибка при загрузке заказов:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    getImageUrl(dbPath) {
      if (!dbPath) return ''; // или путь к изображению-заглушке
      
      // Если это уже полный URL
      if (dbPath.startsWith('http')) {
        return dbPath;
      }
      
      // Если это полный путь на сервере
      if (dbPath.includes('/public_html/')) {
        // Извлекаем часть пути после public_html
        const parts = dbPath.split('/public_html/');
        return `https://k-kaneva.сделай.site/${parts[1]}`;
      }
      
      // Если путь начинается с assets (относительный путь)
      if (dbPath.startsWith('assets/')) {
        return `https://k-kaneva.сделай.site/${dbPath}`;
      }
      
      // Для всех остальных случаев добавляем базовый URL и путь к uploads
      return `https://k-kaneva.сделай.site/assets/upload/${dbPath}`;
    },
    calculateOrderTotalSimple(items) {
      // Просто суммируем цены товаров без учета количества
      return items.reduce((total, item) => total + parseFloat(item.price), 0)
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    toggleOrderDetails(orderId) {
      const index = this.expandedOrders.indexOf(orderId)
      if (index === -1) {
        // Добавляем ID заказа в массив раскрытых
        this.expandedOrders.push(orderId)
      } else {
        // Удаляем ID заказа из массива раскрытых
        this.expandedOrders.splice(index, 1)
      }
    },
    showSection(status) {
      // Показываем секцию, если она соответствует выбранному статусу или выбраны все
      return (this.selectedStatus === 'all' || this.selectedStatus === status) && 
             this.orders[status] && this.orders[status].length > 0
    },
    filterOrders() {
      // При изменении выбора в выпадающем списке просто обновляем отображение
      // Нет необходимости изменять данные, так как мы фильтруем через showSection
    },
    sortedOrders(status) {
      // Сортируем заказы по дате создания (от новых к старым)
      if (!this.orders[status]) return [];
      return [...this.orders[status]].sort((a, b) => {
        return new Date(b.info.created) - new Date(a.info.created);
      });
    }
  }
}
</script>

<style scoped>
.orders-page {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Montserrat', sans-serif;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 15px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(45, 59, 34, 0.2);
  border-top-color: #2D3B22;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: #2D3B22;
  font-size: 1.1rem;
}

.loading, .error-message, .empty-orders {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
}

.loading {
  color: #2D3B22;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.loading:after {
  content: "";
  width: 40px;
  height: 40px;
  border: 4px solid rgba(45, 59, 34, 0.2);
  border-top-color: #2D3B22;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.1);
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #d32f2f;
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

.empty-orders {
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  background: #f9f9f9;
  padding: 60px;
  border-radius: 12px;
  margin-top: 30px;
}

.empty-orders p {
  font-size: 1.2rem;
  margin: 0;
}

.catalog-button {
  display: inline-block;
  padding: 14px 28px;
  background-color: #2D3B22;
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(45, 59, 34, 0.1);
}

.catalog-button:hover {
  background-color: #3E4D31;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(45, 59, 34, 0.15);
}

.orders-container {
  margin-top: 40px;
}

.status-filter {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-filter label {
  font-weight: 600;
  color: #2D3B22;
}

.status-filter select {
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-filter select:hover {
  border-color: #a3cfbb;
}

.status-filter select:focus {
  outline: none;
  border-color: #2D3B22;
  box-shadow: 0 0 0 2px rgba(45, 59, 34, 0.2);
}

.order-section {
  margin-bottom: 50px;
}

.order-section h2 {
  font-size: 1.8rem;
  color: #2D3B22;
  padding-bottom: 12px;
  margin-bottom: 25px;
  position: relative;
}

.order-section h2:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: #a3cfbb;
}

.order-card {
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.03);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.order-info h3 {
  margin: 0 0 15px 0;
  font-size: 1.4rem;
  color: #2D3B22;
}

.order-info p {
  margin: 8px 0;
  color: #555;
  line-height: 1.5;
}

.order-info strong {
  color: #000;
  font-size: 1.1rem;
}

.order-status {
  display: flex;
  align-items: flex-start;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.status-badge.on-moderation {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ff9800;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-badge.completed {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-badge.cancelled {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.toggle-items-btn {
  display: inline-flex;
  align-items: center;
  margin: 10px 0;
  padding: 10px 20px;
  background-color: #2D3B22;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: white;
}

.toggle-items-btn:hover {
  background-color: #6a8354;
  color: white;
}

.order-items-expanded {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed rgba(0,0,0,0.1);
}

.order-item-expanded {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: transform 0.2s ease;
}

.order-item-expanded:hover {
  transform: translateX(5px);
}

.item-image-container {
  width: 80px;
  height: 80px;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #f0f0f0;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-details p {
  margin: 6px 0;
  color: #333;
}

.item-details p:first-child {
  font-weight: 600;
  color: #2D3B22;
  font-size: 1.05rem;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
  }
  .page-title {
    font-size: 1.8rem;
  }
  
  .order-status {
    margin-top: 15px;
    justify-content: flex-start;
  }
  
  .order-item-expanded {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-image-container {
    margin-right: 0;
    margin-bottom: 15px;
    width: 100%;
    height: 120px;
  }
  
  .empty-orders {
    padding: 40px 20px;
  }
  
  .status-filter {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .orders-page {
    padding: 0 15px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }

  .order-card {
    padding: 20px 15px;
  }
  
  .order-info h3 {
    font-size: 1.2rem;
  }
}
</style>