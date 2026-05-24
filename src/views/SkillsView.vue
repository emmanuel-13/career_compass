<template>
    <div class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <!-- Hero Section -->
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
                <div class="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full mb-8 shadow-lg border border-indigo-200">
                    <span class="text-lg font-semibold text-gray-900">Skills Development</span>
                </div>
                
                <h1 class="text-5xl md:text-6xl font-bold mb-6 text-gray-900">Build Your Future</h1>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">Start developing the essential skills for your top career matches</p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="max-w-7xl mx-auto px-4 py-20 text-center">
            <div class="inline-block">
                <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            </div>
            <p class="text-gray-600">Loading your personalized skills...</p>
        </div>

        <!-- No Quiz Taken State -->
        <div v-else-if="!hasTakenQuiz" class="max-w-7xl mx-auto px-4 py-20">
            <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-12 text-center">
                <div class="text-6xl mb-4">📋</div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Quiz Required</h2>
                <p class="text-gray-600 mb-6">You need to complete the career assessment quiz before accessing personalized skill recommendations.</p>
                <button 
                    @click="goToQuiz"
                    class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
                >
                    Take the Quiz Now →
                </button>
            </div>
        </div>

        <!-- No Careers State -->
        <div v-else-if="topCareers.length === 0" class="max-w-7xl mx-auto px-4 py-20 text-center">
            <div class="bg-blue-50 border border-blue-200 rounded-2xl p-12">
                <div class="text-6xl mb-4">🎯</div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">No Career Matches Yet</h2>
                <p class="text-gray-600 mb-6">Take the quiz to discover your career matches and see personalized skill recommendations.</p>
                <button 
                    @click="goToQuiz"
                    class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
                >
                    Take the Quiz Now →
                </button>
            </div>
        </div>

        <!-- Main Content (Quiz Taken) -->
        <div v-else class="max-w-7xl mx-auto px-4">
            <!-- Recommended Skills Section - Now pulls from actual career data -->
            <div class="mb-12">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">🎯 Recommended Skills for You</h2>
                <p class="text-gray-600 mb-8">Based on your top career matches, here are the skills you should focus on developing.</p>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div 
                        v-for="skill in recommendedSkills" 
                        :key="skill.name"
                        class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
                    >
                        <div class="p-6">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="text-4xl">{{ skill.icon }}</div>
                                <h3 class="text-xl font-bold text-gray-800">{{ skill.name }}</h3>
                            </div>
                            <p class="text-gray-600 mb-4">{{ skill.description }}</p>
                            
                            <div class="mb-4">
                                <h4 class="font-semibold text-gray-700 mb-2">📌 Relevant for:</h4>
                                <div class="flex flex-wrap gap-2">
                                    <span 
                                        v-for="career in skill.relevantCareers" 
                                        :key="career"
                                        class="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
                                    >
                                        {{ career }}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <h4 class="font-semibold text-gray-700 mb-2">📚 Learning Resources:</h4>
                                <ul class="space-y-1 text-sm text-gray-600">
                                    <li v-for="resource in skill.resources" :key="resource">
                                        • {{ resource }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Essential Skill Areas - Extracted from career skills -->
            <div class="mb-12">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">✨ Essential Skill Areas</h2>
                <p class="text-gray-600 mb-8">Explore different skill categories that can enhance your career prospects</p>
                
                <div class="flex flex-wrap gap-3">
                    <span 
                        v-for="skillArea in essentialSkillAreas" 
                        :key="skillArea"
                        class="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer"
                        @click="filterBySkillArea(skillArea)"
                    >
                        {{ skillArea }}
                    </span>
                </div>
            </div>

            <!-- Career Pathway Tips -->
            <div class="mb-12">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">🚀 Career Development Tips</h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-all">
                        <div class="text-4xl mb-3">🎯</div>
                        <h3 class="font-bold text-lg mb-2">Set Clear Goals</h3>
                        <p class="text-gray-600 text-sm">Define what you want to learn and set achievable milestones</p>
                    </div>
                    <div class="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-all">
                        <div class="text-4xl mb-3">🔄</div>
                        <h3 class="font-bold text-lg mb-2">Practice Regularly</h3>
                        <p class="text-gray-600 text-sm">Consistent practice is key to mastering any skill</p>
                    </div>
                    <div class="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-all">
                        <div class="text-4xl mb-3">🏗️</div>
                        <h3 class="font-bold text-lg mb-2">Build Projects</h3>
                        <p class="text-gray-600 text-sm">Apply your skills to real projects to gain practical experience</p>
                    </div>
                </div>
            </div>

            <!-- My Top Career Matches with Skills Display -->
            <div class="mb-12">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">💼 Your Top Career Matches</h2>
                <div class="grid md:grid-cols-3 gap-4">
                    <div 
                        v-for="career in topCareers" 
                        :key="career.slug"
                        class="bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100"
                    >
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">{{ getCareerIcon(career.title) }}</span>
                            <div>
                                <h3 class="font-semibold text-gray-800">{{ career.title }}</h3>
                                <p class="text-sm text-indigo-600">Match: {{ career.match }}%</p>
                            </div>
                        </div>
                        <!-- Display actual skills from career -->
                        <div class="mt-3">
                            <p class="text-xs text-gray-500 mb-1">Skills needed:</p>
                            <div class="flex flex-wrap gap-1">
                                <span 
                                    v-for="skill in career.skills?.slice(0, 3)" 
                                    :key="skill"
                                    class="px-2 py-0.5 rounded-full text-xs bg-white text-gray-600"
                                >
                                    {{ skill }}
                                </span>
                                <span v-if="career.skills?.length > 3" class="px-2 py-0.5 rounded-full text-xs bg-white text-gray-500">
                                    +{{ career.skills.length - 3 }}
                                </span>
                            </div>
                        </div>
                        <button 
                            @click="viewCareer(career.slug)"
                            class="mt-3 w-full py-2 text-sm bg-white border border-indigo-200 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                            View Details →
                        </button>
                    </div>
                </div>
            </div>

            <!-- Recommended Learning Path Based on Top Career -->
            <div class="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                <h2 class="text-2xl font-bold mb-4">📖 Your Personalized Learning Path</h2>
                <p class="text-indigo-100 mb-6">Based on your top career match: <strong>{{ topCareers[0]?.title || 'your career' }}</strong></p>
                
                <div class="space-y-4">
                    <div v-for="(step, index) in learningPath" :key="index" class="flex items-start gap-4">
                        <div class="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                            {{ index + 1 }}
                        </div>
                        <div>
                            <h3 class="font-semibold">{{ step.title }}</h3>
                            <p class="text-indigo-100 text-sm">{{ step.description }}</p>
                            <div class="flex flex-wrap gap-2 mt-2">
                                <span 
                                    v-for="skill in step.skills" 
                                    :key="skill"
                                    class="px-2 py-0.5 rounded-full bg-white/20 text-xs"
                                >
                                    {{ skill }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<!-- <script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizStore } from '@/stores/quiz';
import { useUserStore } from '@/stores/users';

const router = useRouter();
const quizStore = useQuizStore();
const userStore = useUserStore();

const isLoading = ref(true);

// Check if quiz has been taken - check both store and localStorage
const hasTakenQuiz = computed(() => {
    // Check if there are answers in the store OR in localStorage
    const hasAnswers = quizStore.answers && quizStore.answers.length > 0;
    if (hasAnswers) return true;
    
    // Also check localStorage directly
    const savedAnswers = localStorage.getItem('quiz_answers');
    if (savedAnswers) {
        const parsed = JSON.parse(savedAnswers);
        return parsed && parsed.length > 0;
    }
    return false;
});

// Get top careers from quiz store - also try localStorage
const topCareers = computed(() => {
    // First try to get from store
    if (quizStore.careers && quizStore.careers.length > 0) {
        return quizStore.careers;
    }
    
    // Then try to get from localStorage cache
    const cachedCareers = localStorage.getItem('cached_careers');
    if (cachedCareers) {
        const parsed = JSON.parse(cachedCareers);
        return parsed;
    }
    
    return [];
});

// Get icon for a skill
const getSkillIcon = (skillName) => {
    const icons = {
        'writing': '✍️',
        'research': '🔍',
        'communication': '💬',
        'critical thinking': '🧠',
        'analytical thinking': '📊',
        'problem-solving': '🔧',
        'leadership': '👥',
        'strategic planning': '🎯',
        'team leadership': '👔',
        'market analysis': '📈',
        'diagnosis': '🩺',
        'patient care': '❤️',
        'medical knowledge': '📚',
        'negotiation': '🤝',
        'sales': '💰',
        'empathy': '🤗',
        'active listening': '👂',
        'project management': '📋',
        'structural analysis': '🏗️',
        'design': '🎨',
        'creativity': '🎨',
        'media relations': '📺',
        'editing': '✏️',
        'content creation': '📝',
        'public speaking': '🎤'
    };
    return icons[skillName.toLowerCase()] || '💼';
};

// Get description for a skill
const getSkillDescription = (skillName) => {
    const descriptions = {
        'writing': 'Develop clear and effective written communication for various audiences',
        'research': 'Master information gathering and analysis techniques',
        'communication': 'Enhance verbal and non-verbal communication abilities',
        'critical thinking': 'Learn to analyze problems and make reasoned judgments',
        'analytical thinking': 'Develop data interpretation and logical reasoning skills',
        'problem-solving': 'Build systematic approaches to complex challenges',
        'leadership': 'Cultivate team management and motivational abilities',
        'strategic planning': 'Learn long-term goal setting and execution',
        'diagnosis': 'Master medical assessment and diagnostic techniques',
        'patient care': 'Learn compassionate and effective patient interaction',
        'medical knowledge': 'Build comprehensive understanding of medical sciences',
        'negotiation': 'Develop win-win deal-making strategies',
        'empathy': 'Cultivate understanding and compassion for others',
        'active listening': 'Improve attentive and responsive communication',
        'project management': 'Master planning, execution, and monitoring of projects',
        'creativity': 'Enhance innovative thinking and creative problem-solving',
        'media relations': 'Learn to manage public and media communications',
        'editing': 'Master proofreading and content refinement skills'
    };
    return descriptions[skillName.toLowerCase()] || `Master the art of ${skillName} for career success`;
};

// Get learning resources for a skill
const getSkillResources = (skillName) => {
    const resources = {
        'writing': ['Grammarly - Writing assistant', 'Medium - Writing platform', 'Coursera - Creative Writing'],
        'research': ['Google Scholar', 'ResearchGate', 'Coursera - Research Methods'],
        'communication': ['Toastmasters International', 'LinkedIn Learning - Communication', 'MasterClass - Public Speaking'],
        'critical thinking': ['Brilliant.org', 'Critical Thinking Academy', 'MindTools'],
        'analytical thinking': ['DataCamp', 'Khan Academy - Statistics', 'Analytics Vidhya'],
        'problem-solving': ['LeetCode', 'HackerRank', 'Brilliant.org'],
        'leadership': ['Harvard Business Review', 'LinkedIn Learning - Leadership', 'Coursera - Leadership'],
        'strategic planning': ['Strategyzer', 'MIT Sloan Management Review', 'Coursera - Strategy'],
        'diagnosis': ['Medscape', 'UpToDate', 'Khan Academy Medicine'],
        'patient care': ['Cleveland Clinic', 'Mayo Clinic Education', 'MedBridge'],
        'medical knowledge': ['PubMed', 'MedlinePlus', 'AMBOSS'],
        'negotiation': ['Negotiation Academy', 'LinkedIn Learning - Negotiation', 'MasterClass - Negotiation'],
        'empathy': ['Greater Good Science Center', 'Empathy Lab', 'Coursera - Emotional Intelligence'],
        'active listening': ['Mindful Listening Course', 'Communication Skills Training', 'Active Listening Workshop'],
        'project management': ['PMP Certification', 'Agile Alliance', 'Scrum Alliance'],
        'creativity': ['Creative Live', 'Skillshare - Creative Thinking', 'IDEO U'],
        'media relations': ['PRSA Learning', 'Muck Rack Academy', 'Cision PR Courses'],
        'editing': ['Poynter News University', 'Editorial Freelancers Association', 'Copyediting Certificate']
    };
    return resources[skillName.toLowerCase()] || ['LinkedIn Learning', 'Coursera', 'Industry Workshops'];
};

// Generate recommended skills based on actual career data
const recommendedSkills = computed(() => {
    const careers = topCareers.value;
    if (!careers || careers.length === 0) return [];
    
    const skillsMap = new Map();
    
    careers.forEach(career => {
        if (career.skills && career.skills.length > 0) {
            career.skills.forEach(skill => {
                const skillName = skill.charAt(0).toUpperCase() + skill.slice(1);
                if (!skillsMap.has(skillName)) {
                    skillsMap.set(skillName, {
                        name: skillName,
                        icon: getSkillIcon(skill),
                        description: getSkillDescription(skill),
                        relevantCareers: [career.title],
                        resources: getSkillResources(skill)
                    });
                } else {
                    const existing = skillsMap.get(skillName);
                    if (!existing.relevantCareers.includes(career.title)) {
                        existing.relevantCareers.push(career.title);
                    }
                }
            });
        }
    });
    
    return Array.from(skillsMap.values()).slice(0, 6);
});

// Essential skill areas - extracted from all career skills
const essentialSkillAreas = computed(() => {
    const careers = topCareers.value;
    if (!careers || careers.length === 0) return ['Communication', 'Problem Solving', 'Leadership', 'Critical Thinking', 'Research'];
    
    const allSkills = new Set();
    careers.forEach(career => {
        if (career.skills && career.skills.length > 0) {
            career.skills.forEach(skill => {
                allSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
            });
        }
    });
    
    const defaultAreas = ['Communication', 'Problem Solving', 'Leadership', 'Critical Thinking', 'Research'];
    const skillArray = Array.from(allSkills);
    return skillArray.length > 8 ? skillArray : [...new Set([...skillArray, ...defaultAreas])].slice(0, 12);
});

// Generate learning path based on top career's actual skills
const learningPath = computed(() => {
    const careers = topCareers.value;
    if (!careers || careers.length === 0) {
        return [
            { title: 'Foundation Skills', description: 'Build core competencies for your career', skills: ['Communication', 'Problem Solving', 'Teamwork'] },
            { title: 'Industry Knowledge', description: 'Learn industry-specific concepts and tools', skills: ['Best Practices', 'Tools', 'Standards'] },
            { title: 'Advanced Expertise', description: 'Develop specialized skills for career growth', skills: ['Advanced Concepts', 'Certification', 'Leadership'] }
        ];
    }
    
    const topCareer = careers[0];
    if (!topCareer.skills || topCareer.skills.length === 0) {
        return [
            { title: 'Foundation Skills', description: 'Build core competencies for your career', skills: ['Communication', 'Problem Solving', 'Teamwork'] },
            { title: 'Industry Knowledge', description: 'Learn industry-specific concepts and tools', skills: ['Best Practices', 'Tools', 'Standards'] },
            { title: 'Advanced Expertise', description: 'Develop specialized skills for career growth', skills: ['Advanced Concepts', 'Certification', 'Leadership'] }
        ];
    }
    
    const skills = topCareer.skills.slice(0, 3);
    return [
        { title: `Master ${skills[0] || 'Core Skills'}`, description: `Build a strong foundation in ${skills[0] || 'essential areas'}`, skills: [skills[0] || 'Core Skills'] },
        { title: `Develop ${skills[1] || skills[0] || 'Advanced Skills'}`, description: `Enhance your capabilities with ${skills[1] || skills[0] || 'practical experience'}`, skills: [skills[1] || skills[0] || 'Advanced Skills'] },
        { title: `Excel at ${skills[2] || skills[1] || 'Expert Level'}`, description: `Master ${skills[2] || skills[1] || 'specialized techniques'} for career advancement`, skills: [skills[2] || skills[1] || 'Expert Level'] }
    ];
});

// Filter by skill area (opens careers with that skill)
const filterBySkillArea = (skillArea) => {
    const matchingCareers = topCareers.value.filter(career => 
        career.skills?.some(skill => skill.toLowerCase() === skillArea.toLowerCase())
    );
    if (matchingCareers.length > 0) {
        viewCareer(matchingCareers[0].slug);
    }
};

// Get career icon
const getCareerIcon = (title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('software') || t.includes('developer') || t.includes('programmer')) return '💻';
    if (t.includes('engineer') || t.includes('engineering')) return '🔧';
    if (t.includes('data') || t.includes('analyst')) return '📊';
    if (t.includes('doctor') || t.includes('medical') || t.includes('physician')) return '👨‍⚕️';
    if (t.includes('social') || t.includes('counselor') || t.includes('psychologist')) return '🤝';
    if (t.includes('business') || t.includes('manager') || t.includes('marketing')) return '📋';
    if (t.includes('designer') || t.includes('artist')) return '🎨';
    if (t.includes('lawyer') || t.includes('attorney')) return '⚖️';
    if (t.includes('writer') || t.includes('journalist')) return '✍️';
    if (t.includes('scientist') || t.includes('researcher')) return '🔬';
    if (t.includes('architect') || t.includes('civil')) return '🏛️';
    if (t.includes('biomedical')) return '🔬';
    return '🎯';
};

