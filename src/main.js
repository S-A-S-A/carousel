import Vue from 'vue'
import App from './App.vue'
import carousel from '@/components/carousel/carousel.js'
Vue.config.productionTip = false

// 全局轮播组件
Vue.use(carousel);

new Vue({
  render: h => h(App),
}).$mount('#app')
