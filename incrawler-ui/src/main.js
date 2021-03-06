import Vue from 'vue';
import App from './App.vue';
import { router } from "./router";
import VueLogger from 'vuejs-logger';
import vuetify from './vuetify'

console.log("main js")
Vue.config.productionTip = false

const options = {
  isEnabled: true,
  logLevel: Vue.config.productionTip ? 'error' : 'info',
  stringifyArguments: false,
  showLogLevel: true,
  showMethodName: true,
  separator: '|',
  showConsoleColors: true
};
Vue.use(VueLogger, options);

window.Vue = Vue;

new Vue({
  render: h => h(App),
  router,
  vuetify
}).$mount('#app')