// Navigate to quiz
const goToQuiz = () => {
    router.push('/quiz');
};

// View career details
const viewCareer = (slug) => {
    router.push(`/explore/${slug}`);
};

// Load data on mount
onMounted(async () => {
    isLoading.value = true;
    
    try {
        await userStore.fetchCurrentUser();
        
        // Check if we have cached careers in localStorage
        const cachedCareers = localStorage.getItem('cached_careers');
        
        if (cachedCareers) {
            const parsedCareers = JSON.parse(cachedCareers);
            if (parsedCareers && parsedCareers.length > 0) {
                // Set the careers in the store if they're not already there
                if (quizStore.careers.length === 0) {
                    quizStore.careers.value = parsedCareers;
                }
                console.log('✅ Loaded careers from localStorage cache');
            }
        }
        
        // If no careers in store and quiz was taken, generate them
        if (hasTakenQuiz.value && topCareers.value.length === 0) {
            const country = userStore.currentUser?.country || 'us';
            await quizStore.generateCareer(country, true);
        }
        
    } catch (error) {
        console.error('Error loading skills page:', error);
    } finally {
        isLoading.value = false;
    }
});
</script> -->


<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizStore } from '@/stores/quiz';
import { useUserStore } from '@/stores/users';

const router = useRouter();
const quizStore = useQuizStore();
const userStore = useUserStore();

