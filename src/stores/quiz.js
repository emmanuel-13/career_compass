<script setup>
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/users";
import { useQuizStore } from "@/stores/quiz";
import { ref, onMounted, watch, computed } from "vue";

const route = useRoute();
const userStore = useUserStore();
const quizStore = useQuizStore();

const career = ref(null);
const loading = ref(true);
const error = ref(null);

// ==============================
// COUNTRY-SPECIFIC REQUIREMENTS
// ==============================

// Get country-specific exam requirements
const getCountryExamRequirements = (country, careerTitle) => {
    const countryLower = country?.toLowerCase() || 'us';
    const title = careerTitle?.toLowerCase() || '';
    
    // Determine career field for subject mapping
    let careerField = 'general';
    if (title.includes('engineer') || title.includes('engineering') || title.includes('civil') || title.includes('mechanical') || title.includes('electrical')) {
        careerField = 'engineering';
    } else if (title.includes('doctor') || title.includes('medical') || title.includes('physician') || title.includes('nurse') || title.includes('dentist') || title.includes('biomedical')) {
        careerField = 'medical';
    } else if (title.includes('lawyer') || title.includes('attorney') || title.includes('social') || title.includes('counselor') || title.includes('psychologist')) {
        careerField = 'social';
    } else if (title.includes('business') || title.includes('manager') || title.includes('accountant') || title.includes('finance') || title.includes('marketing')) {
        careerField = 'business';
    } else if (title.includes('designer') || title.includes('artist') || title.includes('writer') || title.includes('journalist')) {
        careerField = 'arts';
    }
    
    const requirements = {
        'ng': {
            examSystem: 'WAEC/NECO',
            examDescription: 'West African Senior School Certificate Examination (WASSCE) or NECO',
            additionalTests: ['Post-UTME (varies by university)'],
            currency: 'NGN',
            currencySymbol: '₦',
            examSubjects: {
                engineering: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
                medical: ['English Language', 'Mathematics', 'Biology', 'Chemistry'],
                social: ['English Language', 'Government', 'Economics', 'Literature'],
                business: ['English Language', 'Mathematics', 'Economics', 'Accounting'],
                arts: ['English Language', 'Literature', 'Government', 'Economics'],
                general: ['English Language', 'Mathematics', 'Government', 'Economics']
            },
            jambSubjects: {
                engineering: ['English', 'Mathematics', 'Physics', 'Chemistry'],
                medical: ['English', 'Biology', 'Chemistry', 'Physics'],
                social: ['English', 'Government', 'Economics', 'Literature'],
                business: ['English', 'Mathematics', 'Economics', 'Accounting'],
                arts: ['English', 'Literature', 'Government', 'Economics'],
                general: ['English', 'Mathematics', 'Government', 'Economics']
            },
            universities: {
                engineering: ['University of Lagos', 'Obafemi Awolowo University', 'University of Ibadan', 'Ahmadu Bello University', 'Federal University of Technology Minna'],
                medical: ['University of Lagos', 'University of Ibadan', 'Obafemi Awolowo University', 'Ahmadu Bello University', 'University of Nigeria Nsukka'],
                social: ['University of Lagos', 'Obafemi Awolowo University', 'University of Ibadan', 'University of Nigeria Nsukka'],
                business: ['University of Lagos', 'Obafemi Awolowo University', 'Pan-Atlantic University', 'University of Ibadan'],
                arts: ['University of Lagos', 'Obafemi Awolowo University', 'University of Ibadan', 'Ahmadu Bello University'],
                general: ['University of Lagos', 'Obafemi Awolowo University', 'University of Ibadan']
            }
        },
        'us': {
            examSystem: 'SAT/ACT',
            examDescription: 'Scholastic Assessment Test (SAT) or American College Testing (ACT)',
            additionalTests: ['TOEFL/IELTS (for international students)'],
            currency: 'USD',
            currencySymbol: '$',
            examSubjects: {
                engineering: ['English', 'Mathematics', 'Physics', 'Chemistry', 'SAT Subject Test'],
                medical: ['English', 'Biology', 'Chemistry', 'Mathematics', 'SAT Subject Test'],
                social: ['English', 'Government', 'History', 'Economics', 'SAT Subject Test'],
                business: ['English', 'Mathematics', 'Economics', 'Accounting', 'SAT Subject Test'],
                arts: ['English', 'Literature', 'History', 'Arts', 'SAT Subject Test'],
                general: ['English', 'Mathematics', 'Science', 'Optional Essay']
            },
            jambSubjects: [],
            universities: {
                engineering: ['MIT', 'Stanford University', 'UC Berkeley', 'Caltech', 'Georgia Tech'],
                medical: ['Harvard University', 'Johns Hopkins University', 'Stanford University', 'Mayo Clinic', 'UCSF'],
                social: ['Harvard University', 'Yale University', 'Stanford University', 'UC Berkeley', 'University of Chicago'],
                business: ['Harvard Business School', 'Stanford GSB', 'Wharton', 'MIT Sloan', 'Chicago Booth'],
                arts: ['Rhode Island School of Design', 'Yale University', 'Juilliard School', 'USC', 'NYU'],
                general: ['Harvard University', 'Stanford University', 'MIT', 'UC Berkeley', 'Columbia University']
            }
        },
        'uk': {
            examSystem: 'A-Levels',
            examDescription: 'General Certificate of Education Advanced Level (A-Levels)',
            additionalTests: ['IELTS/TOEFL for international students'],
            currency: 'GBP',
            currencySymbol: '£',
            examSubjects: {
                engineering: ['Mathematics', 'Physics', 'Chemistry', 'Further Mathematics'],
                medical: ['Biology', 'Chemistry', 'Mathematics', 'Physics'],
                social: ['English', 'Government', 'History', 'Law'],
                business: ['Mathematics', 'Economics', 'Business Studies', 'Accounting'],
                arts: ['English Literature', 'Art', 'History', 'Media Studies'],
                general: ['3-4 subjects related to career field']
            },
            jambSubjects: [],
            universities: {
                engineering: ['University of Cambridge', 'Imperial College London', 'University of Oxford', 'University of Manchester', 'University of Bristol'],
                medical: ['University of Oxford', 'University of Cambridge', 'Imperial College London', 'UCL', 'King\'s College London'],
                social: ['London School of Economics', 'University of Oxford', 'University of Cambridge', 'UCL', 'University of Edinburgh'],
                business: ['London Business School', 'University of Oxford', 'University of Cambridge', 'Warwick Business School', 'LSE'],
                arts: ['Royal College of Art', 'University of the Arts London', 'University of Oxford', 'University of Cambridge', 'University of Edinburgh'],
                general: ['University of Oxford', 'University of Cambridge', 'Imperial College London', 'UCL', 'LSE']
            }
        }
    };
    
    const countryData = requirements[countryLower] || requirements['us'];
    const careerFieldKey = careerField;
    
    return {
        examSystem: countryData.examSystem,
        examDescription: countryData.examDescription,
        examSubjects: countryData.examSubjects[careerFieldKey] || countryData.examSubjects.general,
        jambSubjects: countryData.jambSubjects?.[careerFieldKey] || countryData.jambSubjects?.general || [],
        additionalTests: countryData.additionalTests,
        currency: countryData.currency,
        currencySymbol: countryData.currencySymbol,
        universities: countryData.universities[careerFieldKey] || countryData.universities.general
    };
};

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

