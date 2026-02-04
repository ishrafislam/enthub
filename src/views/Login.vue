<script setup lang="ts">
import { authStore } from "../store/auth";
import { useRouter } from "vue-router";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { ref } from "vue";
import { useTheme } from "../composables/useTheme";

const { isCyberpunk } = useTheme();

const router = useRouter();
const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

const email = ref("");
const code = ref("");
const step = ref<"email" | "code">("email");
const loading = ref(false);
const error = ref("");

// Extract error message from Convex error
const getErrorMessage = (err: unknown, fallback: string): string => {
  // Handle ConvexError - the message is in err.data
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data: unknown }).data;
    if (typeof data === "string") {
      return data;
    }
    if (data && typeof data === "object" && "message" in data) {
      return String((data as { message: unknown }).message);
    }
  }

  if (err instanceof Error) {
    return err.message || fallback;
  }

  if (typeof err === "string") {
    return err;
  }

  return fallback;
};

const handleSendCode = async () => {
  if (!email.value) {
    error.value = "Email is required.";
    return;
  }
  loading.value = true;
  error.value = "";

  try {
    await client.mutation(api.auth.signIn, { email: email.value });
    step.value = "code";
  } catch (err: unknown) {
    error.value = getErrorMessage(
      err,
      "Failed to send code. Please try again.",
    );
  } finally {
    loading.value = false;
  }
};