const isLoading = ref(true);
const currentCountry = ref(userStore.currentUser?.country || 'us');

// Watch for country changes and reload skills
watch(() => userStore.currentUser?.country, async (newCountry) => {
    if (newCountry && newCountry !== currentCountry.value) {
        currentCountry.value = newCountry;
        // Force refresh of careers for new country
        if (hasTakenQuiz.value) {
            isLoading.value = true;
            await quizStore.generateCareer(newCountry, true);
            isLoading.value = false;
        }
    }
});

// Check if quiz has been taken
const hasTakenQuiz = computed(() => {
    const hasAnswers = quizStore.answers && quizStore.answers.length > 0;
    if (hasAnswers) return true;
    const savedAnswers = localStorage.getItem('quiz_answers');
    if (savedAnswers) {
        const parsed = JSON.parse(savedAnswers);
        return parsed && parsed.length > 0;
    }
    return false;
});

// Get top careers from quiz store - also try localStorage
const topCareers = computed(() => {
    if (quizStore.careers && quizStore.careers.length > 0) {
        return quizStore.careers;
    }
    const cachedCareers = localStorage.getItem('cached_careers');
    if (cachedCareers) {
        const parsed = JSON.parse(cachedCareers);
        return parsed;
    }
    return [];
});

// Add country-specific skill variations
const getCountrySpecificSkill = (skillName, careerTitle) => {
    const country = userStore.currentUser?.country?.toLowerCase() || 'us';
    const title = careerTitle?.toLowerCase() || '';
    
    // Country-specific skill nuances
    if (country === 'nigeria') {
        if (skillName === 'medical knowledge' && title.includes('doctor')) {
            return 'Nigerian Medical Protocols & Tropical Diseases';
        }
        if (skillName === 'legal knowledge' && title.includes('lawyer')) {
            return 'Nigerian Legal System & Constitution';
        }
        if (skillName === 'engineering' && title.includes('civil')) {
            return 'Nigerian Building Codes & Local Materials';
        }
    }
    if (country === 'uk') {
        if (skillName === 'medical knowledge' && title.includes('doctor')) {
            return 'NHS Protocols & UK Medical Regulations';
        }
        if (skillName === 'legal knowledge' && title.includes('lawyer')) {
            return 'UK Common Law & Legal System';
        }
    }
    if (country === 'us') {
        if (skillName === 'medical knowledge' && title.includes('doctor')) {
            return 'US Medical Board Standards & HIPAA';
        }
        if (skillName === 'legal knowledge' && title.includes('lawyer')) {
            return 'US Federal & State Laws';
        }
    }
    
    return skillName.charAt(0).toUpperCase() + skillName.slice(1);
};

