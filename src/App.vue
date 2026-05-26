<script setup>
import { RouterView, RouterLink, useRoute, useRouter } from "vue-router";
import { useUserStore } from "./stores/users";
import { useQuizStore } from "./stores/quiz";
import { Vue3Lottie } from "vue3-lottie";
import { onMounted, computed, ref } from "vue";

import discover from "./data/lotties/discover.json";
import navbar from "./data/local_database/home.json";

const animate = {
    discover
};

const userStore = useUserStore();
const quizStore = useQuizStore();
const route = useRoute();
const router = useRouter();

const api = import.meta.env.VITE_API_URL || 'http://localhost:3000';

onMounted(async () => {
    await userStore.fetchCurrentUser();
});

const countryNames = {
    us: "United States",
    uk: "United Kingdom",
    ng: "Nigeria"
};

const currentCountry = computed(() => {
    return countryNames[userStore.currentUser?.country] || "Select Country";
});

// =========================
// DROPDOWN LOGIC
// =========================

const showCountries = ref(false);
const countryLoading = ref(false);

const countries = [
    { code: "us", name: "United States" },
    { code: "uk", name: "United Kingdom" },
    { code: "ng", name: "Nigeria" }
];

// FIXED: selectCountry function
const selectCountry = async (countryCode) => {
    showCountries.value = false;
    
    try {
        countryLoading.value = true;
        
        // Store old country for comparison
        const oldCountry = userStore.currentUser?.country;
        
        // Check if user exists
        if (!userStore.currentUser?.id) {
            console.error("No user found");
            return;
        }
        
        // change locally first
        userStore.currentUser.country = countryCode;
        
        // FIXED: Correct API endpoint - users not users/${id}
        const response = await fetch(`${api}/users/${userStore.currentUser.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                country: countryCode
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update country: ${response.status}`);
        }
        
        // If on results page and country changed, regenerate careers
        if (route.name === 'results' && oldCountry !== countryCode) {
            console.log(`Country changed from ${oldCountry} to ${countryCode}, refreshing careers...`);
            
            // Clear cached careers for old country
            if (oldCountry) {
                localStorage.removeItem(`cached_careers_${oldCountry}`);
            }
            localStorage.removeItem('cached_careers');
            
            // Regenerate careers for new country
            await quizStore.generateCareer(countryCode, true);
        }
        
    } catch (error) {
        console.error("Error changing country:", error);
        // Revert the local change if API failed
        if (userStore.currentUser && oldCountry) {
            userStore.currentUser.country = oldCountry;
        }
    } finally {
        countryLoading.value = false;
    }
};

</script>

<template>
  <main>
    <div class="min-h-screen bg-white">
      <nav
        v-if="route.name !== 'onboarding' && route.name !== 'explore'"
        class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/60"
      >
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <a href="/home" class="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
                <Vue3Lottie
                  :animation-data="animate.discover"
                  :height="30"
                  :width="30"
                  backgroundColor="transparent"
                />
              </div>
              <span class="text-xl font-bold tracking-tight text-gray-900">Career Compass</span>
            </a>

            <div class="flex items-center gap-8">
              <div class="hidden md:flex items-center gap-1">
                <router-link
                  v-for="(link, name) in navbar.navbar"
                  :key="name"
                  :to="link"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  active-class="bg-indigo-50 text-indigo-700"
                >
                  {{ name }}
                </router-link>
              </div>

              <div class="relative">
                <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200/60">
                  <Vue3Lottie
                    :animation-data="animate.discover"
                    :height="24"
                    :width="24"
                    backgroundColor="transparent"
                  />

                  <button
                    @click="showCountries = !showCountries"
                    type="button"
                    class="flex items-center justify-between gap-2 w-[140px] border-0 bg-transparent focus:ring-0 h-auto p-0 text-sm font-medium text-gray-700 outline-none cursor-pointer"
                  >
                    <span>{{ currentCountry }}</span>
                    <span class="text-xs">▼</span>
                  </button>
                </div>

                <!-- Dropdown -->
                <div
                  v-if="showCountries"
                  class="absolute top-14 right-0 w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
                >
                  <button
                    v-for="country in countries"
                    :key="country.code"
                    @click="selectCountry(country.code)"
                    class="w-full px-4 py-3 text-left text-sm hover:bg-indigo-50 transition-colors"
                  >
                    {{ country.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Loading overlay -->
      <div
        v-if="countryLoading"
        class="min-h-screen flex items-center justify-center bg-white"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm font-medium text-gray-600">Updating country...</p>
        </div>
      </div>

      <RouterView v-else />

      <footer 
        class="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white" 
        v-if="route.name !== 'onboarding'"
      >
        <div class="max-w-7xl mx-auto text-center">
          <p class="text-xl mb-2">© 2026 Career Compass</p>
          <p class="text-gray-400">Helping students discover their ideal career paths</p>
        </div>
      </footer>
    </div>
  </main>
</template>

<style scoped></style>