const handleVerify = async () => {
  if (!code.value) {
    error.value = "Verification code is required.";
    return;
  }
  loading.value = true;
  error.value = "";

  try {
    const result = await client.mutation(api.auth.verifyCode, {
      email: email.value,
      code: code.value,
    });

    authStore.login(result.userId);
    router.push("/");
  } catch (err: unknown) {
    error.value = getErrorMessage(err, "Invalid code. Please try again.");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    :class="[
      'max-w-md mx-auto mt-20 p-8 shadow-xl',
      isCyberpunk
        ? 'bg-cyber-night border border-cyber-chrome relative'
        : 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700',
    ]"
  >
    <!-- Cyberpunk corner accents -->
    <template v-if="isCyberpunk">
      <div
        class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyber-cyan"
      ></div>
      <div
        class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyber-cyan"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyber-cyan"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyber-cyan"
      ></div>
      <!-- Scan line effect -->
      <div
        class="absolute inset-0 pointer-events-none opacity-30"
        style="
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(85, 234, 212, 0.03) 2px,
            rgba(85, 234, 212, 0.03) 4px
          );
        "
      ></div>
    </template>

    <div class="text-center mb-8 relative">
      <!-- Cyberpunk system status -->
      <div
        v-if="isCyberpunk"
        class="text-cyber-cyan text-xs font-cyber-mono mb-4 flex items-center justify-center gap-2"
      >
        <span class="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></span>
        {{ step === "email" ? "AUTH_SYSTEM.INIT" : "VERIFY_SEQUENCE.ACTIVE" }}
      </div>

      <h2
        :class="[
          'text-3xl font-bold mb-2',
          isCyberpunk
            ? 'text-white font-display uppercase tracking-wider'
            : 'text-gray-900 dark:text-white',
        ]"
      >
        <template v-if="isCyberpunk">
          {{ step === "email" ? "ACCESS_PORTAL" : "INPUT_CODE" }}
        </template>
        <template v-else>
          {{ step === "email" ? "Welcome Back" : "Check your Inbox" }}
        </template>
      </h2>
      <p
        :class="[
          isCyberpunk
            ? 'text-cyber-muted font-display'
            : 'text-gray-500 dark:text-gray-400',
        ]"
      >
        <template v-if="isCyberpunk">
          {{
            step === "email"
              ? "Enter credentials to initialize session"
              : `Verification sent to: ${email}`
          }}
        </template>
        <template v-else>
          {{
            step === "email"
              ? "Enter your email to sign in or create an account."
              : `We sent a code to ${email}`
          }}
        </template>
      </p>
    </div>

    <div
      v-if="error"
      :class="[
        'p-4 mb-6 text-sm flex items-center gap-2 relative',
        isCyberpunk
          ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30 font-cyber-mono'
          : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg',
      ]"
    >
      <svg
        class="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <span v-if="isCyberpunk">[ERROR] {{ error }}</span>
      <span v-else>{{ error }}</span>
    </div>

    <form
      class="relative"
      @submit.prevent="step === 'email' ? handleSendCode() : handleVerify()"
    >
      <div v-if="step === 'email'" class="mb-6">
        <label
          :class="[
            'block text-sm font-medium mb-2',
            isCyberpunk
              ? 'text-cyber-cyan font-cyber-mono uppercase tracking-wider'
              : 'text-gray-700 dark:text-gray-300',
          ]"
        >
          <span v-if="isCyberpunk">&gt; EMAIL_ADDRESS</span>
          <span v-else>Email Address</span>
        </label>
        <div :class="isCyberpunk ? 'relative' : ''">
          <input
            v-model="email"
            type="email"
            required
            :class="[
              'w-full px-4 py-3 transition',
              isCyberpunk
                ? 'bg-cyber-black border border-cyber-chrome text-cyber-cyan font-cyber-mono focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(85,234,212,0.3)]'
                : 'rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
            ]"
            :placeholder="isCyberpunk ? 'user@network.sys' : 'you@example.com'"
          />
          <div
            v-if="isCyberpunk"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted text-xs font-cyber-mono"
          >
            .INPUT
          </div>
        </div>
      </div>

      <div v-else class="mb-6">
        <label
          :class="[
            'block text-sm font-medium mb-2',
            isCyberpunk
              ? 'text-cyber-cyan font-cyber-mono uppercase tracking-wider'
              : 'text-gray-700 dark:text-gray-300',
          ]"
        >
          <span v-if="isCyberpunk">&gt; VERIFICATION_CODE</span>
          <span v-else>Verification Code</span>
        </label>
        <div :class="isCyberpunk ? 'relative' : ''">
          <input
            v-model="code"
            type="text"
            required
            :class="[
              'w-full px-4 py-3 tracking-widest text-center text-lg transition',
              isCyberpunk
                ? 'bg-cyber-black border border-cyber-chrome text-cyber-yellow font-cyber-mono focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(85,234,212,0.3)]'
                : 'rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono',
            ]"
            :placeholder="isCyberpunk ? '••••••' : '123456'"
          />
          <div
            v-if="isCyberpunk"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted text-xs font-cyber-mono"
          >
            .SECURE
          </div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="loading"
        :class="[
          'w-full py-3 font-bold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden',
          isCyberpunk
            ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan font-display uppercase tracking-wider hover:bg-cyber-cyan/30 hover:shadow-[0_0_20px_rgba(85,234,212,0.3)] active:bg-cyber-cyan/40'
            : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        ]"
      >
        <!-- Cyberpunk animated border -->
        <span
          v-if="isCyberpunk && !loading"
          class="absolute inset-0 border border-cyber-cyan opacity-50"
          style="
            animation: border-flow 2s linear infinite;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(85, 234, 212, 0.3),
                transparent
              )
              no-repeat;
            background-size: 200% 100%;
          "
        ></span>
        <span class="relative">
          <template v-if="isCyberpunk">
            {{
              loading
                ? "PROCESSING..."
                : step === "email"
                  ? "&gt; SEND_AUTH_CODE"
                  : "&gt; VERIFY_ACCESS"
            }}
          </template>
          <template v-else>
            {{
              loading
                ? "Processing..."
                : step === "email"
                  ? "Send Login Code"
                  : "Verify & Sign In"
            }}
          </template>
        </span>
      </button>
    </form>

    <button
      v-if="step === 'code'"
      :class="[
        'w-full mt-6 text-sm transition',
        isCyberpunk
          ? 'text-cyber-muted hover:text-cyber-cyan font-cyber-mono uppercase tracking-wider'
          : 'text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400',
      ]"
      @click="step = 'email'"
    >
      <span v-if="isCyberpunk">&lt; RETURN_TO_EMAIL</span>
      <span v-else>← Back to Email</span>
    </button>

    <!-- Cyberpunk footer decoration -->
    <div
      v-if="isCyberpunk"
      class="mt-8 pt-4 border-t border-cyber-chrome text-center"
    >
      <div class="text-cyber-muted text-xs font-cyber-mono">
        SECURE_CONNECTION.ESTABLISHED
      </div>
      <div class="flex justify-center gap-4 mt-2">
        <span class="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></span>
        <span
          class="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"
          style="animation-delay: 0.2s"
        ></span>
        <span
          class="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"
          style="animation-delay: 0.4s"
        ></span>
      </div>
    </div>
  </div>
</template>
