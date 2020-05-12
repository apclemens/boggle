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
    { path: '/boggle/', component: HomePage, name: 'home', title: 'home' },
    { path: '/boggle/game/:gameId', component: Game, name: 'game' },
]

const router = new VueRouter({
    routes,
    mode: 'history',
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
