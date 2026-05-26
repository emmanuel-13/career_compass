<script setup>
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/users";
import { useQuizStore } from "@/stores/quiz";
import { ref, onMounted, watch } from "vue";

const route = useRoute();
const userStore = useUserStore();
const quizStore = useQuizStore();

const career = ref(null);
const loading = ref(true);
const error = ref(null);

// Get icon for career
const getIconForCareer = (title) => {
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
    return '🎯';
};

// Format salary
const formatSalary = (salary) => {
    if (!salary) return 'Information not available';
    if (typeof salary === 'object' && salary.min && salary.max) {
        const userCountry = userStore.currentUser?.country?.toLowerCase() || 'us';
        const currency = salary.currency || (userCountry === 'ng' ? 'NGN' : userCountry === 'uk' ? 'GBP' : 'USD');
        const formatter = new Intl.NumberFormat(userCountry === 'ng' ? 'en-NG' : 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return `${formatter.format(salary.min)} - ${formatter.format(salary.max)} / ${salary.period || 'year'}`;
    }
    return 'Information not available';
};

// Image handling
const imageError = ref(false);
const fallbackImages = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800'
];

const getCareerImage = (careerItem) => {
    if (imageError.value) {
        return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    }
    if (careerItem?.image) return careerItem.image;
    const searchQuery = encodeURIComponent(careerItem?.title || 'career');
    return `https://source.unsplash.com/featured/800x600?${searchQuery}`;
};

const handleImageError = (event) => {
    imageError.value = true;
    event.target.src = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
};

// Load career data from multiple sources
const loadCareer = async () => {
    loading.value = true;
    error.value = null;
    
    const slug = route.params.slug;
    const userCountry = userStore.currentUser?.country?.toLowerCase() || 'us';
    
    console.log(`🔍 Looking for career with slug: "${slug}" in ${userCountry}`);
    
    try {
        let foundCareer = null;
        let allCareers = [];
        
        // FIRST: Try to load from quizStore careers (most recent AI-generated)
        const storeCareers = quizStore.careers;
        console.log(`📦 Checking quizStore careers: ${storeCareers?.length || 0} careers`);
        
        if (storeCareers && storeCareers.length > 0) {
            foundCareer = storeCareers.find(c => c.slug === slug);
            if (foundCareer) {
                console.log('✅ Career found in quizStore');
            }
        }
        
        // SECOND: Try to load from country-specific localStorage
        if (!foundCareer) {
            const cachedCareers = localStorage.getItem(`cached_careers_${userCountry}`);
            if (cachedCareers) {
                const parsedCareers = JSON.parse(cachedCareers);
                console.log(`📦 Found ${parsedCareers.length} careers in country-specific localStorage`);
                foundCareer = parsedCareers.find(c => c.slug === slug);
                if (foundCareer) {
                    console.log('✅ Career found in country-specific localStorage');
                }
            }
        }
        
        // THIRD: Try to load from generic localStorage cache
        if (!foundCareer) {
            const cachedCareers = localStorage.getItem('cached_careers');
            if (cachedCareers) {
                const parsedCareers = JSON.parse(cachedCareers);
                console.log(`📦 Found ${parsedCareers.length} careers in generic localStorage`);
                foundCareer = parsedCareers.find(c => c.slug === slug);
                if (foundCareer) {
                    console.log('✅ Career found in generic localStorage');
                }
            }
        }
        
        // FOURTH: Try to load from json-server
        if (!foundCareer) {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                console.log(`🌐 Fetching from json-server: ${apiUrl}/careers`);
                const response = await fetch(`${apiUrl}/careers`);
                if (response.ok) {
                    allCareers = await response.json();
                    console.log(`📦 Found ${allCareers.length} careers in json-server`);
                    foundCareer = allCareers.find(c => c.slug === slug);
                    if (foundCareer) {
                        console.log('✅ Career found in json-server');
                    }
                } else {
                    console.log(`⚠️ json-server responded with status: ${response.status}`);
                }
            } catch (err) {
                console.log('⚠️ json-server not available:', err.message);
            }
        }
        
        // FIFTH: Check if there are any careers at all and show first one as fallback
        if (!foundCareer) {
            // Try to get any career from localStorage to show
            const anyCareers = localStorage.getItem('cached_careers');
            if (anyCareers) {
                const parsed = JSON.parse(anyCareers);
                if (parsed && parsed.length > 0) {
                    console.log(`📦 No matching slug found. Available slugs: ${parsed.map(c => c.slug).join(', ')}`);
                    error.value = `Career "${slug}" not found. Available careers: ${parsed.map(c => c.title).join(', ')}`;
                } else {
                    error.value = 'Career not found. Please complete the quiz first.';
                }
            } else {
                error.value = 'Career not found. Please complete the quiz first.';
            }
        } else {
            career.value = foundCareer;
            console.log('✅ Career loaded successfully:', foundCareer.title);
        }
        
    } catch (err) {
        console.error('Error loading career:', err);
        error.value = 'Failed to load career details. Please try again.';
    } finally {
        loading.value = false;
    }
};