// Get icon for a skill
const getSkillIcon = (skillName) => {
    const icons = {
        'writing': '✍️', 'research': '🔍', 'communication': '💬',
        'critical thinking': '🧠', 'analytical thinking': '📊', 'problem-solving': '🔧',
        'leadership': '👥', 'strategic planning': '🎯', 'team leadership': '👔',
        'market analysis': '📈', 'diagnosis': '🩺', 'patient care': '❤️',
        'medical knowledge': '📚', 'negotiation': '🤝', 'sales': '💰',
        'empathy': '🤗', 'active listening': '👂', 'project management': '📋',
        'structural analysis': '🏗️', 'design': '🎨', 'creativity': '🎨',
        'media relations': '📺', 'editing': '✏️', 'public speaking': '🎤'
    };
    return icons[skillName.toLowerCase()] || '💼';
};

// Get country-aware skill description
const getSkillDescription = (skill, careerTitle) => {
    const country = userStore.currentUser?.country?.toLowerCase() || 'us';
    const title = careerTitle?.toLowerCase() || '';
    
    const descriptions = {
        'writing': `Develop clear written communication for ${country === 'nigeria' ? 'Nigerian' : country === 'uk' ? 'British' : 'international'} audiences`,
        'research': `Master information gathering and analysis techniques relevant to ${country === 'nigeria' ? 'Nigeria' : country === 'uk' ? 'the UK' : 'the US'} market`,
        'communication': `Enhance ${country === 'nigeria' ? 'multi-lingual' : 'professional'} communication abilities`,
        'medical knowledge': country === 'nigeria' ? 'Study Nigerian healthcare system, tropical diseases, and local medical practices' :
                           country === 'uk' ? 'Learn NHS protocols and UK medical regulations' :
                           'Master US medical standards and healthcare systems',
        'legal knowledge': country === 'nigeria' ? 'Understand Nigerian legal system, constitution, and local laws' :
                           country === 'uk' ? 'Study UK common law and legal procedures' :
                           'Learn US federal and state laws',
    };
    
    return descriptions[skill.toLowerCase()] || `Master the art of ${skill} for ${country === 'nigeria' ? 'Nigerian' : country === 'uk' ? 'UK' : 'global'} career success`;
};

