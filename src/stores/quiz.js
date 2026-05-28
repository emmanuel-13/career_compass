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
    // SAVE CAREERS TO JSON-SERVER
    // =========================

    const saveCareersToJsonServer = async (newCareers) => {
        if (!newCareers || newCareers.length === 0) return;
        
        try {
            for (const career of newCareers) {
                const careerToSave = {
                    id: career.id,
                    slug: career.slug,
                    title: career.title,
                    icon: career.icon,
                    shortDescription: career.shortDescription,
                    description: career.description,
                    skills: career.skills,
                    traits: career.traits || [],
                    interests: career.interests || [],
                    personalityType: career.personalityType,
                    country: career.country,
                    requirements: career.requirements,
                    universities: career.universities,
                    salary: career.salary,
                    relatedCareers: career.relatedCareers,
                    pathway: career.pathway,
                    courses: career.courses || [],
                    degrees: career.degrees || [],
                    match: career.match,
                    aiGenerated: true
                };
                
                const checkResponse = await fetch(`${apiUrl}?slug=${career.slug}`).catch(() => null);
                if (checkResponse && checkResponse.ok) {
                    const existing = await checkResponse.json();
                    if (existing.length === 0) {
                        await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(careerToSave)
                        }).catch(() => {});
                        console.log(`✅ Saved to json-server: ${career.title}`);
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ Failed to save to json-server');
        }
    };

    // =========================
    // HELPER: GET COUNTRY-SPECIFIC REQUIREMENTS (for AI prompt)
    // =========================

    const getCountryRequirements = (country) => {
        const countryLower = country?.toLowerCase() || 'us';
        
        const requirements = {
            'nigeria': {
                examSystem: 'WAEC/NECO',
                examDescription: 'West African Senior School Certificate Examination (WASSCE) or NECO',
                additionalTests: ['Post-UTME (varies by university)'],
                currency: 'NGN',
                currencySymbol: '₦'
            },
            'ng': {
                examSystem: 'WAEC/NECO',
                examDescription: 'West African Senior School Certificate Examination (WASSCE) or NECO',
                additionalTests: ['Post-UTME (varies by university)'],
                currency: 'NGN',
                currencySymbol: '₦'
            },
            'us': {
                examSystem: 'SAT/ACT',
                examDescription: 'Scholastic Assessment Test (SAT) or American College Testing (ACT)',
                additionalTests: ['TOEFL/IELTS (for international students)'],
                currency: 'USD',
                currencySymbol: '$'
            },
            'uk': {
                examSystem: 'A-Levels',
                examDescription: 'General Certificate of Education Advanced Level (A-Levels)',
                additionalTests: ['IELTS/TOEFL for international students'],
                currency: 'GBP',
                currencySymbol: '£'
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
            error.value = "Failed to generate careers. Please try again.";
        } finally {
            isLoading.value = false;
        }
    };

    // =========================
    // AI CAREER GENERATION - FULL PROMPT
    // =========================

//     const generateCareerWithAI = async (country) => {
//         const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
        
//         if (!API_KEY) {
//             console.error("No API key found");
//             error.value = "API key not configured. Please contact support.";
//             return;
//         }

//         const countryLower = country?.toLowerCase() || 'us';
//         const config = getCountryRequirements(country);
        
//         // Calculate dominant personality
//         const personalityCounts = {};
//         answers.value.forEach(item => {
//             const type = item.option?.personalityType;
//             if (type) {
//                 personalityCounts[type] = (personalityCounts[type] || 0) + 1;
//             }
//         });
        
//         let dominantPersonality = "Technical Innovator";
//         let maxCount = 0;
//         for (const [type, count] of Object.entries(personalityCounts)) {
//             if (count > maxCount) {
//                 maxCount = count;
//                 dominantPersonality = type;
//             }
//         }

//         // Map personality to career categories
//         let personalityCategory = "Technology";
//         if (dominantPersonality === "Creative Communicator") personalityCategory = "Arts, Media, Communication";
//         else if (dominantPersonality === "Healthcare Helper") personalityCategory = "Healthcare, Medicine";
//         else if (dominantPersonality === "Business Leader") personalityCategory = "Business, Finance, Law";

//         // COMPLETE AI PROMPT - Asks for ALL data
//         const prompt = `You are a career expert for ${country.toUpperCase()}. 

// Based on the user's personality type (${dominantPersonality}), recommend 5 careers in the ${personalityCategory} field.

// For EACH career, provide COMPLETE information in the following JSON format. Return ONLY valid JSON, no other text.

// {
//   "recommendations": [
//     {
//       "title": "",
//       "slug": "",
//       "icon": "",
//       "shortDescription": "",
//       "description": "",
//       "skills": [],
//       "traits": [],
//       "interests": [],
//       "personalityType": "${dominantPersonality}",
//       "requirements": {
//         "examSystem": "${config.examSystem}",
//         "examSubjects": [],
//         "jambSubjects": [],
//         "examDescription": "${config.examDescription}",
//         "additionalTests": ${JSON.stringify(config.additionalTests)}
//       },
//       "universities": [
//         {"name": "", "ranking": "", "programName": ""}
//       ],
//       "salary": {
//         "entry": 0,
//         "midMin": 0,
//         "midMax": 0,
//         "senior": 0,
//         "currency": "${config.currency}",
//         "period": "year"
//       },
//       "relatedCareers": [],
//       "pathway": [
//         {"step": 1, "title": "", "duration": "", "description": ""}
//       ],
//       "courses": [
//         {"name": "", "platform": "", "description": "", "url": ""}
//       ],
//       "degrees": []
//     }
//   ]
// }

// Requirements for ${country.toUpperCase()}:
// - Exam System: ${config.examSystem}
// - Currency: ${config.currency} (${config.currencySymbol})
// - Use REAL university names in ${country.toUpperCase()}
// - Use REAL salary ranges in ${config.currency}
// - For Engineering careers, exam subjects should include Mathematics, Physics, Chemistry
// - For Medical careers, exam subjects should include Biology, Chemistry, Physics
// - For Business careers, exam subjects should include Mathematics, Economics, Accounting
// - For Arts careers, exam subjects should include English, Literature, Government

// Make all data REALISTIC and ACCURATE for ${country.toUpperCase()}.`;

//         try {
//             const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${API_KEY}`,
//                     "HTTP-Referer": "https://career-compass-v906.onrender.com",
//                     "X-Title": "Career AI Platform"
//                 },
//                 body: JSON.stringify({
//                     model: "deepseek/deepseek-chat",
//                     // Change this line in the API call:
//                     // model: "google/gemini-2.0-flash-lite-preview-02-05",  // Free tier model
//                     messages: [
//                         {
//                             role: "system",
//                             content: `You are a career expert for ${country.toUpperCase()}. Return ONLY valid JSON. Provide COMPLETE, REALISTIC data. Include 5 careers. Use real university names and real salary ranges in ${config.currency}.`
//                         },
//                         { role: "user", content: prompt }
//                     ],
//                     temperature: 0.7,
//                     max_tokens: 4000
//                 })
//             });

//             if (!response.ok) {
//                 console.error(`API Error: ${response.status}`);
//                 error.value = `API Error: ${response.status}. Please try again.`;
//                 return;
//             }

//             const data = await response.json();
//             let aiText = data.choices[0].message.content;
            
//             // Clean JSON
//             aiText = aiText.replace(/```json\s*|\s*```/g, '').trim();
//             const jsonMatch = aiText.match(/\{[\s\S]*\}/);
//             if (jsonMatch) aiText = jsonMatch[0];
            
//             const parsed = JSON.parse(aiText);
//             if (!parsed.recommendations || parsed.recommendations.length === 0) {
//                 throw new Error("Invalid response from AI");
//             }

//             const recommendedCareers = parsed.recommendations.slice(0, 5).map((aiCareer, index) => {
//                 // Ensure salary has all required fields
//                 const salary = aiCareer.salary || {};
                
//                 return {
//                     id: Date.now() + index + Math.random(),
//                     slug: aiCareer.slug || aiCareer.title?.toLowerCase().replace(/\s+/g, '-') || `career-${index}`,
//                     title: aiCareer.title || "Career Title",
//                     icon: aiCareer.icon || getIconForCareer(aiCareer.title),
//                     shortDescription: aiCareer.shortDescription || "",
//                     description: aiCareer.description || "No description available",
//                     skills: aiCareer.skills || [],
//                     traits: aiCareer.traits || [],
//                     interests: aiCareer.interests || [],
//                     personalityType: dominantPersonality,
//                     country: countryLower === 'ng' ? 'ng' : countryLower,
//                     requirements: {
//                         examSystem: aiCareer.requirements?.examSystem || config.examSystem,
//                         examSubjects: aiCareer.requirements?.examSubjects || ['English', 'Mathematics', 'Science'],
//                         jambSubjects: aiCareer.requirements?.jambSubjects || [],
//                         examDescription: aiCareer.requirements?.examDescription || config.examDescription,
//                         additionalTests: aiCareer.requirements?.additionalTests || config.additionalTests
//                     },
//                     universities: aiCareer.universities || [],
//                     salary: {
//                         entry: salary.entry || 0,
//                         midMin: salary.midMin || salary.min || 0,
//                         midMax: salary.midMax || salary.max || 0,
//                         senior: salary.senior || 0,
//                         currency: salary.currency || config.currency,
//                         period: salary.period || "year"
//                     },
//                     relatedCareers: aiCareer.relatedCareers || [],
//                     pathway: aiCareer.pathway || [],
//                     courses: aiCareer.courses || [],
//                     degrees: aiCareer.degrees || [],
//                     match: 85,
//                     aiGenerated: true
//                 };
//             });

//             careers.value = recommendedCareers.sort((a, b) => b.match - a.match).slice(0, 5);
            
//             // Save to localStorage and json-server
//             saveCareersToLocalStorage();
//             await saveCareersToJsonServer(recommendedCareers);
//             calculatePersonalityScores();
            
//             console.log(`✅ AI generated ${careers.value.length} careers for ${country}`);
            
//         } catch (error) {
//             console.error("AI error:", error);
//             error.value = "Failed to get AI recommendations. Please try again.";
//         }
//     };

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

    const prompt = `You are a career expert for ${country.toUpperCase()}. 

Based on the user's personality (${dominantPersonality}), recommend 3 careers.

For EACH career, provide: title, slug, shortDescription, description, and skills array.

Return ONLY valid JSON in this format:
{
  "recommendations": [
    {
      "title": "",
      "slug": "",
      "shortDescription": "",
      "description": "",
      "skills": []
    }
  ]
}`;

    try {
        console.log("Calling OpenRouter API with key:", API_KEY.substring(0, 20) + "...");
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Career AI Platform"
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",  // Most reliable model
                messages: [
                    {
                        role: "system",
                        content: "You are a career expert. Return ONLY valid JSON. No markdown, no extra text."
                    },
                    { 
                        role: "user", 
                        content: prompt 
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        console.log("API Response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Body:", errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);
        
        let aiText = data.choices[0].message.content;
        console.log("Raw AI response:", aiText);
        
        aiText = aiText.replace(/```json\s*|\s*```/g, '').trim();
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) aiText = jsonMatch[0];
        
        const parsed = JSON.parse(aiText);
        if (!parsed.recommendations) throw new Error("Invalid response");

        // Get fallback data for complete fields
        const fallbackCareers = getFallbackCareers(country, dominantPersonality);
        
        const recommendedCareers = parsed.recommendations.slice(0, 3).map((aiCareer, index) => {
            const fallback = fallbackCareers[index % fallbackCareers.length];
            
            return {
                id: Date.now() + index + Math.random(),
                slug: aiCareer.slug || fallback.slug,
                title: aiCareer.title || fallback.title,
                icon: fallback.icon,
                shortDescription: aiCareer.shortDescription || fallback.shortDescription,
                description: aiCareer.description || fallback.description,
                skills: aiCareer.skills || fallback.skills,
                traits: fallback.traits || [],
                interests: fallback.interests || [],
                personalityType: dominantPersonality,
                country: countryLower === 'ng' ? 'ng' : 'us',
                requirements: fallback.requirements || {
                    examSystem: config.examSystem,
                    examSubjects: config.examSubjects,
                    jambSubjects: config.jambSubjects,
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: fallback.universities || [],
                salary: fallback.salary || {
                    entry: 0,
                    midMin: 0,
                    midMax: 0,
                    senior: 0,
                    currency: config.currency,
                    period: "year"
                },
                relatedCareers: fallback.relatedCareers || [],
                pathway: fallback.pathway || [],
                courses: fallback.courses || [],
                degrees: fallback.degrees || [],
                match: 85,
                aiGenerated: true
            };
        });

        careers.value = recommendedCareers.sort((a, b) => b.match - a.match).slice(0, 3);
        
        saveCareersToLocalStorage();
        await saveCareersToJsonServer(recommendedCareers);
        calculatePersonalityScores();
        
        console.log(`✅ AI generated ${careers.value.length} careers for ${country}`);
        
    } catch (error) {
        console.error("AI error:", error);
        generateCareerFallback(country);
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
