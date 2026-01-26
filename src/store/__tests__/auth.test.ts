import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock localStorage before importing authStore
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
    _getStore: () => store,
    _setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock window.addEventListener
const mockAddEventListener = vi.fn();
Object.defineProperty(globalThis, "window", {
  value: {
    addEventListener: mockAddEventListener,
  },
  writable: true,
});

describe("authStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Reset the module cache to get a fresh authStore
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with null userId when localStorage is empty", async () => {
      const { authStore } = await import("../auth");
      expect(authStore.userId).toBeNull();
    });

    it("should initialize with stored userId from localStorage", async () => {
      localStorageMock._setStore({ enthub_user_id: "test-user-123" });
      const { authStore } = await import("../auth");
      expect(authStore.userId).toBe("test-user-123");
    });

    it("should ignore empty string in localStorage", async () => {
      localStorageMock._setStore({ enthub_user_id: "" });
      const { authStore } = await import("../auth");
      expect(authStore.userId).toBeNull();
    });

    it("should register storage event listener", async () => {
      await import("../auth");
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "storage",
        expect.any(Function),
      );
    });
  });

  describe("login", () => {
    it("should set userId when logging in", async () => {
      const { authStore } = await import("../auth");

      authStore.login("user-abc-123");

      expect(authStore.userId).toBe("user-abc-123");
    });

    it("should persist userId to localStorage", async () => {
      const { authStore } = await import("../auth");

      authStore.login("user-xyz-789");

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "enthub_user_id",
        "user-xyz-789",
      );
    });

    it("should overwrite previous userId", async () => {
      const { authStore } = await import("../auth");

      authStore.login("user-first");
      authStore.login("user-second");

      expect(authStore.userId).toBe("user-second");
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
        "enthub_user_id",
        "user-second",
      );
    });
  });

  describe("logout", () => {
    it("should clear userId when logging out", async () => {
      const { authStore } = await import("../auth");
      authStore.login("user-abc");

      authStore.logout();

      expect(authStore.userId).toBeNull();
    });

    it("should remove userId from localStorage", async () => {
      const { authStore } = await import("../auth");
      authStore.login("user-abc");

      authStore.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "enthub_user_id",
      );
    });

    it("should handle logout when not logged in", async () => {
      const { authStore } = await import("../auth");

      // Should not throw
      authStore.logout();

      expect(authStore.userId).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "enthub_user_id",
      );
    });
  });

  describe("isAuthenticated", () => {
    it("should return false when userId is null", async () => {
      const { authStore } = await import("../auth");

      expect(authStore.isAuthenticated()).toBe(false);
    });

    it("should return true when userId is set", async () => {
      const { authStore } = await import("../auth");
      authStore.login("user-123");

      expect(authStore.isAuthenticated()).toBe(true);
    });

    it("should return false after logout", async () => {
      const { authStore } = await import("../auth");
      authStore.login("user-123");
      authStore.logout();

      expect(authStore.isAuthenticated()).toBe(false);
    });
  });

  describe("cross-tab synchronization", () => {
    it("should update userId when storage event fires for correct key", async () => {
      const { authStore } = await import("../auth");

      // Get the registered storage event handler
      const storageHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "storage",
      )?.[1] as ((event: StorageEvent) => void) | undefined;

      expect(storageHandler).toBeDefined();

      // Simulate storage event from another tab
      storageHandler!({
        key: "enthub_user_id",
        newValue: "new-tab-user",
      } as StorageEvent);

      expect(authStore.userId).toBe("new-tab-user");
    });

    it("should not update userId when storage event is for different key", async () => {
      const { authStore } = await import("../auth");
      authStore.login("original-user");

      const storageHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "storage",
      )?.[1] as ((event: StorageEvent) => void) | undefined;

      // Simulate storage event for different key
      storageHandler!({
        key: "other_key",
        newValue: "some-value",
      } as StorageEvent);

      expect(authStore.userId).toBe("original-user");
    });

    it("should handle null newValue (logout from another tab)", async () => {
      const { authStore } = await import("../auth");
      authStore.login("current-user");

      const storageHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "storage",
      )?.[1] as ((event: StorageEvent) => void) | undefined;

      // Simulate logout from another tab
      storageHandler!({
        key: "enthub_user_id",
        newValue: null,
      } as StorageEvent);

      expect(authStore.userId).toBeNull();
    });
  });

  describe("reactivity", () => {
    it("should be reactive (Vue reactive object)", async () => {
      const { authStore } = await import("../auth");
      const { isReactive } = await import("vue");

      expect(isReactive(authStore)).toBe(true);
    });
  });
});
