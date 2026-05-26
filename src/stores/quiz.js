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
    // SAVE CAREERS TO LOCAL STORAGE (THIS WORKS!)
    // =========================

    const saveCareersToLocalStorage = () => {
        if (careers.value.length === 0) return;
        
        // Save with country-specific key
        if (careers.value[0]?.country) {
            const countryKey = careers.value[0].country.toLowerCase();
            localStorage.setItem(`cached_careers_${countryKey}`, JSON.stringify(careers.value));
            console.log(`💾 Saved ${careers.value.length} careers for ${countryKey}`);
        }
        
        // Save generic backup
        localStorage.setItem('cached_careers', JSON.stringify(careers.value));
    };

    const loadCareersFromLocalStorage = (country) => {
        // Try country-specific first
        if (country) {
            const countryKey = country.toLowerCase();
            const saved = localStorage.getItem(`cached_careers_${countryKey}`);
            if (saved) {
                const savedCareers = JSON.parse(saved);
                if (savedCareers && savedCareers.length > 0) {
                    careers.value = savedCareers;
                    console.log(`✅ Loaded ${savedCareers.length} careers from ${countryKey}`);
                    return true;
                }
            }
        }
        
        // Try generic cache
        const saved = localStorage.getItem('cached_careers');
        if (saved) {
            const savedCareers = JSON.parse(saved);
            if (savedCareers && savedCareers.length > 0) {
                careers.value = savedCareers;
                console.log(`✅ Loaded ${savedCareers.length} careers from generic cache`);
                return true;
            }
        }
        
        return false;
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
    // FALLBACK CAREERS (Hardcoded - works every time)
    // =========================

    const getFallbackCareers = (country, personality) => {
        const countryLower = country?.toLowerCase() === 'nigeria' || country?.toLowerCase() === 'ng' ? 'nigeria' : 'us';
        const personalityLower = personality?.toLowerCase() || '';
        
        // Determine personality key
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
    // MAIN GENERATOR - THIS IS THE CORE FUNCTION
    // =========================

    const generateCareer = async (country, forceRefresh = false) => {
        isLoading.value = true;
        error.value = null;
    
        try {
            const quizJustCompleted = localStorage.getItem('quiz_just_completed') === 'true';
            
            // If force refresh OR quiz just completed, generate new careers
            if (forceRefresh || quizJustCompleted) {
                console.log("🤖 Generating NEW careers for", country);
                
                // Try AI first
                const aiSuccess = await generateCareerWithAI(country);
                
                // If AI failed, use fallback
                if (!aiSuccess) {
                    console.log("⚠️ AI failed, using fallback careers");
                    generateCareerFallback(country);
                }
                
                localStorage.removeItem('quiz_just_completed');
            } 
            // Otherwise try to load from cache
            else {
                console.log("📦 Loading cached careers for", country);
                const loaded = loadCareersFromLocalStorage(country);
                
                if (!loaded || careers.value.length === 0) {
                    console.log("⚠️ No cache found, generating new careers");
                    const aiSuccess = await generateCareerWithAI(country);
                    if (!aiSuccess) {
                        generateCareerFallback(country);
                    }
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
    // AI CAREER GENERATION - Returns true if successful
    // =========================

    const generateCareerWithAI = async (country) => {
        const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
        
        if (!API_KEY) {
            console.warn("No API key found");
            return false;
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
                console.warn(`API Error: ${response.status}`);
                return false;
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
            
            // Save to localStorage (ALWAYS works)
            saveCareersToLocalStorage();
            calculatePersonalityScores();
            
            console.log("✅ AI careers generated successfully:", careers.value.length);
            return true;
            
        } catch (error) {
            console.error("AI error:", error);
            return false;
        }
    };

    // =========================
    // FALLBACK SYSTEM - Always works
    // =========================

    const generateCareerFallback = (country) => {
        // Try to load from localStorage first
        if (loadCareersFromLocalStorage(country)) {
            calculatePersonalityScores();
            console.log('✅ Using cached fallback careers');
            return;
        }
        
        // Calculate dominant personality
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
        
        // Use hardcoded fallback careers
        careers.value = getFallbackCareers(country, dominantPersonality);
        saveCareersToLocalStorage();
        calculatePersonalityScores();
        console.log('✅ Using hardcoded fallback careers');
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
        
        // Clear all career caches
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cached_careers_')) {
                localStorage.removeItem(key);
            }
        });
        localStorage.removeItem('cached_careers');
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