// Generate recommended skills based on actual career data
const recommendedSkills = computed(() => {
    const careers = topCareers.value;
    if (!careers || careers.length === 0) return [];
    
    const skillsMap = new Map();
    
    careers.forEach(career => {
        if (career.skills && career.skills.length > 0) {
            career.skills.forEach(skill => {
                const skillName = getCountrySpecificSkill(skill, career.title);
                const baseSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
                
                if (!skillsMap.has(baseSkill)) {
                    skillsMap.set(baseSkill, {
                        name: skillName,
                        icon: getSkillIcon(skill),
                        description: getSkillDescription(skill, career.title),
                        relevantCareers: [career.title],
                        resources: getSkillResources(skill, career.title)
                    });
                } else {
                    const existing = skillsMap.get(baseSkill);
                    if (!existing.relevantCareers.includes(career.title)) {
                        existing.relevantCareers.push(career.title);
                    }
                }
            });
        }
    });
    
    return Array.from(skillsMap.values()).slice(0, 6);
});

// Get learning resources for a skill (can also be country-specific)
const getSkillResources = (skillName, careerTitle) => {
    const country = userStore.currentUser?.country?.toLowerCase() || 'us';
    
    const resources = {
        'writing': ['Grammarly', 'Medium', 'Coursera - Creative Writing'],
        'research': ['Google Scholar', 'ResearchGate', 'Coursera - Research Methods'],
        'communication': ['Toastmasters International', 'LinkedIn Learning', 'MasterClass'],
        'medical knowledge': country === 'nigeria' ? 
            ['Nigerian Medical Association Resources', 'West African College of Physicians', 'MedlinePlus'] :
            ['Medscape', 'PubMed', 'Khan Academy Medicine'],
        'legal knowledge': country === 'nigeria' ?
            ['Nigerian Law School Resources', 'Law Pavilion', 'LegalPedia'] :
            ['Legal Writing Courses', 'Case Law Databases', 'Bar Exam Prep']
    };
    
    return resources[skillName.toLowerCase()] || ['LinkedIn Learning', 'Coursera', 'Industry Workshops'];
};

