<template>
    
    <div class="pt-24 pb-20 px-6 lg:px-8">

        <!-- Intelligent Recommendation Loading - Shows when generating NEW careers -->
        <div v-if="quizStore.isLoading" class="text-center py-20">

            <div class="inline-block relative mb-6">

                <div class="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>

                <div class="absolute inset-0 flex items-center justify-center text-2xl">
                    🧠
                </div>

            </div>

            <h2 class="text-3xl font-bold text-gray-900 mb-3">
                Building Your Career Intelligence Profile
            </h2>

            <p class="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                Our intelligent recommendation engine is analyzing your personality,
                interests, strengths, career preferences, regional opportunities,
                salary trends, education pathways, and future career growth potential.
            </p>

            <!-- Live Analysis Steps -->
            <div class="max-w-xl mx-auto space-y-3">

                <div
                    v-for="(step, index) in loadingSteps"
                    :key="index"
                    class="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm"
                >

                    <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        :class="
                            currentLoadingStep >= index
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-400'
                        "
                    >
                        {{ currentLoadingStep > index ? '✓' : index + 1 }}
                    </div>

                    <p
                        class="text-sm font-medium"
                        :class="
                            currentLoadingStep >= index
                                ? 'text-gray-800'
                                : 'text-gray-400'
                        "
                    >
                        {{ step }}
                    </p>

                </div>

            </div>

        </div>

        <!-- Loading from cache indicator - Shows when loading cached careers -->
        <div v-else-if="loadingFromCache" class="text-center py-20">
            <div class="inline-block relative mb-6">
                <div class="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center text-xl">
                    📦
                </div>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">
                Loading Your Career Profile
            </h2>
            <p class="text-gray-600">
                Retrieving your personalized career recommendations...
            </p>
        </div>

        <!-- Add error display after loading section -->
        <div v-else-if="quizStore.error" class="text-center py-20">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <p class="text-yellow-800">⚠️ {{ quizStore.error }}</p>
                <button 
                    @click="retryLoad"
                    class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg"
                >
                    Try Again
                </button>
            </div>
        </div>

        <div class="max-w-5xl mx-auto" v-else>

            <!-- HERO -->
            <section>
                <div class="mb-12">
                    <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-5">
                        🏆 Assessment Complete
                    </span>

                    <h1 class="text-4xl font-bold mb-3 text-gray-900 tracking-tight">
                        Your Career Profile
                    </h1>

                    <p class="text-lg text-gray-600">
                        Based on your responses, here's your personalized career analysis.
                    </p>
                </div>
            </section>

            <!-- PERSONALITY -->
            <section>

                <div class="text-card-foreground flex flex-col gap-6 p-8 mb-8 bg-white border border-gray-200 rounded-2xl shadow-sm">

                    <div class="flex items-center gap-2 mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">
                        🏆 Your Career Personality
                        </h2>
                    </div>
                    

                    <div
                        v-for="item in personalityScores"
                        :key="item.name"
                        class="mb-8"
                    >

                        <div class="flex justify-between mb-2">

                            <h3 class="font-semibold text-gray-800">
                                {{ item.name }}
                            </h3>

                            <span class="font-bold text-indigo-600">
                                {{ item.score }}%
                            </span>

                        </div>

                        <div class="w-full h-3 rounded-full bg-gray-100 overflow-hidden">

                            <div
                                class="h-full rounded-full bg-indigo-600"
                                :style="{ width: item.score + '%' }"
                            ></div>

                        </div>

                    </div>

                </div>

            </section>

            <!-- CAREERS - Updated with all sections including Courses -->
            <section class="max-w-7xl mx-auto px-6 pb-10">
                <h2 class="text-3xl font-bold mb-8">Recommended Careers</h2>
                <div class="space-y-8">
                    <div v-for="career in careers" :key="career.id" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        
                        <!-- Career Header -->
                        <div class="p-8 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                            <div class="flex justify-between items-start">
                                <div class="flex gap-5">
                                    <div class="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
                                        <span v-if="career.icon">{{ career.icon }}</span>
                                        <span v-else-if="career.title?.toLowerCase().includes('engineer') || career.title?.toLowerCase().includes('developer')">💻</span>
                                        <span v-else-if="career.title?.toLowerCase().includes('doctor') || career.title?.toLowerCase().includes('medical')">👨‍⚕️</span>
                                        <span v-else-if="career.title?.toLowerCase().includes('social') || career.title?.toLowerCase().includes('counselor')">🤝</span>
                                        <span v-else-if="career.title?.toLowerCase().includes('analyst')">📊</span>
                                        <span v-else-if="career.title?.toLowerCase().includes('security')">🔒</span>
                                        <span v-else-if="career.title?.toLowerCase().includes('manager')">📋</span>
                                        <span v-else>🎯</span>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 class="text-3xl font-bold">{{ career.title }}</h3>
                                            <span v-if="career.match >= 90" class="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700 font-semibold">Top Match</span>

                                            <div class="flex flex-wrap gap-2">

                                                <span
                                                    v-if="career.aiGenerated"
                                                    class="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 font-semibold"
                                                >
                                                    🧠 Intelligent Match
                                                </span>

                                                <span
                                                    class="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 font-semibold"
                                                >
                                                    🎯 Personality Aligned
                                                </span>

                                                <span
                                                    class="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-semibold"
                                                >
                                                    📈 Growth Potential
                                                </span>

                                                <span
                                                    class="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700 font-semibold"
                                                >
                                                    🌍 Region Optimized
                                                </span>

                                            </div>
                                        </div>

                                        <p class="text-gray-700 text-lg">{{ career.shortDescription || career.description?.substring(0, 150) + '...' }}</p>
                                        
                                        <!-- Recommendation Reasons -->
                                        <div
                                            class="mt-4"
                                            v-if="career.reasons && career.reasons.length"
                                        >

                                            <h4 class="text-lg font-bold mb-2">
                                                🧠 Why This Career Matches You
                                            </h4>

                                            <div class="grid md:grid-cols-2 gap-3">

                                                <div
                                                    v-for="reason in career.reasons"
                                                    :key="reason"
                                                    class="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-100"
                                                >

                                                    <div class="text-green-600 text-base">
                                                        ✅
                                                    </div>

                                                    <p class="text-sm text-gray-700 font-medium">
                                                        {{ reason }}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-gray-500 mb-1">Match Score</p>
                                    <h3 class="text-4xl font-bold text-indigo-600">{{ career.match }}%</h3>
                                </div>
                            </div>
                        </div>

                        <!-- Full Description -->
                        <div class="p-8 border-b border-gray-200">
                            <h4 class="text-xl font-bold mb-4">📖 Career Overview</h4>
                            <p class="text-gray-700 leading-relaxed">{{ career.description }}</p>
                        </div>

                        <!-- Key Skills -->
                        <div class="p-8 border-b border-gray-200">
                            <h4 class="text-xl font-bold mb-4">⚡ Key Skills Required</h4>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="skill in career.skills" :key="skill" class="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                                    {{ skill }}
                                </span>
                            </div>
                        </div>

                        <!-- Country-Specific Requirements -->
                        <div class="p-8 border-b border-gray-200" v-if="career.requirements">
                            <h4 class="text-xl font-bold mb-4">📚 Required Qualifications ({{ userStore.currentUser?.country || 'International' }})</h4>
                            
                            <!-- Exam System -->
                            <div class="mb-6">
                                <h5 class="font-semibold text-gray-800 mb-2">{{ career.requirements.examSystem || getExamSystem(userStore.currentUser?.country) }}</h5>
                                <p class="text-sm text-gray-600 mb-3">{{ career.requirements.examDescription }}</p>
                                <div class="flex flex-wrap gap-2">
                                    <span v-for="subject in career.requirements.examSubjects" :key="subject" 
                                        class="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-blue-50 text-blue-700">
                                        {{ subject }}
                                    </span>
                                </div>
                            </div>
                            
                            <!-- JAMB Subjects (Nigeria only) -->
                            <div class="mb-6" v-if="career.requirements.jambSubjects && career.requirements.jambSubjects.length">
                                <h5 class="font-semibold text-gray-800 mb-2">JAMB Subject Combination</h5>
                                <div class="flex flex-wrap gap-2">
                                    <span v-for="subject in career.requirements.jambSubjects" :key="subject" 
                                        class="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-green-50 text-green-700">
                                        {{ subject }}
                                    </span>
                                </div>
                            </div>
                            
                            <!-- Additional Tests -->
                            <div v-if="career.requirements.additionalTests && career.requirements.additionalTests.length">
                                <h5 class="font-semibold text-gray-800 mb-2">Additional Tests</h5>
                                <div class="flex flex-wrap gap-2">
                                    <span v-for="test in career.requirements.additionalTests" :key="test" 
                                        class="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-orange-50 text-orange-700">
                                        {{ test }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- University Degrees -->
                        <div class="p-8 border-b border-gray-200" v-if="career.degrees">
                            <h4 class="text-xl font-bold mb-4">🎓 Typical University Degrees</h4>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="degree in career.degrees" :key="degree" class="px-4 py-2 rounded-lg bg-green-50 text-green-700 font-medium">
                                    {{ degree }}
                                </span>
                            </div>
                        </div>

                        <!-- Top Universities -->
                        <div class="p-8 border-b border-gray-200" v-if="career.universities && career.universities.length">
                            <h4 class="text-xl font-bold mb-4">🏛️ Top Universities ({{ userStore.currentUser?.country || 'International' }})</h4>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div v-for="uni in career.universities" :key="uni.name" class="p-4 border border-gray-200 rounded-xl hover:shadow-md transition">
                                    <h5 class="font-bold text-indigo-600">{{ uni.name }}</h5>
                                    <p class="text-sm text-gray-500">{{ uni.ranking }}</p>
                                    <p class="text-sm text-gray-700">{{ uni.programName }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Salary Range - FIXED -->
                        <div class="p-8 border-b border-gray-200" v-if="career.salary">
                            <h4 class="text-xl font-bold mb-4">💰 Salary Range</h4>
                            <div class="bg-gray-50 rounded-xl p-6">
                                <div class="space-y-2">
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">Entry Level:</span>
                                        <span class="font-semibold text-indigo-700">{{ formatSalaryEntry(career.salary) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">Mid Level:</span>
                                        <span class="font-semibold text-indigo-700">{{ formatSalaryMid(career.salary) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">Senior Level:</span>
                                        <span class="font-semibold text-indigo-700">{{ formatSalarySenior(career.salary) }}</span>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-4">*Salaries vary based on experience, skills, location, and industry. Figures show annual salary ranges.</p>
                            </div>
                        </div>

                        <!-- Related Careers -->
                        <div class="p-8 border-b border-gray-200" v-if="career.relatedCareers && career.relatedCareers.length">
                            <h4 class="text-xl font-bold mb-4">🔗 Related Careers</h4>
                            <div class="flex flex-wrap gap-3">
                                <span v-for="related in career.relatedCareers" :key="related" class="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer">
                                    {{ related }}
                                </span>
                            </div>
                        </div>

                        <!-- Career Pathway -->
                        <div class="p-8 border-b border-gray-200" v-if="career.pathway && career.pathway.length">
                            <h4 class="text-xl font-bold mb-6">🗺️ Career Pathway Roadmap</h4>
                            <div class="space-y-4">
                                <div v-for="step in career.pathway" :key="step.step" class="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div class="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                                        {{ step.step }}
                                    </div>
                                    <div>
                                        <h5 class="font-bold text-lg">{{ step.title }}</h5>
                                        <p class="text-sm text-indigo-600 mb-2">{{ step.duration || step.age }}</p>
                                        <p class="text-gray-600">{{ step.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Recommended Courses -->
                        <div class="p-8 border-b border-gray-200">
                            <h4 class="text-xl font-bold mb-4">📚 Recommended Courses to Get Started</h4>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div v-for="course in getRecommendedCourses(career.title)" :key="course.name" class="p-4 border border-gray-200 rounded-xl hover:shadow-md transition hover:border-indigo-300">
                                    <div class="flex items-start gap-3">
                                        <div class="text-2xl flex-shrink-0">📖</div>
                                        <div>
                                            <h5 class="font-bold text-indigo-600">{{ course.name }}</h5>
                                            <p class="text-sm text-gray-500 mb-1">{{ course.platform }}</p>
                                            <p class="text-sm text-gray-600">{{ course.description }}</p>
                                            <a :href="course.url" target="_blank" class="text-xs text-indigo-500 hover:underline mt-1 inline-flex items-center gap-1">
                                                View Course <span>→</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="p-8 bg-gray-50 flex gap-4">
                            <button @click="exploreDetail(career.slug)" class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all">
                                Learn More →
                            </button>
                            <button @click="saveCareer(career)" class="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition-all">
                                📌 Save This Career
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ACTION CARDS -->
            <section>

                <div class="mt-16 grid md:grid-cols-2 gap-8">

                    <!-- Skills -->
                    <div
                        class="text-card-foreground flex flex-col gap-6 p-10 border-0 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-xl transition-all"
                    >

                        <div class="text-5xl mb-6">
                            📚
                        </div>

                        <h3 class="text-2xl font-bold mb-4 text-gray-900">
                            Develop Your Skills
                        </h3>

                        <p class="text-base text-gray-700 mb-8 leading-relaxed">
                            Discover what skills you need to develop for your dream career and start building them today.
                        </p>
                        
                        <button
                            @click="exploreSkills"
                            class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20
                            dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-9 px-4 has-[>svg]:px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full py-5 rounded-xl shadow-md"
                        >
                            Explore Skills
                            >
                        </button>

                    </div>

                    <!-- Retake -->
                    <div
                        class="text-card-foreground flex flex-col gap-6 p-10 border-0 bg-linear-to-br
                    from-purple-50 to-pink-50 
                        rounded-2xl hover:shadow-xl transition-all"
                    >

                        <div class="text-5xl mb-6">
                            🎯
                        </div>

                        <h3 class="text-2xl font-bold mb-4 text-gray-900">
                            Retake the Quiz
                        </h3>

                        <p class="text-base text-gray-700 mb-8 leading-relaxed">
                            Want to explore different options? Take the quiz again to discover more career paths.
                        </p>

                        <button
                            @click="retakeQuiz"
                            class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 
                            [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring 
                            focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive 
                            hover:bg-primary/90 h-9 px-4 has-[>svg]:px-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full 
                            py-5 rounded-xl shadow-md"
                        >
                            Take Quiz Again
                        </button>

                    </div>

                </div>

            </section>
        </div>

    </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useQuizStore } from "@/stores/quiz";
import { useUserStore } from "@/stores/users";
import { computed, onMounted, ref, onUnmounted } from "vue";

const router = useRouter();
const quizStore = useQuizStore();
const userStore = useUserStore();

// ==============================
// INTELLIGENT LOADING SYSTEM
// ==============================

const loadingSteps = ref([
    "Analyzing personality traits...",
    "Matching careers to your strengths...",
    "Checking country-specific requirements...",
    "Comparing salary opportunities...",
    "Finding related career pathways...",
    "Calculating future career growth...",
    "Generating personalized recommendations..."
]);

const currentLoadingStep = ref(0);
const loadingFromCache = ref(true);

let loadingInterval = null;

// ==============================
// SALARY FORMATTING FUNCTIONS - FIXED
// ==============================

const formatSalaryEntry = (salary) => {
    if (!salary) return 'Information not available';
    const userCountry = userStore.currentUser?.country?.toLowerCase() || 'us';
    const currency = salary.currency || (userCountry === 'ng' ? 'NGN' : userCountry === 'uk' ? 'GBP' : 'USD');
    const formatter = new Intl.NumberFormat(userCountry === 'ng' ? 'en-NG' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    const amount = salary.entry || salary.min || 0;
    return formatter.format(amount);
};

const formatSalaryMid = (salary) => {
    if (!salary) return 'Information not available';
    const userCountry = userStore.currentUser?.country?.toLowerCase() || 'us';
    const currency = salary.currency || (userCountry === 'ng' ? 'NGN' : userCountry === 'uk' ? 'GBP' : 'USD');
    const formatter = new Intl.NumberFormat(userCountry === 'ng' ? 'en-NG' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    if (salary.midMin && salary.midMax) {
        return `${formatter.format(salary.midMin)} - ${formatter.format(salary.midMax)}`;
    }
    if (salary.min && salary.max) {
        return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
    }
    return formatter.format(salary.mid || 0);
};

const formatSalarySenior = (salary) => {
    if (!salary) return 'Information not available';
    const userCountry = userStore.currentUser?.country?.toLowerCase() || 'us';
    const currency = salary.currency || (userCountry === 'ng' ? 'NGN' : userCountry === 'uk' ? 'GBP' : 'USD');
    const formatter = new Intl.NumberFormat(userCountry === 'ng' ? 'en-NG' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    const amount = salary.senior || salary.max || 0;
    return formatter.format(amount);
};

// ==============================
// RECOMMENDED COURSES FUNCTION
// ==============================

const getRecommendedCourses = (careerTitle) => {
    const title = careerTitle?.toLowerCase() || '';
    
    const courseMap = {
        'software': [
            { name: 'CS50: Introduction to Computer Science', platform: 'Harvard edX', description: 'Learn programming fundamentals', url: 'https://www.edx.org/course/cs50s-introduction-to-computer-science' },
            { name: 'The Complete Web Developer Bootcamp', platform: 'Udemy', description: 'Become a full-stack web developer', url: 'https://www.udemy.com/course/the-complete-web-developer-bootcamp/' },
            { name: 'Python for Everybody', platform: 'Coursera', description: 'Learn Python programming', url: 'https://www.coursera.org/specializations/python' }
        ],
        'data': [
            { name: 'Google Data Analytics Professional Certificate', platform: 'Coursera', description: 'Learn data analysis with Google', url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
            { name: 'SQL for Data Science', platform: 'UC Davis Coursera', description: 'Master SQL for data analysis', url: 'https://www.coursera.org/learn/sql-for-data-science' }
        ],
        'doctor': [
            { name: 'Human Anatomy and Physiology', platform: 'Coursera', description: 'Understand the human body systems', url: 'https://www.coursera.org/specializations/human-anatomy-physiology' },
            { name: 'Medical Terminology', platform: 'edX', description: 'Learn medical language', url: 'https://www.edx.org/course/medical-terminology' }
        ],
        'business': [
            { name: 'Business Foundations', platform: 'Wharton Coursera', description: 'Learn core business principles', url: 'https://www.coursera.org/specializations/wharton-business-foundations' },
            { name: 'Project Management Professional', platform: 'Google Coursera', description: 'Master project management', url: 'https://www.coursera.org/professional-certificates/google-project-management' }
        ],
        'designer': [
            { name: 'Graphic Design Specialization', platform: 'CalArts Coursera', description: 'Learn graphic design principles', url: 'https://www.coursera.org/specializations/graphic-design' },
            { name: 'UI/UX Design', platform: 'Google Coursera', description: 'Master user interface design', url: 'https://www.coursera.org/professional-certificates/google-ux-design' }
        ],
        'lawyer': [
            { name: 'Introduction to American Law', platform: 'Penn Law Coursera', description: 'Understand legal systems', url: 'https://www.coursera.org/learn/american-law' },
            { name: 'Legal Writing and Research', platform: 'Coursera', description: 'Develop legal writing skills', url: 'https://www.coursera.org/learn/legal-writing-research' }
        ],
        'teacher': [
            { name: 'Foundations of Teaching for Learning', platform: 'Commonwealth Education Trust', description: 'Develop teaching fundamentals', url: 'https://www.coursera.org/specializations/foundations-teaching' },
            { name: 'Learning How to Learn', platform: 'UC San Diego', description: 'Master effective learning techniques', url: 'https://www.coursera.org/learn/learning-how-to-learn' }
        ],
        'default': [
            { name: 'Career Success Specialization', platform: 'UC Irvine Coursera', description: 'Develop essential career skills', url: 'https://www.coursera.org/specializations/career-success' },
            { name: 'Learning How to Learn', platform: 'UC San Diego Coursera', description: 'Master effective learning techniques', url: 'https://www.coursera.org/learn/learning-how-to-learn' },
            { name: 'Communication Skills for Career Success', platform: 'Coursera', description: 'Improve professional communication', url: 'https://www.coursera.org/specializations/communication-skills' }
        ]
    };
    
    for (const [key, courses] of Object.entries(courseMap)) {
        if (title.includes(key)) {
            return courses;
        }
    }
    
    return courseMap.default;
};

const retryLoad = async () => {
    const country = userStore.currentUser?.country;
    if (country) {
        loadingFromCache.value = true;
        await quizStore.generateCareer(country, true);
        loadingFromCache.value = false;
    }
};

onMounted(async () => {
    // Start the loading animation immediately
    loadingFromCache.value = true;
    
    // Animate loading steps
    loadingInterval = setInterval(() => {
        if (currentLoadingStep.value < loadingSteps.value.length - 1) {
            currentLoadingStep.value++;
        }
    }, 1200);

    await userStore.fetchCurrentUser();

    const country = userStore.currentUser?.country;

    if (!country) {
        console.error("User country missing");
        loadingFromCache.value = false;
        return;
    }

    const quizJustCompleted = localStorage.getItem('quiz_just_completed') === 'true';

    if (quizJustCompleted) {
        // Quiz was just taken - show AI loading animation
        console.log("🎯 Quiz just taken - generating recommendations");
        // The store's isLoading will be true during AI generation
        loadingFromCache.value = false;
        await quizStore.generateCareer(country, false);
    } else {
        // Loading from cache - show cache loading animation
        console.log("📦 Loading cached recommendations");
        loadingFromCache.value = true;
        await quizStore.generateCareer(country, true);
        // Small delay to show loading animation
        setTimeout(() => {
            loadingFromCache.value = false;
        }, 500);
    }

    clearInterval(loadingInterval);
});

onUnmounted(() => {
    if (loadingInterval) {
        clearInterval(loadingInterval);
    }
});

const careers = computed(() => quizStore.careers || []);
const personalityScores = computed(() => quizStore.personalityScores || []);

const exploreSkills = () => {
    router.push({name: "explore"});
};

const exploreDetail = (url) => {
    router.push(`/explore/${url}`);
};

const retakeQuiz = () => {
    quizStore.resetQuiz();
    router.push("/quiz");
};

const getExamSystem = (country) => {
    const systems = {
        'ng': 'WAEC/NECO',
        'us': 'SAT/ACT',
        'uk': 'A-Levels',
    };
    return systems[country?.toLowerCase()] || 'High School Diploma';
};

const saveCareer = (career) => {
    const saved = localStorage.getItem('saved_careers');
    const savedCareers = saved ? JSON.parse(saved) : [];
    if (!savedCareers.some(c => c.slug === career.slug)) {
        savedCareers.push(career);
        localStorage.setItem('saved_careers', JSON.stringify(savedCareers));
        alert(`✅ ${career.title} saved to your profile!`);
    } else {
        alert(`📌 ${career.title} is already saved!`);
    }
};
</script>
