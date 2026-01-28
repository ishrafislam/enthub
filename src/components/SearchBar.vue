<script setup lang="ts">
import { ref, computed, onBeforeUnmount, nextTick } from "vue";
import type { SearchType } from "../types/tmdb";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    searchType: SearchType;
    variant?: "hero" | "page";
    placeholder?: string;
  }>(),
  {
    variant: "page",
    placeholder: "Search for movies, TV shows, people...",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:searchType": [value: SearchType];
  submit: [];
}>();

const dropdownOpen = ref(false);
const dropdownButtonRef = ref<HTMLButtonElement | null>(null);
const dropdownMenuRef = ref<HTMLDivElement | null>(null);
const dropdownPosition = ref({ top: 0, left: 0 });

const searchOptions = [
  { value: "multi", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
  { value: "person", label: "People" },
  { value: "collection", label: "Collections" },
] as const;

const selectedLabel = computed(() => {
  const option = searchOptions.find((o) => o.value === props.searchType);
  return option?.label || "All";
});

const selectOption = (value: SearchType) => {
  emit("update:searchType", value);
  dropdownOpen.value = false;
  document.removeEventListener("click", handleClickOutside);
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  const isClickOnButton = dropdownButtonRef.value?.contains(target);
  const isClickOnMenu = dropdownMenuRef.value?.contains(target);

  if (!isClickOnButton && !isClickOnMenu) {
    dropdownOpen.value = false;
    document.removeEventListener("click", handleClickOutside);
  }
};

const updateDropdownPosition = () => {
  if (dropdownButtonRef.value) {
    const rect = dropdownButtonRef.value.getBoundingClientRect();
    dropdownPosition.value = {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    };
  }
};

const toggleDropdown = async () => {
  if (dropdownOpen.value) {
    dropdownOpen.value = false;
    document.removeEventListener("click", handleClickOutside);
  } else {
    updateDropdownPosition();
    dropdownOpen.value = true;
    await nextTick();
    document.addEventListener("click", handleClickOutside);
  }
};

const handleSubmit = () => {
  emit("submit");
};

const isHero = computed(() => props.variant === "hero");

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <form class="relative w-full" @submit.prevent="handleSubmit">
    <div
      :class="[
        'flex items-center transition-all',
        isHero
          ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full border border-gray-200 dark:border-transparent focus-within:border-teal-500 shadow-xl md:shadow-2xl'
          : 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-teal-500 shadow-sm',
      ]"
    >
      <!-- Custom Dropdown Button -->
      <button
        ref="dropdownButtonRef"
        type="button"
        :class="[
          'flex items-center gap-1 font-medium cursor-pointer border-r border-gray-200 dark:border-gray-700 transition-colors',
          isHero
            ? 'py-3 md:py-5 pl-4 md:pl-6 pr-2 text-sm md:text-base'
            : 'py-3 pl-4 pr-2 text-sm md:text-base',
        ]"
        @click.stop="toggleDropdown"
      >
        <span class="text-gray-900 dark:text-white">{{ selectedLabel }}</span>
        <svg
          :class="[
            'h-4 w-4 text-gray-500 transition-transform duration-200',
            dropdownOpen ? 'rotate-180' : '',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      <!-- Search Icon -->
      <svg
        :class="[
          'text-gray-400 flex-shrink-0',
          isHero ? 'h-5 w-5 md:h-6 md:w-6 ml-3 md:ml-4' : 'h-5 w-5 ml-3',
        ]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>

      <!-- Search Input -->
      <input
        :value="modelValue"
        type="text"
        :placeholder="placeholder"
        :class="[
          'flex-1 min-w-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none',
          isHero
            ? 'py-3 md:py-5 pl-2 md:pl-3 pr-24 md:pr-32 text-sm md:text-lg'
            : 'py-3 pl-2 pr-24 text-sm md:text-base',
        ]"
        @input="
          emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
      />

      <!-- Search Button -->
      <button
        type="submit"
        :class="[
          'absolute bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition duration-200',
          isHero
            ? 'right-1.5 md:right-2 top-1.5 md:top-2 bottom-1.5 md:bottom-2 px-4 md:px-8 rounded-full text-sm md:text-base'
            : 'right-1.5 top-1.5 bottom-1.5 px-4 md:px-6 rounded-lg text-sm font-semibold',
        ]"
      >
        Search
      </button>
    </div>

    <!-- Teleported Dropdown Menu -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="dropdownOpen"
          ref="dropdownMenuRef"
          class="fixed z-[9999] w-[100px] py-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
          :style="{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }"
        >
          <button
            v-for="option in searchOptions"
            :key="option.value"
            type="button"
            :class="[
              'w-full px-3 py-1.5 text-left text-sm font-medium transition-colors',
              option.value === searchType
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
            @click="selectOption(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </Transition>
    </Teleport>
  </form>
</template>
