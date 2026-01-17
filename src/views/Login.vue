<script setup lang="ts">
import { authStore } from '../store/auth';
import { useRouter } from 'vue-router'; // Wait, I need to check how to use Convex in Vue properly.
// I haven't installed a specific Vue-Convex library other than `convex`. 
// The standard way is using the `convex` client directly or a wrapper.
// I will use the standard `ConvexHttpClient` or create a simple wrapper.
// Actually, for Vue, there isn't an official `convex-vue` package maintained by Convex, 
// but it's easy to use the client directly.

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { ref } from 'vue';

const router = useRouter();
const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

const email = ref('');
const code = ref('');
const step = ref<'email' | 'code'>('email');
const loading = ref(false);
const error = ref('');

const handleSendCode = async () => {
  if (!email.value) return;
  loading.value = true;
  error.value = '';
  
  try {
    await client.mutation(api.auth.signIn, { email: email.value });
    step.value = 'code';
  } catch (err: any) {
    error.value = err.message || 'Failed to send code';
  } finally {
    loading.value = false;
  }
};

const handleVerify = async () => {
  if (!code.value) return;
  loading.value = true;
  error.value = '';

  try {
    const result = await client.mutation(api.auth.verifyCode, { 
      email: email.value, 
      code: code.value 
    });
    
    authStore.login(result.userId);
    router.push('/');
  } catch (err: any) {
    error.value = err.message || 'Invalid code';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ step === 'email' ? 'Welcome Back' : 'Check your Inbox' }}
      </h2>
      <p class="text-gray-500 dark:text-gray-400">
        {{ step === 'email' ? 'Enter your email to sign in or create an account.' : `We sent a code to ${email}` }}
      </p>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      {{ error }}
    </div>

    <form @submit.prevent="step === 'email' ? handleSendCode() : handleVerify()">
      <div v-if="step === 'email'" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
        <input 
          v-model="email" 
          type="email" 
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
          placeholder="you@example.com"
        />
      </div>

      <div v-else class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Code</label>
        <input 
          v-model="code" 
          type="text" 
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition tracking-widest text-center text-lg font-mono"
          placeholder="123456"
        />
      </div>

      <button 
        type="submit" 
        :disabled="loading"
        class="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
      >
        {{ loading ? 'Processing...' : (step === 'email' ? 'Send Login Code' : 'Verify & Sign In') }}
      </button>
    </form>
    
    <button 
      v-if="step === 'code'" 
      @click="step = 'email'"
      class="w-full mt-6 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 transition"
    >
      ← Back to Email
    </button>
  </div>
</template>