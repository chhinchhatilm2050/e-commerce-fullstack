import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import i18n from "./i18n/index.ts";
import "remixicon/fonts/remixicon.css";
import { createPinia } from "pinia";

const app = createApp(App);
app.use(i18n);
app.use(createPinia());
app.mount("#app");
