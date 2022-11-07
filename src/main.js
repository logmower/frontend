import { createApp } from 'vue'
import store from "./stores";
import App from './App.vue'
import vuetify from './plugins/vuetify'
import Toaster from "@meforma/vue-toaster";
import { loadFonts } from './plugins/webfontloader'
import './assets/main.css'
import 'vue-select/dist/vue-select.css';
loadFonts()

const app = createApp(App);
app.use(store);
app.use(vuetify);
app.use(Toaster);
app.mount("#app");