// Watch for country changes - reload career from cache/json-server
watch(() => userStore.currentUser?.country, async () => {
    if (career.value) {
        console.log(`Country changed, reloading career...`);
        await loadCareer();
    }
});

// Watch for route param changes
watch(() => route.params.slug, async () => {
    await loadCareer();
});

onMounted(async () => {
    await userStore.fetchCurrentUser();
    await loadCareer();
});
</script>

<template>
    <section class="pt-28 pb-20 px-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20">
            <div class="inline-block">
                <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            </div>
            <p class="text-gray-600">Loading career details...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <p class="text-yellow-800">⚠️ {{ error }}</p>
                <button 
                    @click="$router.push('/results')" 
                    class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg mr-2"
                >
                    View My Results
                </button>
                <button 
                    @click="$router.push('/quiz')" 
                    class="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg"
                >
                    Take Quiz
                </button>
            </div>
        </div>

        <!-- Career Details -->
        <div class="max-w-6xl mx-auto" v-else-if="career">
            <!-- Hero Section -->
            <div class="grid lg:grid-cols-2 gap-12 items-start mb-16">
                <div>
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-6xl">{{ career.icon || getIconForCareer(career.title) }}</span>
                        <h1 class="text-5xl font-bold">{{ career.title }}</h1>
                    </div>
                    <p class="text-xl text-gray-600 mb-6">{{ career.shortDescription || career.description?.substring(0, 200) }}</p>
                    
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm mb-4">
                        🌍 Available in {{ userStore.currentUser?.country || 'International' }}
                    </div>
                    
                    <div class="bg-indigo-50 rounded-2xl p-6">
                        <h2 class="font-bold mb-2">Salary Range ({{ userStore.currentUser?.country || 'International' }})</h2>
                        <p class="text-indigo-700 text-2xl font-bold">
                            {{ formatSalary(career.salary) }}
                        </p>
                        <p class="text-sm text-gray-500 mt-2">Annual (Per Year)</p>
                    </div>
                </div>
                <img 
                    :src="getCareerImage(career)" 
                    :alt="career.title"
                    class="w-full h-96 object-cover rounded-2xl shadow-lg"
                    @error="handleImageError"
                />
            </div>

            <!-- Full Description -->
            <div class="bg-white border rounded-3xl p-8 mb-8">
                <h2 class="text-2xl font-bold mb-4">📖 Career Overview</h2>
                <p class="text-gray-700 leading-relaxed">{{ career.description || 'No description available.' }}</p>
            </div>

            <!-- Key Skills -->
            <div class="bg-white border rounded-3xl p-8 mb-8">
                <h2 class="text-2xl font-bold mb-4">⚡ Key Skills Required</h2>
                <div class="flex flex-wrap gap-2">
                    <span v-for="skill in (career.skills || [])" :key="skill" 
                          class="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                        {{ skill }}
                    </span>
                </div>
            </div>

            <!-- Educational Requirements -->
            <div class="bg-white border rounded-3xl p-8 mb-8">
                <h2 class="text-2xl font-bold mb-4">📚 Educational Requirements ({{ userStore.currentUser?.country || 'International' }})</h2>
                
                <div class="mb-6" v-if="career.requirements">
                    <h3 class="font-semibold text-lg mb-2">{{ career.requirements.examSystem || 'Standardized Tests' }}</h3>
                    <p class="text-gray-600 mb-3">{{ career.requirements.examDescription || 'Standard entrance examination requirements' }}</p>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="subject in (career.requirements.examSubjects || [])" :key="subject" 
                              class="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-blue-50 text-blue-700">
                            {{ subject }}
                        </span>
                    </div>
                </div>
                
                <div class="mb-6" v-if="career.requirements?.jambSubjects?.length">
                    <h3 class="font-semibold text-lg mb-2">JAMB Subject Combination</h3>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="subject in career.requirements.jambSubjects" :key="subject" 
                              class="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-green-50 text-green-700">
                            {{ subject }}
                        </span>
                    </div>
                </div>
                
                <div v-if="career.requirements?.additionalTests?.length">
                    <h3 class="font-semibold text-lg mb-2">Additional Tests</h3>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="test in career.requirements.additionalTests" :key="test" 
                              class="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-orange-50 text-orange-700">
                            {{ test }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- University Degrees -->
            <div class="bg-white border rounded-3xl p-8 mb-8" v-if="career.degrees?.length">
                <h2 class="text-2xl font-bold mb-4">🎓 Typical University Degrees</h2>
                <div class="flex flex-wrap gap-2">
                    <span v-for="degree in career.degrees" :key="degree" 
                          class="px-4 py-2 rounded-lg bg-green-50 text-green-700 font-medium">
                        {{ degree }}
                    </span>
                </div>
            </div>

            <!-- Top Universities -->
            <div class="bg-white border rounded-3xl p-8 mb-8" v-if="career.universities?.length">
                <h2 class="text-2xl font-bold mb-4">🏛️ Top Universities ({{ userStore.currentUser?.country || 'International' }})</h2>
                <div class="grid md:grid-cols-2 gap-4">
                    <div v-for="uni in career.universities" :key="uni.name" class="p-4 border rounded-xl hover:shadow-md transition">
                        <h3 class="font-bold text-indigo-600">{{ uni.name }}</h3>
                        <p class="text-sm text-gray-500">{{ uni.ranking }}</p>
                        <p class="text-sm mt-1 text-gray-700">{{ uni.programName }}</p>
                    </div>
                </div>
            </div>

            <!-- Related Careers -->
            <div class="bg-white border rounded-3xl p-8 mb-8" v-if="career.relatedCareers?.length">
                <h2 class="text-2xl font-bold mb-4">🔗 Related Careers</h2>
                <div class="flex flex-wrap gap-3">
                    <span v-for="related in career.relatedCareers" :key="related" 
                          class="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                          @click="$router.push(`/explore/${related.toLowerCase().replace(/\s+/g, '-')}`)">
                        {{ related }}
                    </span>
                </div>
            </div>

            <!-- Career Pathway -->
            <div class="bg-white border rounded-3xl p-8" v-if="career.pathway?.length">
                <h2 class="text-2xl font-bold mb-6">🗺️ Career Pathway Roadmap</h2>
                <div class="space-y-4">
                    <div v-for="step in career.pathway" :key="step.step" class="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <div class="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                            {{ step.step }}
                        </div>
                        <div>
                            <h3 class="font-bold text-lg">{{ step.title }}</h3>
                            <p class="text-sm text-indigo-600 mb-1">{{ step.duration || step.age }}</p>
                            <p class="text-gray-600">{{ step.description }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Back Button -->
            <div class="mt-8 text-center">
                <button 
                    @click="$router.back()" 
                    class="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all"
                >
                    ← Back to Results
                </button>
            </div>
        </div>
    </section>
</template>
