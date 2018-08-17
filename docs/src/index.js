import Vue from 'vue';
import Console from './Console.vue';
import monaco from './monaco';

Vue.use(monaco);

new Vue({
  render: h => h(Console),
}).$mount('#root');