// Rest of your existing code remains the same...
const essentialSkillAreas = computed(() => {
    const careers = topCareers.value;
    if (!careers || careers.length === 0) return ['Communication', 'Problem Solving', 'Leadership', 'Critical Thinking', 'Research'];
    
    const allSkills = new Set();
    careers.forEach(career => {
        if (career.skills && career.skills.length > 0) {
            career.skills.forEach(skill => {
                allSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
            });
        }
    });
    
    const defaultAreas = ['Communication', 'Problem Solving', 'Leadership', 'Critical Thinking', 'Research'];
    const skillArray = Array.from(allSkills);
    return skillArray.length > 8 ? skillArray : [...new Set([...skillArray, ...defaultAreas])].slice(0, 12);
});

const learningPath = computed(() => {
    const careers = topCareers.value;
    if (!careers || careers.length === 0) {
        return [
            { title: 'Foundation Skills', description: 'Build core competencies for your career', skills: ['Communication', 'Problem Solving', 'Teamwork'] },
            { title: 'Industry Knowledge', description: 'Learn industry-specific concepts and tools', skills: ['Best Practices', 'Tools', 'Standards'] },
            { title: 'Advanced Expertise', description: 'Develop specialized skills for career growth', skills: ['Advanced Concepts', 'Certification', 'Leadership'] }
        ];
    }
    
    const topCareer = careers[0];
    if (!topCareer.skills || topCareer.skills.length === 0) {
        return [
            { title: 'Foundation Skills', description: 'Build core competencies for your career', skills: ['Communication', 'Problem Solving', 'Teamwork'] },
            { title: 'Industry Knowledge', description: 'Learn industry-specific concepts and tools', skills: ['Best Practices', 'Tools', 'Standards'] },
            { title: 'Advanced Expertise', description: 'Develop specialized skills for career growth', skills: ['Advanced Concepts', 'Certification', 'Leadership'] }
        ];
    }
    
    const skills = topCareer.skills.slice(0, 3);
    return [
        { title: `Master ${skills[0] || 'Core Skills'}`, description: `Build a strong foundation in ${skills[0] || 'essential areas'}`, skills: [skills[0] || 'Core Skills'] },
        { title: `Develop ${skills[1] || skills[0] || 'Advanced Skills'}`, description: `Enhance your capabilities with ${skills[1] || skills[0] || 'practical experience'}`, skills: [skills[1] || skills[0] || 'Advanced Skills'] },
        { title: `Excel at ${skills[2] || skills[1] || 'Expert Level'}`, description: `Master ${skills[2] || skills[1] || 'specialized techniques'} for career advancement`, skills: [skills[2] || skills[1] || 'Expert Level'] }
    ];
});

