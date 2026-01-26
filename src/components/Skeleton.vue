<script setup lang="ts">
import { useTheme } from "../composables/useTheme";

defineProps<{
  className?: string;
}>();

const { isCyberpunk } = useTheme();
</script>

<template>
  <!-- Cyberpunk Skeleton -->
  <div
    v-if="isCyberpunk"
    :class="[
      'relative overflow-hidden bg-cyber-night border border-cyber-chrome rounded-none',
      className,
    ]"
  >
    <!-- Scan lines overlay -->
    <div class="absolute inset-0 cyber-scanlines pointer-events-none"></div>
    <!-- Moving scan line -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="cyber-scan-beam"></div>
    </div>
    <!-- Corner accents -->
    <div
      class="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-cyan/50"
    ></div>
    <div
      class="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-cyan/50"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyber-cyan/50"
    ></div>
    <div
      class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-cyan/50"
    ></div>
  </div>

  <!-- Default Skeleton (Light/Dark) -->
  <div
    v-else
    :class="[
      'relative overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-lg',
      className,
    ]"
  >
    <div
      class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"
    ></div>
  </div>
</template>

<style scoped>
/* Default shimmer animation */
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}

/* Cyberpunk scan lines */
.cyber-scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(85, 234, 212, 0.03) 2px,
    rgba(85, 234, 212, 0.03) 4px
  );
}

/* Cyberpunk moving scan beam */
@keyframes scan-beam {
  0% {
    top: -20%;
  }
  100% {
    top: 120%;
  }
}

.cyber-scan-beam {
  position: absolute;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(85, 234, 212, 0.08) 50%,
    transparent
  );
  animation: scan-beam 2.5s linear infinite;
}
</style>
