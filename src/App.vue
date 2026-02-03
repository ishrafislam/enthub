<script setup lang="ts">
import { computed } from "vue";
import Navbar from "./components/Navbar.vue";
import { useTheme } from "./composables/useTheme";

const { isCyberpunk } = useTheme();

const transitionName = computed(() => (isCyberpunk.value ? "cyber" : "fade"));
</script>

<template>
  <div
    :class="[
      'min-h-screen font-sans transition-colors duration-300',
      isCyberpunk
        ? 'bg-cyber-black text-white'
        : 'bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100',
    ]"
  >
    <!-- Global scan lines overlay for cyberpunk theme -->
    <div
      v-if="isCyberpunk"
      class="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
      style="
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(85, 234, 212, 1) 2px,
          rgba(85, 234, 212, 1) 4px
        );
      "
    ></div>

    <Navbar />
    <main :class="isCyberpunk ? 'relative' : ''">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
/* Default fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Cyberpunk page transition */
.cyber-enter-active {
  animation: cyber-page-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.cyber-leave-active {
  animation: cyber-page-out 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes cyber-page-in {
  0% {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(2px) brightness(1.5);
  }
  50% {
    filter: blur(0) brightness(1.2);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0) brightness(1);
  }
}

@keyframes cyber-page-out {
  0% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0) brightness(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-8px);
    filter: blur(2px) brightness(0.8);
  }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .cyber-enter-active,
  .cyber-leave-active {
    animation: none;
    transition: opacity 0.1s ease;
  }

  .cyber-enter-from,
  .cyber-leave-to {
    opacity: 0;
  }
}
</style>
