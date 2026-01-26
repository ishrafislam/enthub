import { ref, onMounted, onUnmounted, watch, unref } from "vue";
import { ConvexHttpClient, ConvexClient } from "convex/browser";

const client = new ConvexClient(import.meta.env.VITE_CONVEX_URL);
const httpClient = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

export function useConvexQuery(query: any, args: any) {
  if (!query) throw new Error("Query reference is required for useConvexQuery");

  const data = ref<any>(null);
  const error = ref<any>(null);
  const loading = ref(true);

  let unsubscribe: (() => void) | null = null;
  let timeout: any = null;

  const subscribe = () => {
    // Clear any pending subscription attempts (simple debounce)
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      // Correctly extract the value from a Ref or ComputedRef
      const argsValue = unref(args);

      // Don't subscribe if we don't have valid args (e.g. userId is null)
      if (
        !argsValue ||
        Object.values(argsValue).some((v) => v === null || v === undefined)
      ) {
        data.value = null;
        loading.value = false;
        return;
      }

      loading.value = true;
      if (unsubscribe) unsubscribe();

      try {
        unsubscribe = client.onUpdate(
          query,
          argsValue,
          (updatedData) => {
            data.value = updatedData;
            loading.value = false;
          },
          (err) => {
            error.value = err;
            loading.value = false;
          },
        );
      } catch (err) {
        error.value = err;
        loading.value = false;
      }
    }, 100); // 100ms debounce
  };

  onMounted(subscribe);

  // Watch the unref'd value for changes
  watch(
    () => unref(args),
    () => {
      subscribe();
    },
    { deep: true },
  );

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
  });

  return { data, error, loading };
}

export function useConvexMutation(mutation: any) {
  if (!mutation)
    throw new Error("Mutation reference is required for useConvexMutation");

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
