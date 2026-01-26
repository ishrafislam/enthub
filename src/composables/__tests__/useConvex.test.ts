import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref, computed, defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";

// Mock Convex clients before importing the module
const mockOnUpdate = vi.fn();
const mockMutation = vi.fn();

class MockConvexClient {
  constructor() {}
  onUpdate = mockOnUpdate;
}

class MockConvexHttpClient {
  constructor() {}
  mutation = mockMutation;
}

vi.mock("convex/browser", () => ({
  ConvexClient: MockConvexClient,
  ConvexHttpClient: MockConvexHttpClient,
}));

// Helper to create a test component that uses a composable
function withSetup<T>(composable: () => T): { result: T; unmount: () => void } {
  let result!: T;
  const TestComponent = defineComponent({
    setup() {
      result = composable();
      return () => h("div");
    },
  });
  const wrapper = mount(TestComponent);
  return { result, unmount: () => wrapper.unmount() };
}

describe("useConvex composables", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("useConvexQuery", () => {
    it("should throw error if query is not provided", async () => {
      const { useConvexQuery } = await import("../useConvex");

      expect(() => {
        withSetup(() => useConvexQuery(null, {}));
      }).toThrow("Query reference is required");
    });

    it("should throw error if query is undefined", async () => {
      const { useConvexQuery } = await import("../useConvex");

      expect(() => {
        withSetup(() => useConvexQuery(undefined, {}));
      }).toThrow("Query reference is required");
    });

    it("should return loading, data, and error refs", async () => {
      const { useConvexQuery } = await import("../useConvex");

      const mockQuery = { name: "testQuery" };
      const { result } = withSetup(() =>
        useConvexQuery(mockQuery, ref({ userId: "test" })),
      );

      expect(result.data.value).toBeNull();
      expect(result.error.value).toBeNull();
      expect(result.loading.value).toBe(true);
    });

    it("should not subscribe if args contain null values", async () => {
      const { useConvexQuery } = await import("../useConvex");

      const mockQuery = { name: "testQuery" };
      const args = ref({ userId: null });

      withSetup(() => useConvexQuery(mockQuery, args));

      // Fast forward debounce timer
      vi.advanceTimersByTime(150);
      await nextTick();

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it("should not subscribe if args contain undefined values", async () => {
      const { useConvexQuery } = await import("../useConvex");

      const mockQuery = { name: "testQuery" };
      const args = ref({ userId: undefined });

      withSetup(() => useConvexQuery(mockQuery, args));

      vi.advanceTimersByTime(150);
      await nextTick();

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it("should set loading to false when args are invalid", async () => {
      const { useConvexQuery } = await import("../useConvex");

      const mockQuery = { name: "testQuery" };
      const args = ref({ userId: null });

      const { result } = withSetup(() => useConvexQuery(mockQuery, args));

      vi.advanceTimersByTime(150);
      await nextTick();

      expect(result.loading.value).toBe(false);
      expect(result.data.value).toBeNull();
    });

    it("should work with computed args", async () => {
      const { useConvexQuery } = await import("../useConvex");

      const userId = ref("user-123");
      const mockQuery = { name: "testQuery" };
      const args = computed(() => ({ userId: userId.value }));

      const unsubscribeFn = vi.fn();
      mockOnUpdate.mockReturnValue(unsubscribeFn);

      withSetup(() => useConvexQuery(mockQuery, args));

      vi.advanceTimersByTime(150);
      await nextTick();

      expect(mockOnUpdate).toHaveBeenCalledWith(
        mockQuery,
        { userId: "user-123" },
        expect.any(Function),
        expect.any(Function),
      );
    });

    it("should debounce subscription (100ms)", async () => {
      const { useConvexQuery } = await import("../useConvex");

      const mockQuery = { name: "testQuery" };
      const args = ref({ userId: "test" });

      mockOnUpdate.mockReturnValue(vi.fn());

      withSetup(() => useConvexQuery(mockQuery, args));

      // Before debounce
      expect(mockOnUpdate).not.toHaveBeenCalled();

      // After debounce
      vi.advanceTimersByTime(100);
      await nextTick();

      expect(mockOnUpdate).toHaveBeenCalled();
    });

    it("should update data when onUpdate callback is called", async () => {
      const { useConvexQuery } = await import("../useConvex");

      const mockQuery = { name: "testQuery" };
      const args = ref({ userId: "test" });

      let onUpdateCallback: ((data: any) => void) | null = null;
      mockOnUpdate.mockImplementation((_query, _args, callback) => {
        onUpdateCallback = callback;
        return vi.fn();
      });

      const { result } = withSetup(() => useConvexQuery(mockQuery, args));

      vi.advanceTimersByTime(150);
      await nextTick();

      expect(onUpdateCallback).not.toBeNull();

      // Simulate data update
      onUpdateCallback!([{ id: 1, name: "Test Item" }]);

      expect(result.data.value).toEqual([{ id: 1, name: "Test Item" }]);
      expect(result.loading.value).toBe(false);
    });

    it("should set error when onUpdate error callback is called", async () => {
      const { useConvexQuery } = await import("../useConvex");

      const mockQuery = { name: "testQuery" };
      const args = ref({ userId: "test" });

      let onErrorCallback: ((err: any) => void) | null = null;
      mockOnUpdate.mockImplementation(
        (_query, _args, _callback, errorCallback) => {
          onErrorCallback = errorCallback;
          return vi.fn();
        },
      );

      const { result } = withSetup(() => useConvexQuery(mockQuery, args));

      vi.advanceTimersByTime(150);
      await nextTick();

      expect(onErrorCallback).not.toBeNull();

      const testError = new Error("Query failed");
      onErrorCallback!(testError);

      expect(result.error.value).toBe(testError);
      expect(result.loading.value).toBe(false);
    });

    it("should handle subscription error gracefully", async () => {
      const { useConvexQuery } = await import("../useConvex");

      const mockQuery = { name: "testQuery" };
      const args = ref({ userId: "test" });

      mockOnUpdate.mockImplementation(() => {
        throw new Error("Subscription failed");
      });

      const { result } = withSetup(() => useConvexQuery(mockQuery, args));

      vi.advanceTimersByTime(150);
      await nextTick();

      expect(result.error.value).toBeInstanceOf(Error);
      expect(result.error.value.message).toBe("Subscription failed");
      expect(result.loading.value).toBe(false);
    });

    it("should unsubscribe on unmount", async () => {
      const { useConvexQuery } = await import("../useConvex");

      const mockQuery = { name: "testQuery" };
      const args = ref({ userId: "test" });
      const unsubscribeFn = vi.fn();

      mockOnUpdate.mockReturnValue(unsubscribeFn);

      const { unmount } = withSetup(() => useConvexQuery(mockQuery, args));

      vi.advanceTimersByTime(150);
      await nextTick();

      unmount();

      expect(unsubscribeFn).toHaveBeenCalled();
    });
  });

  describe("useConvexMutation", () => {
    it("should throw error if mutation is not provided", async () => {
      const { useConvexMutation } = await import("../useConvex");

      expect(() => {
        withSetup(() => useConvexMutation(null));
      }).toThrow("Mutation reference is required");
    });

    it("should throw error if mutation is undefined", async () => {
      const { useConvexMutation } = await import("../useConvex");

      expect(() => {
        withSetup(() => useConvexMutation(undefined));
      }).toThrow("Mutation reference is required");
    });

    it("should return mutate function and state refs", async () => {
      const { useConvexMutation } = await import("../useConvex");

      const mockMutationRef = { name: "testMutation" };
      const { result } = withSetup(() => useConvexMutation(mockMutationRef));

      expect(typeof result.mutate).toBe("function");
      expect(result.loading.value).toBe(false);
      expect(result.error.value).toBeNull();
    });

    it("should set loading to true during mutation", async () => {
      const { useConvexMutation } = await import("../useConvex");

      let resolvePromise: (value: any) => void;
      mockMutation.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
      );

      const mockMutationRef = { name: "testMutation" };
      const { result } = withSetup(() => useConvexMutation(mockMutationRef));

      const mutationPromise = result.mutate({ data: "test" });

      expect(result.loading.value).toBe(true);

      resolvePromise!({ success: true });
      await mutationPromise;

      expect(result.loading.value).toBe(false);
    });

    it("should return mutation result on success", async () => {
      const { useConvexMutation } = await import("../useConvex");

      const expectedResult = { id: "new-item-123" };
      mockMutation.mockResolvedValue(expectedResult);

      const mockMutationRef = { name: "testMutation" };
      const { result } = withSetup(() => useConvexMutation(mockMutationRef));

      const mutationResult = await result.mutate({ name: "New Item" });

      expect(mutationResult).toEqual(expectedResult);
      expect(result.error.value).toBeNull();
    });

    it("should set error and throw on mutation failure", async () => {
      const { useConvexMutation } = await import("../useConvex");

      const mutationError = new Error("Mutation failed");
      mockMutation.mockRejectedValue(mutationError);

      const mockMutationRef = { name: "testMutation" };
      const { result } = withSetup(() => useConvexMutation(mockMutationRef));

      await expect(result.mutate({ data: "test" })).rejects.toThrow(
        "Mutation failed",
      );

      expect(result.error.value).toBe(mutationError);
      expect(result.loading.value).toBe(false);
    });

    it("should clear previous error before new mutation", async () => {
      const { useConvexMutation } = await import("../useConvex");

      const mockMutationRef = { name: "testMutation" };
      const { result } = withSetup(() => useConvexMutation(mockMutationRef));

      // First mutation fails
      mockMutation.mockRejectedValueOnce(new Error("First error"));
      await expect(result.mutate({ data: "test1" })).rejects.toThrow();
      expect(result.error.value).toBeInstanceOf(Error);

      // Second mutation succeeds
      mockMutation.mockResolvedValueOnce({ success: true });
      await result.mutate({ data: "test2" });
      expect(result.error.value).toBeNull();
    });

    it("should pass args to mutation correctly", async () => {
      const { useConvexMutation } = await import("../useConvex");

      mockMutation.mockResolvedValue({ success: true });

      const mockMutationRef = { name: "testMutation" };
      const { result } = withSetup(() => useConvexMutation(mockMutationRef));

      const args = { userId: "user-123", itemId: "item-456" };
      await result.mutate(args);

      expect(mockMutation).toHaveBeenCalledWith(mockMutationRef, args);
    });
  });
});
