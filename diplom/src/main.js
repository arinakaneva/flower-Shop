
import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import Home from './components/Home.vue';
import Registr from './components/Registr.vue';
import Login from './components/Login.vue';
import Product from './components/Product.vue';
import User from './components/User.vue';
import Cart from './components/Cart.vue';
import Order from './components/Order.vue';
import Admin from './components/Admin.vue';


const routes = [
  { path: '/', component: Home },
  { path: '/registr', component: Registr },
  { path: '/login', component: Login },
  { path: '/product', component: Product },
  { path: '/user', component: User },
  { path: '/cart', component: Cart },
  { path: '/order', component: Order },
  { path: '/admin', component: Admin },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
createApp(App)
  .use(router)
  .use(createPinia())
  .mount('#app');