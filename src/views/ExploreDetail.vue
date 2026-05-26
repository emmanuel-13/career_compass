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
            console.log(`💾 Saved ${careers.value.length} careers for ${countryKey}`);
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
                    console.log(`✅ Loaded ${savedCareers.length} careers for ${countryKey}`);
                    return true;
                }
            }
        }
        
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
                
                const checkResponse = await fetch(`${apiUrl}?slug=${career.slug}`);
                if (checkResponse.ok) {
                    const existing = await checkResponse.json();
                    if (existing.length === 0) {
                        await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(careerToSave)
                        });
                        console.log(`✅ Saved to json-server: ${career.title}`);
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ Failed to save to json-server:', error.message);
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
                    { id: 1, title: 'Software Engineer', slug: 'software-engineer', icon: '💻', shortDescription: 'Build and maintain software applications', description: 'Software engineers design, develop, and test software applications that power modern businesses.', skills: ['Programming', 'Problem Solving', 'Debugging', 'Teamwork', 'Communication'], traits: ['Analytical', 'Detail-oriented', 'Logical'], interests: ['Technology', 'Problem-solving', 'Innovation'], match: 85, aiGenerated: true, country: 'us' }
                ],
                'creative communicator': [
                    { id: 1, title: 'Content Writer', slug: 'content-writer', icon: '✍️', shortDescription: 'Create engaging content for brands', description: 'Content writers produce articles, blogs, and social media content that engages audiences.', skills: ['Writing', 'SEO', 'Research', 'Editing', 'Creativity'], traits: ['Creative', 'Empathetic', 'Detail-oriented'], interests: ['Writing', 'Reading', 'Storytelling'], match: 85, aiGenerated: true, country: 'us' }
                ],
                'healthcare helper': [
                    { id: 1, title: 'Registered Nurse', slug: 'registered-nurse', icon: '🩺', shortDescription: 'Provide patient care', description: 'Nurses care for patients in hospitals, clinics, and other healthcare settings.', skills: ['Patient Care', 'Empathy', 'Medical Knowledge', 'Communication', 'Critical Thinking'], traits: ['Compassionate', 'Patient', 'Observant'], interests: ['Helping others', 'Healthcare', 'Science'], match: 85, aiGenerated: true, country: 'us' }
                ],
                'business leader': [
                    { id: 1, title: 'Project Manager', slug: 'project-manager', icon: '📋', shortDescription: 'Lead projects to success', description: 'Project managers plan, execute, and close projects across various industries.', skills: ['Leadership', 'Planning', 'Communication', 'Risk Management', 'Budgeting'], traits: ['Organized', 'Decisive', 'Motivated'], interests: ['Management', 'Strategy', 'Teamwork'], match: 85, aiGenerated: true, country: 'us' }
                ]
            },
            'nigeria': {
                'technical innovator': [
                    { id: 1, title: 'Software Developer', slug: 'software-developer', icon: '💻', shortDescription: 'Build software solutions', description: 'Software developers create applications and systems that solve real-world problems.', skills: ['Programming', 'Problem Solving', 'Teamwork', 'Debugging', 'Communication'], traits: ['Analytical', 'Logical', 'Innovative'], interests: ['Technology', 'Coding', 'Innovation'], match: 85, aiGenerated: true, country: 'ng' }
                ],
                'creative communicator': [
                    { id: 1, title: 'Content Creator', slug: 'content-creator', icon: '✍️', shortDescription: 'Create digital content', description: 'Content creators produce engaging content for social media and websites.', skills: ['Writing', 'Video Editing', 'Creativity', 'Social Media', 'Storytelling'], traits: ['Creative', 'Expressive', 'Empathetic'], interests: ['Content creation', 'Social media', 'Storytelling'], match: 85, aiGenerated: true, country: 'ng' }
                ],
                'healthcare helper': [
                    { id: 1, title: 'Nurse', slug: 'nurse', icon: '🩺', shortDescription: 'Provide patient care', description: 'Nurses provide essential healthcare services in hospitals and clinics.', skills: ['Patient Care', 'Empathy', 'Medical Knowledge', 'Communication', 'Critical Thinking'], traits: ['Compassionate', 'Patient', 'Observant'], interests: ['Healthcare', 'Helping others', 'Science'], match: 85, aiGenerated: true, country: 'ng' }
                ],
                'business leader': [
                    { id: 1, title: 'Business Administrator', slug: 'business-administrator', icon: '📋', shortDescription: 'Manage business operations', description: 'Business administrators oversee daily operations and strategic planning.', skills: ['Management', 'Finance', 'Leadership', 'Communication', 'Planning'], traits: ['Organized', 'Decisive', 'Strategic'], interests: ['Business', 'Management', 'Leadership'], match: 85, aiGenerated: true, country: 'ng' }
                ]
            }
        };
        
        const countryData = fallbacks[countryLower];
        let careersList = countryData[personalityKey] || countryData['technical innovator'];
        
        // Add complete structure for fallback careers
        return careersList.map(career => ({
            ...career,
            requirements: {
                examSystem: countryLower === 'nigeria' ? 'WAEC/NECO' : 'SAT/ACT',
                examSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Physics', 'Chemistry'] : ['English', 'Mathematics', 'Science'],
                jambSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Physics', 'Chemistry'] : [],
                examDescription: countryLower === 'nigeria' ? 'West African Senior School Certificate Examination' : 'Scholastic Assessment Test',
                additionalTests: countryLower === 'nigeria' ? ['Post-UTME'] : ['TOEFL/IELTS']
            },
            universities: [
                { name: countryLower === 'nigeria' ? 'University of Lagos' : 'MIT', ranking: 'Top 1', programName: `${career.title} Degree` },
                { name: countryLower === 'nigeria' ? 'Obafemi Awolowo University' : 'Stanford University', ranking: 'Top 2', programName: `${career.title} Degree` },
                { name: countryLower === 'nigeria' ? 'University of Ibadan' : 'Harvard University', ranking: 'Top 3', programName: `${career.title} Degree` }
            ],
            salary: {
                entry: countryLower === 'nigeria' ? 1200000 : 50000,
                midMin: countryLower === 'nigeria' ? 1800000 : 70000,
                midMax: countryLower === 'nigeria' ? 3000000 : 90000,
                senior: countryLower === 'nigeria' ? 5000000 : 120000,
                currency: countryLower === 'nigeria' ? 'NGN' : 'USD',
                period: 'year'
            },
            relatedCareers: ['Related Career 1', 'Related Career 2', 'Related Career 3'],
            pathway: [
                { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on relevant subjects.' },
                { step: 2, title: 'Earn Bachelor\'s Degree', duration: '4 years', description: `Complete a degree in ${career.title}.` },
                { step: 3, title: 'Gain Experience', duration: '2 years', description: 'Intern or work entry-level.' },
                { step: 4, title: 'Advanced Certification', duration: '1-2 years', description: 'Pursue professional certifications.' },
                { step: 5, title: 'Career Advancement', duration: 'Ongoing', description: 'Progress to senior roles.' }
            ],
            courses: [
                { name: 'Introduction to Career Success', platform: 'Coursera', description: 'Learn foundational skills.', url: 'https://www.coursera.org' },
                { name: 'Professional Development', platform: 'LinkedIn Learning', description: 'Enhance your career skills.', url: 'https://www.linkedin.com/learning' },
                { name: 'Industry Certification Prep', platform: 'Udemy', description: 'Prepare for certification.', url: 'https://www.udemy.com' }
            ],
            degrees: [`Bachelor of ${career.title}`, `Master of ${career.title}`]
        }));
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

        // COMPLETE PROMPT - Ask AI for ALL fields
        const prompt = `You are a career expert for ${country.toUpperCase()}. 

Based on the user's personality (${dominantPersonality}), recommend 3 careers.

For EACH career, provide COMPLETE information with ALL these fields. Return ONLY valid JSON:

{
  "recommendations": [
    {
      "title": "",
      "slug": "",
      "icon": "",
      "shortDescription": "",
      "description": "",
      "skills": [],
      "traits": [],
      "interests": [],
      "personalityType": "${dominantPersonality}",
      "requirements": {
        "examSystem": "",
        "examSubjects": [],
        "jambSubjects": [],
        "examDescription": "",
        "additionalTests": []
      },
      "universities": [
        {"name": "", "ranking": "", "programName": ""}
      ],
      "salary": {
        "entry": 0,
        "midMin": 0,
        "midMax": 0,
        "senior": 0,
        "currency": "",
        "period": "year"
      },
      "relatedCareers": [],
      "pathway": [
        {"step": 1, "title": "", "duration": "", "description": ""},
        {"step": 2, "title": "", "duration": "", "description": ""},
        {"step": 3, "title": "", "duration": "", "description": ""},
        {"step": 4, "title": "", "duration": "", "description": ""},
        {"step": 5, "title": "", "duration": "", "description": ""}
      ],
      "courses": [
        {"name": "", "platform": "", "description": "", "url": ""}
      ],
      "degrees": []
    }
  ]
}

Make all data REALISTIC and ACCURATE for ${country.toUpperCase()}. Use local currency (${config.currency}) and real university names.`;

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
                            content: `You are a career expert for ${country.toUpperCase()}. Provide COMPLETE, REALISTIC career data with all requested fields. Return ONLY valid JSON.`
                        },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 3000
                })
            });

            if (!response.ok) {
                console.warn(`API Error: ${response.status}, using fallback`);
                generateCareerFallback(country);
                return false;
            }

            const data = await response.json();
            let aiText = data.choices[0].message.content;
            
            aiText = aiText.replace(/```json\s*|\s*```/g, '').trim();
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) aiText = jsonMatch[0];
            
            const parsed = JSON.parse(aiText);
            if (!parsed.recommendations) throw new Error("Invalid response");

            const recommendedCareers = parsed.recommendations.slice(0, 3).map((aiCareer, index) => {
                return {
                    id: Date.now() + index + Math.random(),
                    slug: aiCareer.slug || aiCareer.title?.toLowerCase().replace(/\s+/g, '-') || `career-${index}`,
                    title: aiCareer.title || "Career Title",
                    icon: aiCareer.icon || getIconForCareer(aiCareer.title),
                    shortDescription: aiCareer.shortDescription || "",
                    description: aiCareer.description || "No description available",
                    skills: aiCareer.skills || [],
                    traits: aiCareer.traits || [],
                    interests: aiCareer.interests || [],
                    personalityType: dominantPersonality,
                    country: countryLower,
                    requirements: {
                        examSystem: aiCareer.requirements?.examSystem || config.examSystem,
                        examSubjects: aiCareer.requirements?.examSubjects || config.examSubjects,
                        jambSubjects: aiCareer.requirements?.jambSubjects || config.jambSubjects,
                        examDescription: aiCareer.requirements?.examDescription || config.examDescription,
                        additionalTests: aiCareer.requirements?.additionalTests || config.additionalTests
                    },
                    universities: aiCareer.universities || [],
                    salary: {
                        entry: aiCareer.salary?.entry || config.salaryRange.min,
                        midMin: aiCareer.salary?.midMin || config.salaryRange.min,
                        midMax: aiCareer.salary?.midMax || config.salaryRange.max,
                        senior: aiCareer.salary?.senior || config.salaryRange.max,
                        currency: aiCareer.salary?.currency || config.currency,
                        period: aiCareer.salary?.period || "year"
                    },
                    relatedCareers: aiCareer.relatedCareers || [],
                    pathway: aiCareer.pathway || [],
                    courses: aiCareer.courses || [],
                    degrees: aiCareer.degrees || [],
                    match: 85,
                    aiGenerated: true
                };
            });

            careers.value = recommendedCareers.sort((a, b) => b.match - a.match).slice(0, 3);
            
            saveCareersToLocalStorage();
            await saveCareersToJsonServer(recommendedCareers).catch(e => console.log('JSON-server save skipped:', e.message));
            calculatePersonalityScores();
            
            console.log("✅ AI careers generated:", careers.value.length);
            return true;
            
        } catch (error) {
            console.error("AI error:", error);
            generateCareerFallback(country);
            return false;
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
        saveCareersToJsonServer(careers.value);
        calculatePersonalityScores();
        console.log('✅ Using fallback careers');
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