// Format salary with country-specific currency
const formatSalary = (salary) => {
    if (!salary) return 'Information not available';
    
    const userCountry = userStore.currentUser?.country?.toLowerCase() || 'us';
    const countryRequirements = getCountryExamRequirements(userCountry, career.value?.title);
    
    if (typeof salary === 'object' && salary.min && salary.max) {
        const formatter = new Intl.NumberFormat(userCountry === 'ng' ? 'en-NG' : userCountry === 'uk' ? 'en-GB' : 'en-US', {
            style: 'currency',
            currency: countryRequirements.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return `${formatter.format(salary.min)} - ${formatter.format(salary.max)} / ${salary.period || 'year'}`;
    }
    return 'Information not available';
};

// Get country-specific requirements for display
const countryRequirements = computed(() => {
    if (!career.value) return null;
    const userCountry = userStore.currentUser?.country?.toLowerCase() || 'us';
    return getCountryExamRequirements(userCountry, career.value.title);
});

// Get country-specific universities
const countryUniversities = computed(() => {
    if (!countryRequirements.value) return [];
    return countryRequirements.value.universities.map((uni, index) => ({
        name: uni,
        ranking: index === 0 ? 'Top Ranked' : index === 1 ? 'Highly Ranked' : 'Leading University',
        programName: `${career.value?.title || 'Relevant'} Degree`
    }));
});

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
        
        // FIRST: Try to load from quizStore careers (most recent AI-generated)
        const storeCareers = quizStore.careers;
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
                const response = await fetch(`${apiUrl}/careers`);
                if (response.ok) {
                    const allCareers = await response.json();
                    foundCareer = allCareers.find(c => c.slug === slug);
                    if (foundCareer) {
                        console.log('✅ Career found in json-server');
                    }
                }
            } catch (err) {
                console.log('⚠️ json-server not available:', err.message);
            }
        }
        
        if (foundCareer) {
            // Enhance career with country-specific data
            career.value = {
                ...foundCareer,
                countryRequirements: countryRequirements.value,
                countryUniversities: countryUniversities.value
            };
            console.log('✅ Career loaded successfully:', foundCareer.title);
        } else {
            error.value = 'Career not found. Please complete the quiz first.';
        }
        
    } catch (err) {
        console.error('Error loading career:', err);
        error.value = 'Failed to load career details. Please try again.';
    } finally {
        loading.value = false;
    }
};

