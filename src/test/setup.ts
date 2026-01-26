import { vi, beforeEach } from "vitest";
import { config } from "@vue/test-utils";

// Reset mocks before each test
beforeEach(() => {
  // Suppress Vue Test Utils warnings about missing template/render functions
  // Vue Test Utils emits a warning when a component used only for its setup()
  // has no template. Tests for composables deliberately use such components,
  // so we silence the warning globally.
  config.global = {
    ...config.global,
    // @ts-expect-error – Vue Test Utils typings don’t include warnHandler,
    // but the runtime respects it.
    warnHandler: () => {},
  };
  vi.clearAllMocks();
});
