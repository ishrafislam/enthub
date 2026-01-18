import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
app.use(router);

const root = document.getElementById("app");
if (root) {
  app.mount(root);
} else {
  console.error("Critical Error: #app container not found in DOM.");
}