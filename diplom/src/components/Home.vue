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

    <!-- Секция "Почему выбирают нас" -->
    <section class="advantages-section">
      <h2 class="about-title">Почему выбирают нас</h2>
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
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {};
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

/* Секция преимуществ */
.advantages-section {
  padding: 80px 20px;
  text-align: center;
  background-color: #f9f9f9;
}

.about-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2D3B22;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
}

.about-title::after {
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
  
  .advantages-section {
    padding: 60px 20px;
  }
  
  .about-title {
    font-size: 2rem;
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
}
</style>