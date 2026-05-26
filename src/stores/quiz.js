import { defineStore } from "pinia";
import { ref } from "vue";
// REMOVE THIS LINE: import careersData from "@/data/careers.json";

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

    // const api = "http://localhost:3000/careers";
    const baseUrl = import.meta.env.VITE_API_URL;
    const api = `${baseUrl}/careers`;

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
    // SAVE CAREERS TO LOCAL STORAGE (Backup)
    // =========================

    const saveCareersToLocalStorage = () => {
        // Save with country-specific key
        if (careers.value.length > 0 && careers.value[0]?.country) {
            const countryKey = careers.value[0].country.toLowerCase();
            localStorage.setItem(`cached_careers_${countryKey}`, JSON.stringify(careers.value));
            console.log(`💾 Saved ${careers.value.length} careers for ${countryKey} to localStorage`);
        }
        // Also save to generic cache as fallback
        localStorage.setItem('cached_careers', JSON.stringify(careers.value));
    };

    const loadCareersFromLocalStorage = (country) => {
        // Try country-specific key first
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
        
        // Fallback to generic cache
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
                universitySystem: 'Nigerian Universities (NUC accredited)',
                degreeStructure: '4-year Bachelor degree program',
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
                universitySystem: 'Nigerian Universities (NUC accredited)',
                degreeStructure: '4-year Bachelor degree program',
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
                universitySystem: 'US Colleges and Universities (Accredited by regional bodies)',
                degreeStructure: '4-year Bachelor degree program',
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
                universitySystem: 'UK Universities (UCAS accredited)',
                degreeStructure: '3-year Bachelor degree program (Honours)',
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
        
        if (t.includes('software') || t.includes('developer') || t.includes('programmer')) return '💻';
        if (t.includes('engineer') || t.includes('engineering')) return '🔧';
        if (t.includes('data') || t.includes('analyst')) return '📊';
        if (t.includes('cyber') || t.includes('security')) return '🔒';
        if (t.includes('ai') || t.includes('machine learning')) return '🤖';
        if (t.includes('cloud') || t.includes('devops')) return '☁️';
        if (t.includes('doctor') || t.includes('physician')) return '👨‍⚕️';
        if (t.includes('nurse')) return '🩺';
        if (t.includes('dentist')) return '🦷';
        if (t.includes('pharmacist')) return '💊';
        if (t.includes('psychologist') || t.includes('therapist')) return '🧠';
        if (t.includes('biomedical')) return '🔬';
        if (t.includes('accountant') || t.includes('finance')) return '💰';
        if (t.includes('manager') || t.includes('executive')) return '📋';
        if (t.includes('marketing') || t.includes('sales')) return '📈';
        if (t.includes('business') || t.includes('entrepreneur')) return '🏢';
        if (t.includes('consultant')) return '💡';
        if (t.includes('lawyer') || t.includes('attorney')) return '⚖️';
        if (t.includes('social') || t.includes('counselor')) return '🤝';
        if (t.includes('teacher') || t.includes('educator')) return '📚';
        if (t.includes('designer') || t.includes('artist')) return '🎨';
        if (t.includes('writer') || t.includes('journalist')) return '✍️';
        if (t.includes('architect')) return '🏛️';
        if (t.includes('scientist') || t.includes('researcher')) return '🔬';
        if (t.includes('chemist')) return '🧪';
        if (t.includes('physicist')) return '⚛️';
        if (t.includes('biologist')) return '🧬';
        
        return '🎯';
    };

    // =========================
    // LOAD SAVED CAREERS FROM JSON
    // =========================

    const loadCareersFromJson = async (country) => {
        // First try localStorage cache
        if (loadCareersFromLocalStorage(country)) {
            calculatePersonalityScores();
            return true;
        }
        
        try {
            const response = await fetch(api);
            if (response.ok) {
                const allCareers = await response.json();
                const countryCareers = allCareers.filter(c => 
                    c.country?.toLowerCase() === country.toLowerCase()
                );
                
                if (countryCareers.length > 0) {
                    careers.value = countryCareers
                        .map(career => ({
                            ...career,
                            match: calculateMatch(career)
                        }))
                        .sort((a, b) => b.match - a.match)
                        .slice(0, 3);
                    
                    calculatePersonalityScores();
                    saveCareersToLocalStorage();
                    console.log('✅ Loaded careers from json-server:', careers.value.length);
                    return true;
                }
            }
        } catch (error) {
            console.log('json-server not available');
        }
        
        return false;
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

    // const generateCareer = async (country, forceRefresh = false) => {
    //     isLoading.value = true;
    //     error.value = null;

    //     try {
    //         const quizJustCompleted = localStorage.getItem('quiz_just_completed') === 'true';
            
    //         if (!forceRefresh && !quizJustCompleted) {
    //             console.log('📦 Loading cached careers for country:', country);
    //             const loaded = await loadCareersFromJson(country);
    //             if (loaded && careers.value.length > 0) {
    //                 console.log('✅ Using cached careers');
    //                 isLoading.value = false;
    //                 return;
    //             }
    //         }
            
    //         console.log('🤖 Generating new careers with AI for country:', country);
    //         await generateCareerWithAI(country);
    //         localStorage.removeItem('quiz_just_completed');
            
    //     } catch (err) {
    //         console.error(err);
    //         error.value = "AI failed. Using fallback system.";
    //         generateCareerFallback(country);
    //     } finally {
    //         isLoading.value = false;
    //     }
    // };

    const generateCareer = async (country, forceRefresh = false) => {
        isLoading.value = true;
        error.value = null;
        careers.value = [];
    
        try {
            // Check if quiz was just completed (either by forceRefresh or localStorage flag)
            const quizJustCompleted = localStorage.getItem('quiz_just_completed') === 'true';
            
            // Force new generation if:
            // 1. forceRefresh is true (explicitly requested), OR
            // 2. quiz was just completed (new answers submitted)
            if (forceRefresh || quizJustCompleted) {
                console.log("🤖 Generating NEW AI careers for", country);
                await generateCareerWithAI(country);
                localStorage.removeItem('quiz_just_completed');
            } else {
                // Try to load from cache
                console.log("📦 Attempting to load cached careers for", country);
                const loaded = loadCareersFromLocalStorage(country);
                
                if (loaded && careers.value.length > 0) {
                    console.log("✅ Using cached careers");
                    calculatePersonalityScores();
                } else {
                    // No cache found, generate new
                    console.log("🤖 No cache found, generating new careers...");
                    await generateCareerWithAI(country);
                }
            }
    
        } catch (err) {
            console.error("Generation error:", err);
            error.value = "AI failed. Using fallback careers.";
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
        
        if (!API_KEY) throw new Error("No API key found");

        const countryLower = country?.toLowerCase() || 'us';
        const config = getCountryRequirements(country);
        
        const userProfile = answers.value.map(item => ({
            answer: item.option?.text,
            traits: item.option?.traits || [],
            interests: item.option?.interests || [],
            personalityType: item.option?.personalityType
        }));

        // Calculate dominant personality type
        const personalityCounts = {};
        userProfile.forEach(item => {
            if (item.personalityType) {
                personalityCounts[item.personalityType] = (personalityCounts[item.personalityType] || 0) + 1;
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
        
        // Map personality to recommended career categories
        const personalityToCareers = {
            "Technical Innovator": ["Engineering", "Technology", "Data Science", "Research"],
            "Creative Communicator": ["Arts", "Media", "Education", "Communication"],
            "Healthcare Helper": ["Medical", "Healthcare", "Social Work", "Psychology"],
            "Business Leader": ["Business", "Finance", "Law", "Management"]
        };
        
        const recommendedCategories = personalityToCareers[dominantPersonality] || personalityToCareers["Technical Innovator"];
        
        // STRONGER PROMPT - Explicitly ban Software Engineering as default
        const prompt = `You are a career expert for ${country.toUpperCase()}. 

CRITICAL RULES:
1. DO NOT recommend "Software Engineer" or "Software Engineering" unless the user explicitly shows strong programming interests
2. Based on the user's personality (${dominantPersonality}), focus on these career categories: ${recommendedCategories.join(", ")}
3. Recommend careers from DIFFERENT fields - mix of categories

User's personality breakdown:
${JSON.stringify(userProfile, null, 2)}

Based on their answers, they show strong traits in: ${dominantPersonality}

For ${country.toUpperCase()}:
- Exam System: ${config.examSystem}
- Currency: ${config.currency}

Recommend 3 DIVERSE careers from appropriate categories. Return ONLY JSON:

{
  "recommendations": [
    {
      "title": "",
      "slug": "",
      "icon": "",
      "shortDescription": "",
      "description": "",
      "skills": [],
      "personalityType": "${dominantPersonality}",
      "traits": [],
      "interests": [],
      "requirements": {
        "examSystem": "${config.examSystem}",
        "examSubjects": ["Career-specific subjects"],
        ${config.jambSubjects.length > 0 ? `"jambSubjects": ["Career-specific JAMB subjects"],` : ''}
        "examDescription": "${config.examDescription}",
        "additionalTests": ${JSON.stringify(config.additionalTests)}
      },
      "universities": [
        {"name": "Top University in ${country.toUpperCase()}", "ranking": "Top Ranked", "programName": "Degree Name"}
      ],
      "salary": {
        "min": ${config.salaryRange.min},
        "max": ${config.salaryRange.max},
        "currency": "${config.currency}",
        "period": "year"
      },
      "relatedCareers": [],
      "pathway": [
        {"step": 1, "title": "", "duration": "", "description": ""},
        {"step": 2, "title": "", "duration": "", "description": ""},
        {"step": 3, "title": "", "duration": "", "description": ""},
        {"step": 4, "title": "", "duration": "", "description": ""},
        {"step": 5, "title": "", "duration": "", "description": ""}
      ]
    }
  ]
}

Remember: DO NOT recommend Software Engineering unless explicitly indicated by user answers.`;

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                    "HTTP-Referer": "https://career-compass-v906.onrender.com",
                    // "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "Career AI Platform"
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: `You are a career expert for ${country.toUpperCase()}. NEVER recommend "Software Engineer" as the first or default option. Base recommendations on the user's actual personality type: ${dominantPersonality}.`
                        },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.8,
                    max_tokens: 2000
                })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            let aiText = data.choices[0].message.content;
            
            aiText = aiText.replace(/```json\s*|\s*```/g, '').trim();
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) aiText = jsonMatch[0];
            
            let parsed = JSON.parse(aiText);
            if (!parsed.recommendations) throw new Error("Invalid response");

            // Career-specific subject mapping
            const getSubjectsForCareer = (title) => {
                const titleLower = title?.toLowerCase() || '';
                
                if (titleLower.includes('engineer') || titleLower.includes('civil') || titleLower.includes('mechanical') || titleLower.includes('electrical')) {
                    return {
                        examSubjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
                        jambSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry']
                    };
                }
                if (titleLower.includes('doctor') || titleLower.includes('medical') || titleLower.includes('nurse') || titleLower.includes('dentist')) {
                    return {
                        examSubjects: ['English Language', 'Mathematics', 'Biology', 'Chemistry'],
                        jambSubjects: ['English', 'Biology', 'Chemistry', 'Physics']
                    };
                }
                if (titleLower.includes('lawyer') || titleLower.includes('attorney')) {
                    return {
                        examSubjects: ['English Language', 'Government', 'Literature', 'Economics'],
                        jambSubjects: ['English', 'Government', 'Literature', 'Economics']
                    };
                }
                if (titleLower.includes('social') || titleLower.includes('psychologist') || titleLower.includes('counselor')) {
                    return {
                        examSubjects: ['English Language', 'Government', 'Economics', 'Literature'],
                        jambSubjects: ['English', 'Government', 'Economics', 'Literature']
                    };
                }
                if (titleLower.includes('account') || titleLower.includes('business') || titleLower.includes('economist') || titleLower.includes('finance')) {
                    return {
                        examSubjects: ['English Language', 'Mathematics', 'Economics', 'Accounting'],
                        jambSubjects: ['English', 'Mathematics', 'Economics', 'Accounting']
                    };
                }
                if (titleLower.includes('software') || titleLower.includes('computer') || titleLower.includes('programmer')) {
                    return {
                        examSubjects: ['English Language', 'Mathematics', 'Physics', 'Computer Studies'],
                        jambSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry']
                    };
                }
                // Default based on personality
                if (dominantPersonality === "Healthcare Helper") {
                    return {
                        examSubjects: ['English Language', 'Mathematics', 'Biology', 'Chemistry'],
                        jambSubjects: ['English', 'Biology', 'Chemistry', 'Physics']
                    };
                }
                if (dominantPersonality === "Creative Communicator") {
                    return {
                        examSubjects: ['English Language', 'Literature', 'Government', 'Economics'],
                        jambSubjects: ['English', 'Literature', 'Government', 'Economics']
                    };
                }
                if (dominantPersonality === "Business Leader") {
                    return {
                        examSubjects: ['English Language', 'Mathematics', 'Economics', 'Accounting'],
                        jambSubjects: ['English', 'Mathematics', 'Economics', 'Accounting']
                    };
                }
                return {
                    examSubjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
                    jambSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry']
                };
            };

            const recommendedCareers = parsed.recommendations.slice(0, 3).map((aiCareer, index) => {
                const careerSubjects = getSubjectsForCareer(aiCareer.title);
                
                return {
                    id: Date.now() + index + Math.random(),
                    slug: aiCareer.slug || aiCareer.title?.toLowerCase().replace(/\s+/g, '-') || `career-${index}`,
                    title: aiCareer.title || "Career Title",
                    icon: getIconForCareer(aiCareer.title),
                    shortDescription: aiCareer.shortDescription || "",
                    description: aiCareer.description || "No description available",
                    skills: aiCareer.skills || [],
                    traits: aiCareer.traits || [],
                    interests: aiCareer.interests || [],
                    personalityType: dominantPersonality,
                    country: countryLower,
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: careerSubjects.examSubjects,
                        jambSubjects: config.jambSubjects.length > 0 ? careerSubjects.jambSubjects : [],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: aiCareer.universities || [],
                    salary: aiCareer.salary || {
                        min: config.salaryRange.min,
                        max: config.salaryRange.max,
                        currency: config.currency,
                        period: "year"
                    },
                    relatedCareers: aiCareer.relatedCareers || [],
                    pathway: aiCareer.pathway || [],
                    match: 85,
                    aiGenerated: true
                };
            });

            careers.value = recommendedCareers.sort((a, b) => b.match - a.match).slice(0, 3);
            
            await saveCareersToJsonServer(recommendedCareers);
            saveCareersToLocalStorage();
            calculatePersonalityScores();
            
            console.log("FINAL CAREERS:", careers.value);
            
        } catch (error) {
            console.error("AI error:", error);
            generateCareerFallback(country);
        }
    };

    // =========================
    // SAVE CAREERS TO JSON-SERVER
    // =========================

    const saveCareersToJsonServer = async (newCareers) => {
        try {
            for (const career of newCareers) {
                const checkResponse = await fetch(`${api}?slug=${career.slug}`);
                if (checkResponse.ok) {
                    const existing = await checkResponse.json();
                    if (existing.length === 0) {
                        await fetch(`${api}/careers`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...career, id: Date.now() + Math.random() })
                        });
                        console.log(`✅ Saved: ${career.title}`);
                    }
                }
            }
        } catch (error) {
            console.log('Failed to save to json-server:', error);
        }
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
    // FALLBACK SYSTEM (Uses cached careers from localStorage)
    // =========================

    const generateCareerFallback = (country) => {
        // Try to load from localStorage first
        if (loadCareersFromLocalStorage(country)) {
            calculatePersonalityScores();
            console.log('✅ Using fallback careers from localStorage');
            return;
        }
        
        // If no careers in cache, show empty
        careers.value = [];
        calculatePersonalityScores();
        console.log('⚠️ No fallback careers available');
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
    
    // Set flag to indicate quiz was reset and needs fresh AI generation
    localStorage.setItem('quiz_just_completed', 'true');
    
    // Clear all country-specific caches
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
