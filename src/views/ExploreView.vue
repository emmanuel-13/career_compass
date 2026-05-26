<template>
    <div class="min-h-screen bg-linear-to-b from-gray-50 to-white">
        <div class="bg-linear-to-r from-indigo-600 to-purple-600 text-white py-12 px-4">
            <div class="max-w-7xl mx-auto">
                <!-- Back to Home Button -->
                <button 
                    @click="goToHome"
                    class="mb-6 inline-flex items-center gap-2 text-indigo-100 hover:text-white transition-colors group"
                >
                    <span class="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Back to Home</span>
                </button>
                <h1 class="text-4xl md:text-5xl font-bold mb-4">Explore Careers {{userStore.currentUser?.name ? `, ${userStore.currentUser.name}` : ''}}</h1>
                <p class="text-lg text-indigo-100 max-w-2xl">Discover career paths across technology, healthcare, creative fields, business, skilled trades, and hospitality</p>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Search Bar -->
            <div class="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1 relative">
                        <input 
                            v-model="searchQuery"
                            type="text" 
                            placeholder="Search careers by title, skills, or description..." 
                            class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                        />
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                    </div>
                </div>
            </div>

            <!-- Category Tabs -->
            <div class="mb-8 overflow-x-auto">
                <div class="flex items-center gap-2 pb-2">
                    <button 
                        v-for="category in categories" 
                        :key="category.id"
                        @click="selectedCategory = category.id; currentPage = 1"
                        :class="[
                            'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200',
                            selectedCategory === category.id 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:shadow-md'
                        ]"
                    >
                        <span class="text-xl">{{ category.icon }}</span>
                        <span class="font-medium">{{ category.name }}</span>
                        <span class="text-xs opacity-75">{{ category.count }}</span>
                    </button>
                </div>
            </div>

            <!-- Results Count -->
            <div class="mb-6">
                <p class="text-gray-600">Showing 
                    <span class="font-semibold text-gray-900">{{ filteredCareers.length }}</span>
                    careers 
                    <span v-if="searchQuery">matching "{{ searchQuery }}"</span>
                    <span v-if="selectedCategory !== 'all'">in {{ getCategoryName(selectedCategory) }}</span>
                    <span v-if="userStore.currentUser?.country"> in {{ getCountryName(userStore.currentUser.country) }}</span>
                </p>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-20">
                <div class="inline-block">
                    <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                </div>
                <p class="text-gray-600">Loading careers...</p>
            </div>

            <!-- Careers Grid -->
            <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                    v-for="career in paginatedCareers" 
                    :key="career.id" 
                    class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-300 group flex flex-col"
                >
                    <div class="p-6 flex-1">
                        <div class="flex items-start justify-between mb-3">
                            <div class="text-5xl">{{ getCareerIcon(career.title) }}</div>
                            <span 
                                :class="[
                                    'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium',
                                    getCategoryColor(career.category)
                                ]"
                            >
                                {{ career.category || getCareerCategory(career.title) }}
                            </span>
                        </div>
                        <h3 class="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors">{{ career.title }}</h3>
                        <p class="text-sm text-gray-600 mb-4 line-clamp-3">{{ career.shortDescription || career.description?.substring(0, 120) + '...' }}</p>
                        
                        <!-- Salary Info -->
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-500">💰 Salary:</span>
                                <span class="font-semibold text-indigo-600">{{ formatSalary(career.salary) }}</span>
                            </div>
                            <span 
                                :class="[
                                    'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
                                    getSalaryLevel(career.salary) === 'High' ? 'bg-green-100 text-green-700' :
                                    getSalaryLevel(career.salary) === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                ]"
                            >
                                {{ getSalaryLevel(career.salary) }}
                            </span>
                        </div>
                        
                        <!-- Skills -->
                        <div class="flex flex-wrap gap-1 mb-4">
                            <span 
                                v-for="(skill, idx) in career.skills?.slice(0, 3)" 
                                :key="idx"
                                class="px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600"
                            >
                                {{ skill }}
                            </span>
                            <span 
                                v-if="career.skills?.length > 3"
                                class="px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-500"
                            >
                                +{{ career.skills.length - 3 }} more
                            </span>
                        </div>
                        
                        <button 
                            @click="viewCareer(career.slug)"
                            class="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all transform hover:scale-[1.02]"
                        >
                            Learn More →
                        </button>
                    </div>
                </div>
            </div>

            <!-- No Results -->
            <div v-if="!loading && filteredCareers.length === 0" class="text-center py-12">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">No careers found</h3>
                <p class="text-gray-500">Try adjusting your search or filter criteria</p>
                <button 
                    @click="resetFilters"
                    class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Reset Filters
                </button>
            </div>

            <!-- Pagination -->
            <div v-if="!loading && filteredCareers.length > 0" class="mt-12 flex justify-center items-center gap-2">
                <button 
                    @click="currentPage--" 
                    :disabled="currentPage === 1"
                    :class="[
                        'px-4 py-2 rounded-lg border transition-all',
                        currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                    ]"
                >
                    ← Previous
                </button>
                
                <div class="flex gap-1">
                    <button 
                        v-for="page in displayedPages"
                        :key="page"
                        @click="currentPage = page"
                        :class="[
                            'w-10 h-10 rounded-lg transition-all',
                            currentPage === page 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300'
                        ]"
                    >
                        {{ page }}
                    </button>
                </div>
                
                <button 
                    @click="currentPage++" 
                    :disabled="currentPage === totalPages"
                    :class="[
                        'px-4 py-2 rounded-lg border transition-all',
                        currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                    ]"
                >
                    Next →
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/users';

