import { reactive } from "vue";

const STATE_KEY = "enthub_user_id";

const getInitialUserId = () => {
  const stored = localStorage.getItem(STATE_KEY);
  // Basic validation: ensure it's a string and looks like a Convex ID (optional but safer)
  return typeof stored === "string" && stored.length > 0 ? stored : null;
};

export const authStore = reactive({
  userId: getInitialUserId(),

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
  },
});

// Sync across tabs
window.addEventListener("storage", (event) => {
  if (event.key === STATE_KEY) {
    authStore.userId = event.newValue;
  }
});