const filterBySkillArea = (skillArea) => {
    const matchingCareers = topCareers.value.filter(career => 
        career.skills?.some(skill => skill.toLowerCase() === skillArea.toLowerCase())
    );
    if (matchingCareers.length > 0) {
        viewCareer(matchingCareers[0].slug);
    }
};

const getCareerIcon = (title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('software') || t.includes('developer')) return '💻';
    if (t.includes('engineer')) return '🔧';
    if (t.includes('doctor') || t.includes('medical')) return '👨‍⚕️';
    if (t.includes('lawyer')) return '⚖️';
    if (t.includes('writer')) return '✍️';
    return '🎯';
};

const goToQuiz = () => {
    router.push('/quiz');
};

const viewCareer = (slug) => {
    router.push(`/explore/${slug}`);
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await userStore.fetchCurrentUser();
        const cachedCareers = localStorage.getItem('cached_careers');
        if (cachedCareers) {
            const parsedCareers = JSON.parse(cachedCareers);
            if (parsedCareers && parsedCareers.length > 0 && quizStore.careers.length === 0) {
                quizStore.careers.value = parsedCareers;
            }
        }
        if (hasTakenQuiz.value && topCareers.value.length === 0) {
            const country = userStore.currentUser?.country || 'us';
            await quizStore.generateCareer(country, true);
        }
    } catch (error) {
        console.error('Error loading skills page:', error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<style scoped>
/* Smooth transitions */
.bg-gradient-to-r {
    transition: all 0.3s ease;
}
</style>