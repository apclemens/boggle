import Vue from 'vue'
import App from './App.vue'
import Game from './Game.vue'
import HomePage from './HomePage.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueRouter from 'vue-router'

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(VueRouter);

const routes = [
    { path: '/', component: HomePage, name: 'home', title: 'home' },
    { path: '/game/:gameId', component: Game, name: 'game' },
]

const router = new VueRouter({
    routes,
    base: process.env.BASE_URL,
    mode: 'history',
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
