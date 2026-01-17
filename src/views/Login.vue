<script setup lang="ts">
import { ref } from 'vue';
import { useConvexMutation } from '@convex-vue/core'; // Wait, I need to check how to use Convex in Vue properly.
// I haven't installed a specific Vue-Convex library other than `convex`. 
// The standard way is using the `convex` client directly or a wrapper.
// I will use the standard `ConvexHttpClient` or create a simple wrapper.
// Actually, for Vue, there isn't an official `convex-vue` package maintained by Convex, 
// but it's easy to use the client directly.

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { authStore } from '../store/auth';
import { useRouter } from 'vue-router';

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
  <div class="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-center">
      {{ step === 'email' ? 'Sign In' : 'Verify Code' }}
    </h2>

    <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded mb-4">
      {{ error }}
    </div>

    <form @submit.prevent="step === 'email' ? handleSendCode() : handleVerify()">
      <div v-if="step === 'email'" class="mb-4">
        <label class="block text-gray-700 mb-2">Email Address</label>
        <input 
          v-model="email" 
          type="email" 
          required
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="you@example.com"
        />
      </div>

      <div v-else class="mb-4">
        <label class="block text-gray-700 mb-2">Enter Code sent to {{ email }}</label>
        <input 
          v-model="code" 
          type="text" 
          required
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="123456"
        />
      </div>

      <button 
        type="submit" 
        :disabled="loading"
        class="w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 disabled:opacity-50 transition"
      >
        {{ loading ? 'Processing...' : (step === 'email' ? 'Send Code' : 'Verify') }}
      </button>
    </form>
    
    <button 
      v-if="step === 'code'" 
      @click="step = 'email'"
      class="w-full mt-4 text-gray-500 text-sm hover:underline"
    >
      Change Email
    </button>
  </div>
</template>
