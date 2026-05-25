<template>
    
    <div class="pt-24 pb-20 px-6 lg:px-8">

        <!-- <div v-if="quizStore.isLoading" class="text-center py-20">
            <div class="inline-block">
                <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">🤖 OpenRouter AI is analyzing your answers...</h2>
            <p class="text-gray-600">Finding your perfect career match</p>
        </div> -->

        <!-- Intelligent Recommendation Loading -->
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

        <!-- Add error display after loading section -->
        <div v-else-if="quizStore.error" class="text-center py-20">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <p class="text-yellow-800">⚠️ {{ quizStore.error }}</p>
                <button 
                    @click="quizStore.generateCareer(userStore.currentUser?.country)"
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
                        Based on your responses, here’s your personalized career analysis.
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

            <!-- CAREERS
            <section class="max-w-7xl mx-auto px-6 pb-10">

                <h2 class="text-3xl font-bold mb-8">
                    Recommended Careers
                </h2>

                <div class="space-y-6">

                    <div
                        v-for="career in careers"
                        :key="career.id"
                        class="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm"
                    >

                        <div class="flex justify-between gap-6">

                            <div class="flex gap-5">

                                <div class="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl flex-shrink-0">
                                    Show icon if exists, otherwise show emoji based on career
                                    <span v-if="career.icon">{{ career.icon }}</span>
                                    <span v-else-if="career.title.includes('Engineer') || career.title.includes('Developer')">💻</span>
                                    <span v-else-if="career.title.includes('Doctor') || career.title.includes('Medical')">👨‍⚕️</span>
                                    <span v-else-if="career.title.includes('Analyst') || career.title.includes('Security')">🔒</span>
                                    <span v-else-if="career.title.includes('Manager') || career.title.includes('Business')">📊</span>
                                    <span v-else>🎯</span>
                                </div>

                                <div>

                                    <div class="flex items-center gap-3 mb-3">

                                        <h3 class="text-3xl font-bold">
                                            {{ career.title }}
                                        </h3>

                                        <span
                                            v-if="career.match >= 90"
                                            class="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700 font-semibold"
                                        >
                                            Top Match
                                        </span>

                                    </div>

                                    <p class="text-gray-600 mb-5 max-w-3xl">
                                        {{ career.description }}
                                    </p>

                                    <div class="flex flex-wrap gap-2 mb-6">

                                        <span
                                            v-for="skill in career.skills"
                                            :key="skill"
                                            class="px-3 py-1 rounded-lg border border-gray-200 text-sm"
                                        >
                                            {{ skill }}
                                        </span>

                                    </div>

                                    <button
                                        @click="exploreDetail(career.slug)"
                                        class="px-6 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all"
                                    >
                                        Learn More
                                    </button>

                                </div>

                            </div>

                            <div class="text-right">

                                <p class="text-gray-500 mb-1">
                                    Match Score
                                </p>

                                <h3 class="text-4xl font-bold text-indigo-600">
                                    {{ career.match }}%
                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

            </section> -->

            <!-- CAREERS - Updated with all sections -->
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
                                            <!-- <span v-if="career.aiGenerated" class="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 font-semibold">🤖 AI Recommended</span> -->

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
                                            class="p-8 border-b border-gray-200"
                                            v-if="career.reasons && career.reasons.length"
                                        >

                                            <h4 class="text-xl font-bold mb-4">
                                                🧠 Why This Career Matches You
                                            </h4>

                                            <div class="grid md:grid-cols-2 gap-4">

                                                <div
                                                    v-for="reason in career.reasons"
                                                    :key="reason"
                                                    class="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100"
                                                >

                                                    <div class="text-green-600 text-lg">
                                                        ✅
                                                    </div>

                                                    <p class="text-gray-700 font-medium">
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
                                    <p class="text-sm text-gray-500 mb-1">{{ uni.ranking }}</p>
                                    <p class="text-sm text-gray-700">{{ uni.programName }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Salary Range -->
                        <div class="p-8 border-b border-gray-200" v-if="career.salary">
                            <h4 class="text-xl font-bold mb-4">💰 Salary Range</h4>
                            <div class="bg-gray-50 rounded-xl p-6">
                                <p class="text-gray-600 mb-2">Starting Position: Medium</p>
                                <p class="text-3xl font-bold text-indigo-600">
                                    {{ formatSalary(career.salary) }}
                                </p>
                                <p class="text-sm text-gray-500 mt-2">Annual (Per Year)</p>
                                <p class="text-xs text-gray-400 mt-4">Note: Salaries vary significantly based on experience, skills, benefits, location, industry sector, qualifications, and operational skills.</p>
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
                        <div class="p-8" v-if="career.pathway && career.pathway.length">
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

let loadingInterval = null;

onMounted(async () => {

    // animate loading steps
    loadingInterval = setInterval(() => {

        if (
            currentLoadingStep.value <
            loadingSteps.value.length - 1
        ) {
            currentLoadingStep.value++;
        }

    }, 1200);

    await userStore.fetchCurrentUser();

    const country = userStore.currentUser?.country;

    if (!country) {
        console.error("User country missing");
        return;
    }

    const hasAnswers = quizStore.answers.length > 0;

    if (hasAnswers) {

        console.log("🎯 Quiz just taken - generating recommendations");

        await quizStore.generateCareer(
            country,
            false
        );

    } else {

        console.log("📦 Loading cached recommendations");

        await quizStore.generateCareer(
            country,
            true
        );

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
        // 'canada': 'High School Diploma',
        // 'australia': 'ATAR',
        // 'germany': 'Abitur'
    };
    return systems[country?.toLowerCase()] || 'High School Diploma';
};

const formatSalary = (salary) => {
    if (!salary) return 'Information not available';
    if (typeof salary === 'object' && salary.min && salary.max) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: salary.currency || 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return `${formatter.format(salary.min)} - ${formatter.format(salary.max)} / ${salary.period || 'year'}`;
    }
    return salary;
};

// ADD THIS FUNCTION
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

onMounted(async () => {
    await userStore.fetchCurrentUser();
    const country = userStore.currentUser?.country;
    
    if (!country) {
        console.error("User country missing");
        return;
    }
    
    const hasAnswers = quizStore.answers.length > 0;
    
    if (hasAnswers) {
        console.log("🎯 Quiz just taken - generating AI recommendations");
        await quizStore.generateCareer(country, false);
    } else {
        console.log("📦 Page refresh - loading cached careers");
        await quizStore.generateCareer(country, true);
    }
});
</script>