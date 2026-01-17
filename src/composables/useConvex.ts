import { ref, onMounted, onUnmounted, watch, unref, isRef } from 'vue';
import { ConvexHttpClient, ConvexClient } from "convex/browser";

const client = new ConvexClient(import.meta.env.VITE_CONVEX_URL);
const httpClient = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

export function useConvexQuery(query: any, args: any) {
  const data = ref<any>(null);
  const error = ref<any>(null);
  const loading = ref(true);

  let unsubscribe: (() => void) | null = null;

  const subscribe = () => {
    // Correctly extract the value from a Ref or ComputedRef
    const argsValue = unref(args);
    
    // Don't subscribe if we don't have valid args (e.g. userId is null)
    if (!argsValue || Object.values(argsValue).some(v => v === null || v === undefined)) {
      data.value = null;
      loading.value = false;
      return;
    }

    loading.value = true;
    if (unsubscribe) unsubscribe();
    
    try {
      unsubscribe = client.onUpdate(query, argsValue, (updatedData) => {
        data.value = updatedData;
        loading.value = false;
      }, (err) => {
        error.value = err;
        loading.value = false;
      });
    } catch (err) {
      error.value = err;
      loading.value = false;
    }
  };

  onMounted(subscribe);
  
  // Watch the unref'd value for changes
  watch(() => unref(args), () => {
    subscribe();
  }, { deep: true });

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
  });

  return { data, error, loading };
}

export function useConvexMutation(mutation: any) {
  const loading = ref(false);
  const error = ref<any>(null);

  const mutate = async (args: any) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await httpClient.mutation(mutation, args);
      return result;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { mutate, loading, error };
}