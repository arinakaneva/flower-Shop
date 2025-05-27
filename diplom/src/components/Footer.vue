<template>
  <footer class="flower-footer">
    <div class="footer-top">
      <div class="container">
        <div class="footer-grid">
          <!-- <div class="footer-col">
            <h3 class="footer-title">Магазин</h3>
            <ul class="footer-links">
              <li><router-link to="/product">Каталог</router-link></li>
            </ul>
          </div> -->


          <div class="footer-col">
            <h3 class="footer-title">Контакты</h3>
            <div class="footer-contacts">
              <div class="contact-item">
                <i>📱</i>
                <a href="tel:+79991234567">+7 (999) 123-45-67</a>
              </div>
              <div class="contact-item">
                <i>✉️</i>
                <a href="mailto:info@yesflowers.ru">info@yesflowers.ru</a>
              </div>
              <div class="contact-item">
                <i>📍</i>
                <span>г. Санкт-Петербург, ул. Цветочная, 7</span>
              </div>
            </div>

            <!-- <div class="footer-social">
              <a href="#" class="social-link">📱</a>
              <a href="#" class="social-link">💬</a>
              <a href="#" class="social-link">📸</a>
              <a href="#" class="social-link">🎥</a>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container">
        <div class="footer-bottom-content">
          <div class="copyright">
            © 2025 YES time for flowers - интернет-магазин цветов. Все права защищены.
          </div>
        
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FlowerFooter'
}
</script>

<style scoped>
.flower-footer {
  background: linear-gradient(135deg, #2D3B22 0%, #3E4D31 50%, #567041 100%);
  color: white;
  font-family: 'Montserrat', sans-serif;
}

.footer-top {
  padding: 30px 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.footer-col {
  margin-bottom: 20px;
}

.footer-title {
  font-size: 1.25rem;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.footer-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 2px;
  background: #a3cfbb;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
}

.footer-links a:hover {
  color: #a3cfbb;
  transform: translateX(5px);
}

.footer-contacts {
  margin-bottom: 25px;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.contact-item i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
  color: #a3cfbb;
}

.contact-item a, .contact-item span {
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.3s;
  text-decoration: none;
}

.contact-item a:hover {
  color: #a3cfbb;
}

.footer-social {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.social-link {
  color: white;
  font-size: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.social-link:hover {
  background: #a3cfbb;
  transform: translateY(-3px);
  color: #2D3B22;
}

.subscribe-form {
  display: flex;
  margin-top: 20px;
}

.subscribe-form input {
  flex: 1;
  padding: 12px 15px;
  border: none;
  border-radius: 4px 0 0 4px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.subscribe-form button {
  background: #a3cfbb;
  color: #2D3B22;
  border: none;
  padding: 0 20px;
  border-radius: 0 4px 4px 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.subscribe-form button:hover {
  background: #8bb9a4;
}

.footer-bottom {
  padding: 25px 0;
  background: rgba(0, 0, 0, 0.15);
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.footer-payments {
  display: flex;
  gap: 15px;
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .footer-top {
    padding: 40px 0 30px;
  }
  
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-title {
    font-size: 1.1rem;
  }
}
</style>