const router = useRouter();
const userStore = useUserStore();

// State
const allCareers = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('all');
const currentPage = ref(1);
const itemsPerPage = 9;


const api = import.meta.env.VITE_API_URL;

// Categories with icons
const categories = ref([
    { id: 'all', name: 'All Careers', icon: '🌟', count: 0 },
    { id: 'technology', name: 'Technology', icon: '💻', count: 0 },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥', count: 0 },
    { id: 'business', name: 'Business', icon: '📊', count: 0 },
    { id: 'creative', name: 'Creative Arts', icon: '🎨', count: 0 },
    { id: 'engineering', name: 'Engineering', icon: '🔧', count: 0 },
    { id: 'social', name: 'Social Sciences', icon: '🤝', count: 0 }
]);

// Helper: Get country name
const getCountryName = (countryCode) => {
    const names = {
        'us': 'United States',
        'uk': 'United Kingdom',
        'ng': 'Nigeria',
        'canada': 'Canada',
        'australia': 'Australia'
    };
    return names[countryCode?.toLowerCase()] || countryCode || 'your region';
};

// Helper: Get career icon based on title
const getCareerIcon = (title) => {
    if (!title) return '🎯';
    const t = title.toLowerCase();
    
    if (t.includes('software') || t.includes('developer') || t.includes('programmer')) return '💻';
    if (t.includes('engineer') || t.includes('engineering')) return '🔧';
    if (t.includes('data') || t.includes('analyst')) return '📊';
    if (t.includes('cyber') || t.includes('security')) return '🔒';
    if (t.includes('doctor') || t.includes('physician')) return '👨‍⚕️';
    if (t.includes('nurse')) return '🩺';
    if (t.includes('dentist')) return '🦷';
    if (t.includes('social') || t.includes('counselor')) return '🤝';
    if (t.includes('lawyer') || t.includes('attorney')) return '⚖️';
    if (t.includes('teacher') || t.includes('educator')) return '📚';
    if (t.includes('accountant') || t.includes('finance')) return '💰';
    if (t.includes('manager') || t.includes('business')) return '📋';
    if (t.includes('designer') || t.includes('artist')) return '🎨';
    if (t.includes('writer') || t.includes('journalist')) return '✍️';
    if (t.includes('scientist') || t.includes('researcher')) return '🔬';
    if (t.includes('architect')) return '🏛️';
    return '🎯';
};

// Helper: Get career category
const getCareerCategory = (title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('software') || t.includes('developer') || t.includes('programmer') || t.includes('data') || t.includes('cyber') || t.includes('security') || t.includes('cloud')) return 'technology';
    if (t.includes('engineer') || t.includes('engineering') || t.includes('civil') || t.includes('mechanical') || t.includes('electrical')) return 'engineering';
    if (t.includes('doctor') || t.includes('medical') || t.includes('nurse') || t.includes('dentist') || t.includes('pharmacist') || t.includes('biomedical')) return 'healthcare';
    if (t.includes('business') || t.includes('accountant') || t.includes('finance') || t.includes('marketing') || t.includes('manager') || t.includes('entrepreneur')) return 'business';
    if (t.includes('designer') || t.includes('artist') || t.includes('writer') || t.includes('journalist') || t.includes('architect')) return 'creative';
    if (t.includes('social') || t.includes('counselor') || t.includes('psychologist') || t.includes('teacher') || t.includes('lawyer')) return 'social';
    return 'business';
};

