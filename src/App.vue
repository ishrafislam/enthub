<script setup lang="ts">
import Navbar from "./components/Navbar.vue";
import { useTheme } from "./composables/useTheme";
import { version } from "../package.json";

const { isCyberpunk } = useTheme();
</script>

<template>
  <div
    :class="[
      'min-h-screen flex flex-col font-sans transition-colors duration-300',
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
    <main :class="['flex-1', isCyberpunk ? 'relative' : '']">
      <router-view></router-view>
    </main>

    <!-- Footer -->
    <footer
      :class="[
        'border-t py-6 mt-auto',
        isCyberpunk
          ? 'bg-cyber-night border-cyber-chrome'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
      ]"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2"
      >
        <p
          :class="[
            'text-sm',
            isCyberpunk
              ? 'text-cyber-muted font-cyber-mono'
              : 'text-gray-500 dark:text-gray-400',
          ]"
        >
          <span :class="isCyberpunk ? 'text-cyber-cyan' : 'text-teal-500'"
            >EntHub</span
          >
          &mdash; Powered by
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            :class="[
              'font-medium',
              isCyberpunk
                ? 'cyber-footer-link text-cyber-gray'
                : 'transition-colors text-gray-600 dark:text-gray-300 hover:text-teal-500',
            ]"
            >TMDB</a
          >
        </p>
        <p
          :class="[
            'text-xs',
            isCyberpunk
              ? 'text-cyber-muted font-cyber-mono'
              : 'text-gray-400 dark:text-gray-500',
          ]"
        >
          v{{ version }}
        </p>
      </div>
    </footer>
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

/* Cyberpunk footer link hover effect */
.cyber-footer-link {
  position: relative;
  transition: color 0.2s ease;
}

.cyber-footer-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, #55ead4, #ff2a6d);
  transition: width 0.3s ease;
  box-shadow: 0 0 6px #55ead4;
}

.cyber-footer-link:hover {
  color: #55ead4;
  text-shadow: 0 0 8px rgba(85, 234, 212, 0.5);
}

.cyber-footer-link:hover::after {
  width: 100%;
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
