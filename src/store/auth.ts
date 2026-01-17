import { reactive, watch } from 'vue';

const STATE_KEY = 'enthub_user_id';

export const authStore = reactive({
  userId: localStorage.getItem(STATE_KEY) || null,
  
  login(id: string) {
    this.userId = id;
    localStorage.setItem(STATE_KEY, id);
  },
  
  logout() {
    this.userId = null;
    localStorage.removeItem(STATE_KEY);
  },
  
  isAuthenticated() {
    return !!this.userId;
  }
});
