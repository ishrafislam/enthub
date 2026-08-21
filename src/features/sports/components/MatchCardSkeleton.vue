<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="n in 6"
      :key="n"
      class="h-[120px] animate-pulse rounded-xl border border-border-subtle bg-surface-raised"
    />
  </div>
</template>
