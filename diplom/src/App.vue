<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
  },
};
</script>

<style>
/* Базовые стили */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Стили для хедера */
.header {
  background-color: #2D3B22;
  color: white;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Основной контент с отступом */
.main-content {
  flex: 1;
  padding-top: 30px; /* Небольшой отступ после хедера */
  padding-bottom: 30px; /* Отступ перед футером */
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 70px; /* Компенсация для фиксированного хедера */
}

/* Адаптивность */
@media (max-width: 768px) {
  .main-content {
    margin-top: 60px;
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 15px;
    padding-right: 15px;
  }
}
</style>