// Helper: Get category color
const getCategoryColor = (category) => {
    const colors = {
        technology: 'bg-blue-100 text-blue-700',
        engineering: 'bg-purple-100 text-purple-700',
        healthcare: 'bg-green-100 text-green-700',
        business: 'bg-orange-100 text-orange-700',
        creative: 'bg-pink-100 text-pink-700',
        social: 'bg-indigo-100 text-indigo-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
};

// Helper: Get category name
const getCategoryName = (categoryId) => {
    const category = categories.value.find(c => c.id === categoryId);
    return category?.name || 'All Careers';
};

// Helper: Format salary
const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (typeof salary === 'object' && salary.min && salary.max) {
        const userCountry = userStore.currentUser?.country?.toLowerCase() || 'us';
        const currency = salary.currency || (userCountry === 'ng' ? 'NGN' : userCountry === 'uk' ? 'GBP' : 'USD');
        const formatter = new Intl.NumberFormat(userCountry === 'ng' ? 'en-NG' : 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
    }
    if (typeof salary === 'string') return salary;
    return 'Not specified';
};

// Helper: Get salary level
const getSalaryLevel = (salary) => {
    if (!salary) return 'Medium';
    if (typeof salary === 'object' && salary.min && salary.max) {
        const userCountry = userStore.currentUser?.country?.toLowerCase() || 'us';
        if (userCountry === 'ng') {
            if (salary.min >= 3000000) return 'High';
            if (salary.min >= 1500000) return 'Medium';
            return 'Entry';
        } else {
            if (salary.min >= 80000) return 'High';
            if (salary.min >= 50000) return 'Medium';
            return 'Entry';
        }
    }
    return 'Medium';
};

// Fetch careers based on user's country
const fetchCareers = async () => {
    loading.value = true;
    try {
        const userCountry = userStore.currentUser?.country?.toLowerCase() || 'us';
        
        // Try to get from country-specific localStorage first
        const cachedCareers = localStorage.getItem(`cached_careers_${userCountry}`);
        if (cachedCareers) {
            const parsed = JSON.parse(cachedCareers);
            if (parsed && parsed.length > 0) {
                allCareers.value = parsed;
                updateCategoryCounts();
                loading.value = false;
                console.log(`✅ Loaded ${parsed.length} careers from localStorage for ${userCountry}`);
                return;
            }
        }
        
        // Try to get from generic localStorage cache
        const genericCache = localStorage.getItem('cached_careers');
        if (genericCache) {
            const parsed = JSON.parse(genericCache);
            if (parsed && parsed.length > 0) {
                allCareers.value = parsed;
                updateCategoryCounts();
                loading.value = false;
                console.log(`✅ Loaded ${parsed.length} careers from generic localStorage`);
                return;
            }
        }
        
        // Try to get from json-server
        try {
            const response = await fetch(`${api}/careers`);
            if (response.ok) {
                const careers = await response.json();
                if (careers.length > 0) {
                    allCareers.value = careers;
                    updateCategoryCounts();
                    loading.value = false;
                    console.log(`✅ Loaded ${careers.length} careers from json-server`);
                    return;
                }
            }
        } catch (err) {
            console.log('json-server not available');
        }
        
        // If no careers found, show empty state
        allCareers.value = [];
        updateCategoryCounts();
        console.log(`⚠️ No careers found`);
        
    } catch (error) {
        console.error('Error fetching careers:', error);
        allCareers.value = [];
    } finally {
        loading.value = false;
    }
};

// Update category counts
const updateCategoryCounts = () => {
    categories.value = categories.value.map(cat => ({
        ...cat,
        count: cat.id === 'all' ? allCareers.value.length : allCareers.value.filter(c => (c.category || getCareerCategory(c.title)) === cat.id).length
    }));
};

// Filter careers based on search and category
const filteredCareers = computed(() => {
    let careers = [...allCareers.value];
    
    // Filter by category
    if (selectedCategory.value !== 'all') {
        careers = careers.filter(c => (c.category || getCareerCategory(c.title)) === selectedCategory.value);
    }
    
    // Filter by search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        careers = careers.filter(c => 
            c.title?.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query) ||
            c.skills?.some(skill => skill.toLowerCase().includes(query))
        );
    }
    
    return careers;
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredCareers.value.length / itemsPerPage));
const paginatedCareers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCareers.value.slice(start, end);
});

// Displayed page numbers
const displayedPages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }

    range.forEach((i) => {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    });

    return rangeWithDots;
});

// Reset filters
const resetFilters = () => {
    searchQuery.value = '';
    selectedCategory.value = 'all';
    currentPage.value = 1;
};

// View career details
const viewCareer = (slug) => {
    router.push(`/explore/${slug}`);
};

// Go back to home
const goToHome = () => {
    router.push({name: "home"});
};

// Watch for country changes
watch(() => userStore.currentUser?.country, async () => {
    await fetchCareers();
    currentPage.value = 1;
});

// Watch search query to reset page
watch(searchQuery, () => {
    currentPage.value = 1;
});

// Watch selected category to reset page
watch(selectedCategory, () => {
    currentPage.value = 1;
});

// Load careers on mount
onMounted(async () => {
    await userStore.fetchCurrentUser();
    await fetchCareers();
});
</script>

<style scoped>
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
