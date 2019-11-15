//var Vue =require('vue');
console.log('Starting Vue Application');

// import  moment from 'moment';
// //Object.defineProperty(Vue.prototype, '$moment', { value: moment });
//
// var vm  = new Vue({
//   el: '#app',
//   data:{
//     message: 'Hello Vue'
//   }
//
// })


import Vue from 'vue'
import App from './App.vue'
new Vue({
  el: '#app',
  render: h => h(App)
})
