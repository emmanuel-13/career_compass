<script setup>
import { RouterView, RouterLink } from "vue-router";
import { useUserStore } from "./stores/users";
import { Vue3Lottie } from "vue3-lottie";
import { onMounted, computed, ref } from "vue";

import discover from "./data/lotties/discover.json";
import navbar from "./data/local_database/home.json";

const animate = {
    discover
};

const userStore = useUserStore();
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

const route = useRoute();


// =========================
// DROPDOWN LOGIC
// =========================

const showCountries = ref(false);
const countryLoading = ref(false);

const countries = [
    {
        code: "us",
        name: "United States"
    },
    {
        code: "uk",
        name: "United Kingdom"
    },
    {
        code: "ng",
        name: "Nigeria"
    }
];

// const selectCountry = async (countryCode) => {

//     // change country locally
//     userStore.currentUser.country = countryCode;

//     // update json-server
//     await fetch(
//         `http://localhost:3000/users/${userStore.currentUser.id}`,
//         {
//             method: "PATCH",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 country: countryCode
//             })
//         }
//     );

//     // close dropdown
//     showCountries.value = false;
// };

// const selectCountry = async (countryCode) => {

//     // close immediately
//     showCountries.value = false;

//     try {

//         countryLoading.value = true;

//         // change locally
//         userStore.currentUser.country = countryCode;

//         // update json-server
//         await fetch(
//             `http://localhost:3000/users/${userStore.currentUser.id}`,
//             {
//                 method: "PATCH",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     country: countryCode
//                 })
//             }
//         );

//         // optional smooth loading
//         await new Promise(resolve =>
//             setTimeout(resolve, 800)
//         );

//     } catch (error) {

//         console.log(error);

//     } finally {

//         countryLoading.value = false;

//     }
// };

// Add to your script setup in App.vue
import { useQuizStore } from "./stores/quiz.js";
import { useRoute, useRouter } from "vue-router";

const quizStore = useQuizStore();
const router = useRouter();

// Watch for country changes
const selectCountry = async (countryCode) => {
    showCountries.value = false;
    
    try {
        countryLoading.value = true;
        
        // Store old country for comparison
        const oldCountry = userStore.currentUser?.country;
        
        // change locally
        userStore.currentUser.country = countryCode;
        
        // update json-server
        await fetch(
            `${api}/${userStore.currentUser.id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    country: countryCode
                })
            }
        );
        
        // If on results page and country changed, regenerate careers
        if (route.name === 'results' && oldCountry !== countryCode) {
            console.log(`Country changed from ${oldCountry} to ${countryCode}, refreshing careers...`);
            
            // Clear cached careers for this country
            localStorage.removeItem('cached_careers');
            
            // Regenerate careers for new country
            await quizStore.generateCareer(countryCode, true);
            
            // Force router refresh to update view
            await router.go(0);
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
    } catch (error) {
        console.log(error);
    } finally {
        countryLoading.value = false;
    }
};

</script>

<template>
  <main>
    <div class="min-h-screen bg-white">
            <!-- my navbar -->
            <!-- <nav
                v-if="route.name !== 'onboarding'"
                class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/60"
            > -->
            <nav
                v-if="route.name !== 'onboarding' && route.name !== 'explore'"
                class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/60"
            >
                <div class="max-w-7xl mx-auto px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <a href="/home" class="flex items-center gap-2.5 hover:opacity-90 transition-opacity" data-discover="true">
                            <div class="w-9 h-9 rounded-lg bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
                                <Vue3Lottie
                                    :animation-data="animate.discover"
                                    :height="30"
                                    :width="30"
                                    backgroundColor="transparent"
                                />
                            </div>
                            <span class="text-xl font-bold tracking-tight text-gray"> Career Compass</span>
                        </a>

                        <div class="flex items-center gap-8">
                            <div class="hidden md:flex items-center gap-1">
                                <router-link
                                    v-for="(link, name) in navbar.navbar"
                                    :key="name"
                                    :to="link"
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                    active-class="bg-indigo-50 text-indigo-700"
                                    exact-active-class="bg-indigo-50 text-indigo-700"
                                >
                                    {{ name }}
                                </router-link>
                            </div>

                            <!-- <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200/60">
                              <Vue3Lottie
                                    :animation-data="animate.discover"
                                    :height="24"
                                    :width="24"
                                    backgroundColor="transparent"
                              />
                              <button type="button" role="combobox" aria-expanded="false" aria-autocomplete="false" class="border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring 
                              focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center 
                              justify-between gap-2 rounded-md whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 
                              *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 w-[140px] 
                              border-0 bg-transparent focus:ring-0 h-auto p-0 text-sm font-medium text-gray-700">
                                <span data-slot="select-value">
                                    {{ currentCountry }}
                                </span>
                              </button>
                            </div> -->
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
                                        <span>
                                            {{ currentCountry }}
                                        </span>

                                        <span class="text-xs">
                                            ▼
                                        </span>
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

            <!-- <RouterView />         -->
             <div
                v-if="countryLoading"
                class="min-h-screen flex items-center justify-center bg-white"
            >
                <div class="flex flex-col items-center gap-4">
                    
                    <div
                        class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"
                    ></div>

                    <p class="text-sm font-medium text-gray-600">
                        Updating country...
                    </p>
                </div>
            </div>

            <RouterView v-else />

            <footer class="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white" v-if="route.name !== 'onboarding'">
                <div class="max-w-7xl mx-auto text-center">
                    <p class="text-xl  mb-2">© 2026 Career Compass</p>
                    <p class="text-grey-600"> Helping students discover their ideal career paths </p>
                </div>
            </footer>
            
        </div>
    
  </main>
  
</template>

<style scoped></style>