// Watch for country changes - reload career with new country data
watch(() => userStore.currentUser?.country, async () => {
    if (career.value) {
        console.log(`Country changed, reloading career with new country data...`);
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

            <!-- Educational Requirements - Country Specific -->
            <div class="bg-white border rounded-3xl p-8 mb-8">
                <h2 class="text-2xl font-bold mb-4">📚 Educational Requirements ({{ userStore.currentUser?.country || 'International' }})</h2>
                
                <!-- Exam System -->
                <div class="mb-6">
                    <h3 class="font-semibold text-lg mb-2">{{ countryRequirements?.examSystem || 'Standardized Tests' }}</h3>
                    <p class="text-gray-600 mb-3">{{ countryRequirements?.examDescription || 'Standard entrance examination requirements' }}</p>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="subject in (countryRequirements?.examSubjects || [])" :key="subject" 
                              class="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-blue-50 text-blue-700">
                            {{ subject }}
                        </span>
                    </div>
                </div>
                
                <!-- JAMB Subjects (Nigeria only) -->
                <div class="mb-6" v-if="countryRequirements?.jambSubjects?.length">
                    <h3 class="font-semibold text-lg mb-2">JAMB Subject Combination</h3>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="subject in countryRequirements.jambSubjects" :key="subject" 
                              class="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-green-50 text-green-700">
                            {{ subject }}
                        </span>
                    </div>
                </div>
                
                <!-- Additional Tests -->
                <div v-if="countryRequirements?.additionalTests?.length">
                    <h3 class="font-semibold text-lg mb-2">Additional Tests</h3>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="test in countryRequirements.additionalTests" :key="test" 
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

            <!-- Top Universities - Country Specific -->
            <div class="bg-white border rounded-3xl p-8 mb-8">
                <h2 class="text-2xl font-bold mb-4">🏛️ Top Universities ({{ userStore.currentUser?.country || 'International' }})</h2>
                <div class="grid md:grid-cols-2 gap-4">
                    <div v-for="uni in countryUniversities" :key="uni.name" class="p-4 border rounded-xl hover:shadow-md transition">
                        <h3 class="font-bold text-indigo-600">{{ uni.name }}</h3>
                        <p class="text-sm text-gray-500">{{ uni.ranking }}</p>
                        <p class="text-sm text-gray-700">{{ uni.programName }}</p>
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

explore details



import { defineStore } from "pinia";
import { ref } from "vue";

export const useQuizStore = defineStore("quiz", () => {

    // =========================
    // STATE
    // =========================

    const answers = ref([]);
    const careers = ref([]);
    const personalityScores = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const quizCompleted = ref(false);

    // API URL for json-server
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/careers`;

    // =========================
    // SAVE ANSWER
    // =========================

    const saveAnswer = (questionId, option) => {
        const existing = answers.value.find(item => item.questionId === questionId);
        if (existing) {
            existing.option = option;
        } else {
            answers.value.push({ questionId, option });
        }
        quizCompleted.value = false;
        saveToLocalStorage();
    };

    // =========================
    // GET ANSWER
    // =========================

    const getAnswer = (questionId) => {
        return answers.value.find(item => item.questionId === questionId);
    };

    // =========================
    // LOCAL STORAGE
    // =========================

    const saveToLocalStorage = () => {
        localStorage.setItem('quiz_answers', JSON.stringify(answers.value));
    };

    const loadFromLocalStorage = () => {
        const saved = localStorage.getItem('quiz_answers');
        if (saved) {
            answers.value = JSON.parse(saved);
        }
    };

    const clearLocalStorage = () => {
        localStorage.removeItem('quiz_answers');
        localStorage.removeItem('quiz_completed');
    };

    // =========================
    // SAVE CAREERS TO LOCAL STORAGE
    // =========================

    const saveCareersToLocalStorage = () => {
        if (careers.value.length === 0) return;
        
        if (careers.value[0]?.country) {
            const countryKey = careers.value[0].country.toLowerCase();
            localStorage.setItem(`cached_careers_${countryKey}`, JSON.stringify(careers.value));
            console.log(`💾 Saved ${careers.value.length} careers for ${countryKey} to localStorage`);
        }
        localStorage.setItem('cached_careers', JSON.stringify(careers.value));
    };

    const loadCareersFromLocalStorage = (country) => {
        if (country) {
            const countryKey = country.toLowerCase();
            const saved = localStorage.getItem(`cached_careers_${countryKey}`);
            if (saved) {
                const savedCareers = JSON.parse(saved);
                if (savedCareers && savedCareers.length > 0) {
                    careers.value = savedCareers;
                    console.log(`✅ Loaded ${savedCareers.length} careers for ${countryKey} from localStorage`);
                    return true;
                }
            }
        }
        
        const saved = localStorage.getItem('cached_careers');
        if (saved) {
            const savedCareers = JSON.parse(saved);
            if (savedCareers && savedCareers.length > 0) {
                careers.value = savedCareers;
                console.log(`✅ Loaded ${savedCareers.length} careers from generic localStorage`);
                return true;
            }
        }
        return false;
    };

    // =========================
    // SAVE CAREERS TO JSON-SERVER (FIXED - for Explore page)
    // =========================

    const saveCareersToJsonServer = async (newCareers) => {
        if (!newCareers || newCareers.length === 0) return;
        
        try {
            // Save each career to json-server
            for (const career of newCareers) {
                // Create a clean copy without circular references
                const careerToSave = {
                    id: career.id || Date.now() + Math.random(),
                    slug: career.slug,
                    title: career.title,
                    icon: career.icon,
                    shortDescription: career.shortDescription || "",
                    description: career.description,
                    skills: career.skills || [],
                    personalityType: career.personalityType,
                    country: career.country,
                    match: career.match || 85,
                    aiGenerated: career.aiGenerated || true,
                    requirements: career.requirements || null,
                    universities: career.universities || [],
                    salary: career.salary || null,
                    relatedCareers: career.relatedCareers || [],
                    pathway: career.pathway || []
                };
                
                // Check if career already exists
                const checkResponse = await fetch(`${apiUrl}?slug=${career.slug}`);
                if (checkResponse.ok) {
                    const existing = await checkResponse.json();
                    if (existing.length === 0) {
                        const saveResponse = await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(careerToSave)
                        });
                        if (saveResponse.ok) {
                            console.log(`✅ Saved to json-server: ${career.title}`);
                        } else {
                            console.log(`⚠️ Failed to save ${career.title} to json-server: ${saveResponse.status}`);
                        }
                    } else {
                        console.log(`📌 Career already exists in json-server: ${career.title}`);
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ json-server not available:', error.message);
        }
    };

    // =========================
    // HELPER: GET COUNTRY-SPECIFIC REQUIREMENTS
    // =========================

    const getCountryRequirements = (country) => {
        const countryLower = country?.toLowerCase() || 'us';
        
        const requirements = {
            'nigeria': {
                examSystem: 'WAEC/NECO',
                examSubjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
                jambSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry'],
                examDescription: 'West African Senior School Certificate Examination (WASSCE) or NECO',
                additionalTests: ['Post-UTME (varies by university)'],
                currency: 'NGN',
                currencySymbol: '₦',
                salaryRange: { min: 1800000, max: 4200000 }
            },
            'ng': {
                examSystem: 'WAEC/NECO',
                examSubjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
                jambSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry'],
                examDescription: 'West African Senior School Certificate Examination (WASSCE) or NECO',
                additionalTests: ['Post-UTME (varies by university)'],
                currency: 'NGN',
                currencySymbol: '₦',
                salaryRange: { min: 1800000, max: 4200000 }
            },
            'us': {
                examSystem: 'SAT/ACT',
                examSubjects: ['English', 'Mathematics', 'Science', 'Optional Essay'],
                jambSubjects: [],
                examDescription: 'Scholastic Assessment Test (SAT) or American College Testing (ACT)',
                additionalTests: ['TOEFL/IELTS (for international students)'],
                currency: 'USD',
                currencySymbol: '$',
                salaryRange: { min: 45000, max: 85000 }
            },
            'uk': {
                examSystem: 'A-Levels',
                examSubjects: ['3-4 subjects related to career field'],
                jambSubjects: [],
                examDescription: 'General Certificate of Education Advanced Level (A-Levels)',
                additionalTests: ['IELTS/TOEFL for international students'],
                currency: 'GBP',
                currencySymbol: '£',
                salaryRange: { min: 25000, max: 55000 }
            }
        };
        
        return requirements[countryLower] || requirements['us'];
    };

    // =========================
    // GET ICON FOR CAREER
    // =========================
    
    const getIconForCareer = (title) => {
        if (!title) return '💼';
        const t = title.toLowerCase();
        
        if (t.includes('software') || t.includes('developer')) return '💻';
        if (t.includes('engineer')) return '🔧';
        if (t.includes('data')) return '📊';
        if (t.includes('doctor') || t.includes('medical')) return '👨‍⚕️';
        if (t.includes('nurse')) return '🩺';
        if (t.includes('social') || t.includes('counselor')) return '🤝';
        if (t.includes('lawyer')) return '⚖️';
        if (t.includes('teacher')) return '📚';
        if (t.includes('business') || t.includes('manager')) return '📋';
        if (t.includes('designer')) return '🎨';
        if (t.includes('writer')) return '✍️';
        return '🎯';
    };

    // =========================
    // FALLBACK CAREERS
    // =========================

    const getFallbackCareers = (country, personality) => {
        const countryLower = country?.toLowerCase() === 'nigeria' || country?.toLowerCase() === 'ng' ? 'nigeria' : 'us';
        const personalityLower = personality?.toLowerCase() || '';
        
        let personalityKey = 'technical innovator';
        if (personalityLower.includes('creative')) personalityKey = 'creative communicator';
        else if (personalityLower.includes('healthcare') || personalityLower.includes('helper')) personalityKey = 'healthcare helper';
        else if (personalityLower.includes('business') || personalityLower.includes('leader')) personalityKey = 'business leader';
        
        const fallbacks = {
            'us': {
                'technical innovator': [
                    { id: 1, title: 'Software Engineer', slug: 'software-engineer', icon: '💻', shortDescription: 'Build and maintain software applications', description: 'Software engineers design, develop, and test software applications that power modern businesses.', skills: ['Programming', 'Problem Solving', 'Debugging'], match: 85, aiGenerated: true, country: 'us' },
                    { id: 2, title: 'Data Scientist', slug: 'data-scientist', icon: '📊', shortDescription: 'Analyze complex data to drive decisions', description: 'Data scientists use statistical methods and machine learning to extract insights from data.', skills: ['Python', 'Statistics', 'Machine Learning'], match: 85, aiGenerated: true, country: 'us' },
                    { id: 3, title: 'Cybersecurity Analyst', slug: 'cybersecurity-analyst', icon: '🔒', shortDescription: 'Protect systems from cyber threats', description: 'Cybersecurity analysts protect organizations from digital attacks.', skills: ['Network Security', 'Risk Assessment', 'Incident Response'], match: 85, aiGenerated: true, country: 'us' }
                ],
                'creative communicator': [
                    { id: 1, title: 'Content Writer', slug: 'content-writer', icon: '✍️', shortDescription: 'Create engaging content for brands', description: 'Content writers produce articles, blogs, and social media content.', skills: ['Writing', 'SEO', 'Research'], match: 85, aiGenerated: true, country: 'us' },
                    { id: 2, title: 'Graphic Designer', slug: 'graphic-designer', icon: '🎨', shortDescription: 'Design visual content for brands', description: 'Graphic designers create visual concepts using software.', skills: ['Adobe Suite', 'Typography', 'Color Theory'], match: 85, aiGenerated: true, country: 'us' },
                    { id: 3, title: 'Marketing Specialist', slug: 'marketing-specialist', icon: '📈', shortDescription: 'Develop marketing campaigns', description: 'Marketing specialists create strategies to promote products.', skills: ['Digital Marketing', 'Analytics', 'Strategy'], match: 85, aiGenerated: true, country: 'us' }
                ],
                'healthcare helper': [
                    { id: 1, title: 'Registered Nurse', slug: 'registered-nurse', icon: '🩺', shortDescription: 'Provide patient care', description: 'Nurses care for patients in hospitals and clinics.', skills: ['Patient Care', 'Empathy', 'Medical Knowledge'], match: 85, aiGenerated: true, country: 'us' },
                    { id: 2, title: 'Medical Assistant', slug: 'medical-assistant', icon: '👨‍⚕️', shortDescription: 'Support healthcare professionals', description: 'Medical assistants perform clinical and administrative tasks.', skills: ['Patient Care', 'Medical Terminology', 'Organization'], match: 85, aiGenerated: true, country: 'us' }
                ],
                'business leader': [
                    { id: 1, title: 'Project Manager', slug: 'project-manager', icon: '📋', shortDescription: 'Lead projects to success', description: 'Project managers plan, execute, and close projects.', skills: ['Leadership', 'Planning', 'Communication'], match: 85, aiGenerated: true, country: 'us' },
                    { id: 2, title: 'Financial Analyst', slug: 'financial-analyst', icon: '💰', shortDescription: 'Analyze financial data', description: 'Financial analysts evaluate investment opportunities.', skills: ['Excel', 'Financial Modeling', 'Analysis'], match: 85, aiGenerated: true, country: 'us' }
                ]
            },
            'nigeria': {
                'technical innovator': [
                    { id: 1, title: 'Software Developer', slug: 'software-developer', icon: '💻', shortDescription: 'Build software solutions', description: 'Software developers create applications and systems.', skills: ['Programming', 'Problem Solving', 'Teamwork'], match: 85, aiGenerated: true, country: 'ng' },
                    { id: 2, title: 'Computer Engineer', slug: 'computer-engineer', icon: '🔧', shortDescription: 'Design computer systems', description: 'Computer engineers design computer hardware and software.', skills: ['Hardware', 'Software', 'Systems Design'], match: 85, aiGenerated: true, country: 'ng' }
                ],
                'creative communicator': [
                    { id: 1, title: 'Content Creator', slug: 'content-creator', icon: '✍️', shortDescription: 'Create digital content', description: 'Content creators produce engaging content for social media.', skills: ['Writing', 'Video Editing', 'Creativity'], match: 85, aiGenerated: true, country: 'ng' },
                    { id: 2, title: 'Public Relations Officer', slug: 'public-relations-officer', icon: '📢', shortDescription: 'Manage public image', description: 'PROs manage communication between organizations and the public.', skills: ['Communication', 'Media Relations', 'Writing'], match: 85, aiGenerated: true, country: 'ng' }
                ],
                'healthcare helper': [
                    { id: 1, title: 'Nurse', slug: 'nurse', icon: '🩺', shortDescription: 'Provide patient care', description: 'Nurses provide essential healthcare services.', skills: ['Patient Care', 'Empathy', 'Medical Knowledge'], match: 85, aiGenerated: true, country: 'ng' },
                    { id: 2, title: 'Community Health Worker', slug: 'community-health-worker', icon: '🤝', shortDescription: 'Serve communities', description: 'Community health workers provide health education.', skills: ['Community Engagement', 'Health Education', 'Communication'], match: 85, aiGenerated: true, country: 'ng' }
                ],
                'business leader': [
                    { id: 1, title: 'Business Administrator', slug: 'business-administrator', icon: '📋', shortDescription: 'Manage business operations', description: 'Business administrators oversee daily operations.', skills: ['Management', 'Finance', 'Leadership'], match: 85, aiGenerated: true, country: 'ng' },
                    { id: 2, title: 'Accountant', slug: 'accountant', icon: '💰', shortDescription: 'Manage finances', description: 'Accountants prepare financial records.', skills: ['Accounting', 'Tax', 'Financial Reporting'], match: 85, aiGenerated: true, country: 'ng' }
                ]
            }
        };
        
        return fallbacks[countryLower][personalityKey] || fallbacks[countryLower]['technical innovator'];
    };

    // =========================
    // PERSONALITY SCORES
    // =========================

    const calculatePersonalityScores = () => {
        const personalityTypeScores = {};
        answers.value.forEach(answer => {
            const type = answer.option?.personalityType;
            if (type) {
                personalityTypeScores[type] = (personalityTypeScores[type] || 0) + 1;
            }
        });
        const total = answers.value.length || 1;
        personalityScores.value = Object.entries(personalityTypeScores).map(
            ([name, score]) => ({
                name,
                score: Math.round((score / total) * 100)
            })
        );
    };

    // =========================
    // MAIN GENERATOR
    // =========================

    const generateCareer = async (country, forceRefresh = false) => {
        isLoading.value = true;
        error.value = null;
    
        try {
            const quizJustCompleted = localStorage.getItem('quiz_just_completed') === 'true';
            
            if (forceRefresh || quizJustCompleted) {
                console.log("🤖 Generating NEW careers for", country);
                await generateCareerWithAI(country);
                localStorage.removeItem('quiz_just_completed');
            } else {
                console.log("📦 Loading cached careers for", country);
                const loaded = loadCareersFromLocalStorage(country);
                
                if (!loaded || careers.value.length === 0) {
                    console.log("⚠️ No cache found, generating new careers");
                    await generateCareerWithAI(country);
                } else {
                    calculatePersonalityScores();
                }
            }
    
        } catch (err) {
            console.error("Generation error:", err);
            generateCareerFallback(country);
        } finally {
            isLoading.value = false;
        }
    };

    // =========================
    // AI CAREER GENERATION
    // =========================

    const generateCareerWithAI = async (country) => {
        const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
        
        if (!API_KEY) {
            console.warn("No API key found, using fallback");
            generateCareerFallback(country);
            return;
        }

        const countryLower = country?.toLowerCase() || 'us';
        const config = getCountryRequirements(country);
        
        // Calculate dominant personality
        const personalityCounts = {};
        answers.value.forEach(item => {
            const type = item.option?.personalityType;
            if (type) {
                personalityCounts[type] = (personalityCounts[type] || 0) + 1;
            }
        });
        
        let dominantPersonality = "Technical Innovator";
        let maxCount = 0;
        for (const [type, count] of Object.entries(personalityCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantPersonality = type;
            }
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                    "HTTP-Referer": "https://career-compass-v906.onrender.com",
                    "X-Title": "Career AI Platform"
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: `You are a career expert for ${country.toUpperCase()}. Return ONLY valid JSON.`
                        },
                        { 
                            role: "user", 
                            content: `Recommend 3 careers for a ${dominantPersonality} personality in ${country.toUpperCase()}. Return JSON with: title, slug, shortDescription, description, skills array.` 
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                console.warn(`API Error: ${response.status}, using fallback`);
                generateCareerFallback(country);
                return;
            }

            const data = await response.json();
            let aiText = data.choices[0].message.content;
            
            aiText = aiText.replace(/```json\s*|\s*```/g, '').trim();
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) aiText = jsonMatch[0];
            
            const parsed = JSON.parse(aiText);
            if (!parsed.recommendations) throw new Error("Invalid response");

            const recommendedCareers = parsed.recommendations.slice(0, 3).map((aiCareer, index) => ({
                id: Date.now() + index + Math.random(),
                slug: aiCareer.slug || aiCareer.title?.toLowerCase().replace(/\s+/g, '-') || `career-${index}`,
                title: aiCareer.title || "Career Title",
                icon: getIconForCareer(aiCareer.title),
                shortDescription: aiCareer.shortDescription || "",
                description: aiCareer.description || "No description available",
                skills: aiCareer.skills || [],
                personalityType: dominantPersonality,
                country: countryLower,
                match: 85,
                aiGenerated: true
            }));

            careers.value = recommendedCareers.sort((a, b) => b.match - a.match).slice(0, 3);
            
            // Save to BOTH localStorage AND json-server
            saveCareersToLocalStorage();
            await saveCareersToJsonServer(recommendedCareers);
            
            calculatePersonalityScores();
            console.log("✅ AI careers generated and saved");
            
        } catch (error) {
            console.error("AI error:", error);
            generateCareerFallback(country);
        }
    };

    // =========================
    // FALLBACK SYSTEM
    // =========================

    const generateCareerFallback = (country) => {
        if (loadCareersFromLocalStorage(country)) {
            calculatePersonalityScores();
            console.log('✅ Using cached fallback careers');
            return;
        }
        
        const personalityCounts = {};
        answers.value.forEach(answer => {
            const type = answer.option?.personalityType;
            if (type) {
                personalityCounts[type] = (personalityCounts[type] || 0) + 1;
            }
        });
        
        let dominantPersonality = "Technical Innovator";
        let maxCount = 0;
        for (const [type, count] of Object.entries(personalityCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantPersonality = type;
            }
        }
        
        careers.value = getFallbackCareers(country, dominantPersonality);
        saveCareersToLocalStorage();
        saveCareersToJsonServer(careers.value); // Also save fallbacks to json-server
        calculatePersonalityScores();
        console.log('✅ Using hardcoded fallback careers');
    };

    // =========================
    // MATCH CALCULATOR
    // =========================

    const calculateMatch = (career) => {
        let score = 0;
        answers.value.forEach(answer => {
            if (answer.option?.personalityType === career.personalityType) score += 25;
            answer.option?.traits?.forEach(trait => {
                if (career.traits?.includes(trait)) score += 10;
            });
            answer.option?.interests?.forEach(interest => {
                if (career.interests?.includes(interest)) score += 10;
            });
        });
        return score > 100 ? 100 : score;
    };

    // =========================
    // RESET QUIZ
    // =========================

    const resetQuiz = () => {
        answers.value = [];
        careers.value = [];
        personalityScores.value = [];
        error.value = null;
        quizCompleted.value = false;
        clearLocalStorage();
        
        localStorage.setItem('quiz_just_completed', 'true');
        
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cached_careers_')) {
                localStorage.removeItem(key);
            }
        });
        localStorage.removeItem('cached_careers');
    };

    // =========================
    // INITIALIZE
    // =========================

    const initialize = () => {
        loadFromLocalStorage();
    };

    initialize();

    return {
        answers,
        careers,
        personalityScores,
        isLoading,
        error,
        saveAnswer,
        generateCareer,
        getAnswer,
        resetQuiz,
        initialize
    };
});
