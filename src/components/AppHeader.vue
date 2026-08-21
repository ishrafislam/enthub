<script setup lang="ts">
const upcomingSections = ['Movies & TV', 'Games']
</script>

<template>
  <header class="border-b border-border-subtle bg-surface-raised/80 backdrop-blur">
    <div class="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-4 sm:px-6">
      <RouterLink to="/" class="text-lg font-bold tracking-tight">
        Ent<span class="text-brand">Hub</span>
      </RouterLink>

      <nav class="flex items-center gap-1 text-sm">
        <RouterLink
          to="/sports"
          class="rounded-md px-3 py-1.5 font-medium text-content-muted transition hover:bg-surface-hover hover:text-content"
          active-class="bg-surface-hover !text-content"
        >
          Sports
        </RouterLink>
        <span
          v-for="section in upcomingSections"
          :key="section"
          class="hidden cursor-not-allowed rounded-md px-3 py-1.5 text-content-muted/50 sm:inline"
          title="Coming soon"
        >
          {{ section }}
        </span>
      </nav>
    </div>
  </header>
</template>
