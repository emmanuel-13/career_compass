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
    // LOCAL STORAGE FUNCTIONS (DEFINED FIRST)
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
    // GET COUNTRY-SPECIFIC REQUIREMENTS
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
                currencySymbol: '₦'
            },
            'ng': {
                examSystem: 'WAEC/NECO',
                examSubjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
                jambSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry'],
                examDescription: 'West African Senior School Certificate Examination (WASSCE) or NECO',
                additionalTests: ['Post-UTME (varies by university)'],
                currency: 'NGN',
                currencySymbol: '₦'
            },
            'us': {
                examSystem: 'SAT/ACT',
                examSubjects: ['English', 'Mathematics', 'Science', 'Optional Essay'],
                jambSubjects: [],
                examDescription: 'Scholastic Assessment Test (SAT) or American College Testing (ACT)',
                additionalTests: ['TOEFL/IELTS (for international students)'],
                currency: 'USD',
                currencySymbol: '$'
            },
            'uk': {
                examSystem: 'A-Levels',
                examSubjects: ['3-4 subjects related to career field'],
                jambSubjects: [],
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
        if (t.includes('teacher')) return '📚';
        if (t.includes('business') || t.includes('manager')) return '📋';
        if (t.includes('designer')) return '🎨';
        if (t.includes('writer')) return '✍️';
        if (t.includes('lawyer')) return '⚖️';
        return '🎯';
    };

    // =========================
    // CALCULATE PERSONALITY SCORES
    // =========================

    const calculatePersonalityScores = () => {
        const personalityCounts = {};
        answers.value.forEach(answer => {
            const type = answer.option?.personalityType;
            if (type) {
                personalityCounts[type] = (personalityCounts[type] || 0) + 1;
            }
        });
        
        const total = answers.value.length || 1;
        personalityScores.value = Object.entries(personalityCounts).map(
            ([name, score]) => ({
                name,
                score: Math.round((score / total) * 100)
            })
        );
    };

    // =========================
    // CALCULATE MATCH SCORE
    // =========================

    const calculateMatchScore = (career) => {
        let score = 0;
        let totalPossible = 0;
        
        answers.value.forEach(answer => {
            const userOption = answer.option;
            if (!userOption) return;
            
            totalPossible += 30;
            if (userOption.personalityType === career.personalityType) {
                score += 30;
            }
            
            if (userOption.traits && userOption.traits.length > 0) {
                totalPossible += 35;
                let traitMatches = 0;
                userOption.traits.forEach(userTrait => {
                    if (career.traits && career.traits.some(t => t.toLowerCase() === userTrait.toLowerCase())) {
                        traitMatches++;
                    }
                });
                score += (traitMatches / userOption.traits.length) * 35;
            }
            
            if (userOption.interests && userOption.interests.length > 0) {
                totalPossible += 35;
                let interestMatches = 0;
                userOption.interests.forEach(userInterest => {
                    if (career.interests && career.interests.some(i => i.toLowerCase() === userInterest.toLowerCase())) {
                        interestMatches++;
                    }
                });
                score += (interestMatches / userOption.interests.length) * 35;
            }
        });
        
        const finalScore = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
        return Math.min(finalScore, 100);
    };

    // =========================
    // PROCESS AI RESPONSE
    // =========================
    
    const processAIResponse = (data, country, config, dominantPersonality, userTraits, userInterests) => {
        let aiText = data.choices[0].message.content;
        console.log("Raw AI response:", aiText);
        
        aiText = aiText.replace(/```json\s*|\s*```/g, '').trim();
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) aiText = jsonMatch[0];
        
        const parsed = JSON.parse(aiText);
        if (!parsed.recommendations || parsed.recommendations.length === 0) {
            throw new Error("Invalid response from AI");
        }
        
        const countryLower = country?.toLowerCase() === 'nigeria' || country?.toLowerCase() === 'ng' ? 'nigeria' : 'us';
        
        const recommendedCareers = parsed.recommendations.slice(0, 3).map((aiCareer, index) => {
            // Calculate match score based on user's actual answers
            const matchScore = calculateMatchScore({
                personalityType: aiCareer.personalityType || dominantPersonality,
                traits: aiCareer.traits || [],
                interests: aiCareer.interests || []
            });
            
            // Country-specific data
            const universities = countryLower === 'nigeria' ? [
                { name: 'University of Lagos', ranking: '1st in Nigeria', programName: `${aiCareer.title} Degree` },
                { name: 'Obafemi Awolowo University', ranking: '2nd in Nigeria', programName: `${aiCareer.title} Degree` },
                { name: 'University of Ibadan', ranking: '3rd in Nigeria', programName: `${aiCareer.title} Degree` }
            ] : [
                { name: 'Harvard University', ranking: '1st in US', programName: `${aiCareer.title} Degree` },
                { name: 'Stanford University', ranking: '2nd in US', programName: `${aiCareer.title} Degree` },
                { name: 'MIT', ranking: '3rd in US', programName: `${aiCareer.title} Degree` }
            ];
            
            // Determine salary based on career type and country
            let salary;
            if (countryLower === 'nigeria') {
                if (aiCareer.title?.toLowerCase().includes('doctor') || aiCareer.title?.toLowerCase().includes('medical')) {
                    salary = { entry: 2400000, midMin: 4800000, midMax: 7200000, senior: 12000000, currency: 'NGN', period: 'year' };
                } else if (aiCareer.title?.toLowerCase().includes('software') || aiCareer.title?.toLowerCase().includes('engineer')) {
                    salary = { entry: 1200000, midMin: 2400000, midMax: 4200000, senior: 6000000, currency: 'NGN', period: 'year' };
                } else if (aiCareer.title?.toLowerCase().includes('business') || aiCareer.title?.toLowerCase().includes('manager')) {
                    salary = { entry: 1800000, midMin: 3000000, midMax: 5400000, senior: 9000000, currency: 'NGN', period: 'year' };
                } else {
                    salary = { entry: 1500000, midMin: 2800000, midMax: 4500000, senior: 6500000, currency: 'NGN', period: 'year' };
                }
            } else {
                if (aiCareer.title?.toLowerCase().includes('doctor') || aiCareer.title?.toLowerCase().includes('medical')) {
                    salary = { entry: 120000, midMin: 180000, midMax: 250000, senior: 350000, currency: 'USD', period: 'year' };
                } else if (aiCareer.title?.toLowerCase().includes('software') || aiCareer.title?.toLowerCase().includes('engineer')) {
                    salary = { entry: 85000, midMin: 110000, midMax: 150000, senior: 200000, currency: 'USD', period: 'year' };
                } else if (aiCareer.title?.toLowerCase().includes('business') || aiCareer.title?.toLowerCase().includes('manager')) {
                    salary = { entry: 60000, midMin: 80000, midMax: 110000, senior: 150000, currency: 'USD', period: 'year' };
                } else {
                    salary = { entry: 55000, midMin: 75000, midMax: 100000, senior: 130000, currency: 'USD', period: 'year' };
                }
            }
            
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
                personalityType: aiCareer.personalityType || dominantPersonality,
                country: countryLower === 'nigeria' ? 'ng' : 'us',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: config.examSubjects,
                    jambSubjects: config.jambSubjects,
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: universities,
                salary: salary,
                relatedCareers: [`Senior ${aiCareer.title}`, `${aiCareer.title} Consultant`, `${aiCareer.title} Manager`],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on relevant subjects for this career.' },
                    { step: 2, title: `Bachelor's Degree in ${aiCareer.title}`, duration: '4 years', description: `Complete a degree in ${aiCareer.title} or related field.` },
                    { step: 3, title: 'Gain Practical Experience', duration: '1-2 years', description: 'Intern or work in entry-level positions.' },
                    { step: 4, title: 'Professional Certification', duration: '1 year', description: 'Pursue industry-recognized certifications.' },
                    { step: 5, title: 'Career Advancement', duration: 'Ongoing', description: 'Progress to senior roles or specialization.' }
                ],
                courses: [
                    { name: `Introduction to ${aiCareer.title}`, platform: 'Coursera', description: `Learn the fundamentals of ${aiCareer.title}`, url: 'https://www.coursera.org' },
                    { name: `Advanced ${aiCareer.title} Skills`, platform: 'edX', description: `Master advanced concepts`, url: 'https://www.edx.org' },
                    { name: `${aiCareer.title} Certification Prep`, platform: 'Udemy', description: `Prepare for certification`, url: 'https://www.udemy.com' }
                ],
                degrees: [`Bachelor's in ${aiCareer.title}`, `Master's in ${aiCareer.title}`],
                match: matchScore,
                aiGenerated: true
            };
        });
        
        careers.value = recommendedCareers.sort((a, b) => b.match - a.match).slice(0, 3);
        
        saveCareersToLocalStorage();
        saveCareersToJsonServer(careers.value);
        calculatePersonalityScores();
        
        console.log(`✅ AI generated ${careers.value.length} careers`);
    };
    
    // =========================
    // INTELLIGENT FALLBACK (NO AI)
    // =========================
    
    const generateIntelligentFallback = (country, dominantPersonality, userTraits, userInterests, config) => {
        const countryLower = country?.toLowerCase() === 'nigeria' || country?.toLowerCase() === 'ng' ? 'nigeria' : 'us';
        
        const personalityCareers = {
            'Technical Innovator': [
                { title: 'Software Engineer', slug: 'software-engineer', icon: '💻', traits: ['analytical', 'logical', 'technical'], interests: ['technology', 'coding', 'problem-solving'] },
                { title: 'Data Scientist', slug: 'data-scientist', icon: '📊', traits: ['analytical', 'logical', 'detail-oriented'], interests: ['data', 'statistics', 'problem-solving'] },
                { title: 'Civil Engineer', slug: 'civil-engineer', icon: '🏗️', traits: ['analytical', 'practical', 'problem-solving'], interests: ['construction', 'design', 'engineering'] }
            ],
            'Creative Communicator': [
                { title: 'Content Creator', slug: 'content-creator', icon: '✍️', traits: ['creative', 'expressive', 'communicative'], interests: ['writing', 'social media', 'storytelling'] },
                { title: 'Graphic Designer', slug: 'graphic-designer', icon: '🎨', traits: ['creative', 'artistic', 'detail-oriented'], interests: ['design', 'art', 'digital media'] },
                { title: 'Journalist', slug: 'journalist', icon: '📰', traits: ['curious', 'communicative', 'detail-oriented'], interests: ['writing', 'news', 'research'] }
            ],
            'Healthcare Helper': [
                { title: 'Medical Doctor', slug: 'medical-doctor', icon: '👨‍⚕️', traits: ['compassionate', 'patient', 'observant'], interests: ['healthcare', 'medicine', 'helping others'] },
                { title: 'Registered Nurse', slug: 'registered-nurse', icon: '🩺', traits: ['compassionate', 'caring', 'patient'], interests: ['healthcare', 'patient care', 'helping others'] },
                { title: 'Pharmacist', slug: 'pharmacist', icon: '💊', traits: ['detail-oriented', 'responsible', 'caring'], interests: ['healthcare', 'science', 'medicine'] }
            ],
            'Business Leader': [
                { title: 'Business Administrator', slug: 'business-administrator', icon: '📋', traits: ['organized', 'decisive', 'strategic'], interests: ['business', 'management', 'leadership'] },
                { title: 'Project Manager', slug: 'project-manager', icon: '📊', traits: ['organized', 'leadership', 'problem-solver'], interests: ['management', 'planning', 'teamwork'] },
                { title: 'Marketing Manager', slug: 'marketing-manager', icon: '📈', traits: ['creative', 'strategic', 'communicative'], interests: ['marketing', 'advertising', 'branding'] }
            ]
        };
        
        const careersList = personalityCareers[dominantPersonality] || personalityCareers['Technical Innovator'];
        
        const careersWithMatches = careersList.map(career => {
            let score = 0;
            userTraits.forEach(trait => {
                if (career.traits.some(t => t.toLowerCase().includes(trait.toLowerCase()))) score += 15;
            });
            userInterests.forEach(interest => {
                if (career.interests.some(i => i.toLowerCase().includes(interest.toLowerCase()))) score += 15;
            });
            return { ...career, match: Math.min(score + 50, 100) };
        });
        
        careers.value = careersWithMatches.sort((a, b) => b.match - a.match).slice(0, 3).map((career, index) => ({
            id: Date.now() + index + Math.random(),
            ...career,
            country: countryLower === 'nigeria' ? 'ng' : 'us',
            shortDescription: `A rewarding career in ${career.title}`,
            description: `This career path offers excellent opportunities for growth and development.`,
            skills: ['Communication', 'Problem Solving', 'Teamwork'],
            requirements: {
                examSystem: config.examSystem,
                examSubjects: config.examSubjects,
                jambSubjects: config.jambSubjects,
                examDescription: config.examDescription,
                additionalTests: config.additionalTests
            },
            universities: countryLower === 'nigeria' ? [
                { name: 'University of Lagos', ranking: '1st', programName: `${career.title} Degree` },
                { name: 'Obafemi Awolowo University', ranking: '2nd', programName: `${career.title} Degree` }
            ] : [
                { name: 'Harvard University', ranking: '1st', programName: `${career.title} Degree` },
                { name: 'Stanford University', ranking: '2nd', programName: `${career.title} Degree` }
            ],
            salary: countryLower === 'nigeria' ? 
                { entry: 1500000, midMin: 3000000, midMax: 5000000, senior: 7000000, currency: 'NGN', period: 'year' } :
                { entry: 65000, midMin: 85000, midMax: 120000, senior: 150000, currency: 'USD', period: 'year' },
            relatedCareers: [`Senior ${career.title}`, `${career.title} Consultant`],
            pathway: [
                { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on relevant subjects.' },
                { step: 2, title: `Bachelor's Degree in ${career.title}`, duration: '4 years', description: `Complete a degree in ${career.title}.` },
                { step: 3, title: 'Gain Experience', duration: '1-2 years', description: 'Intern or work entry-level.' }
            ],
            courses: [
                { name: `Introduction to ${career.title}`, platform: 'Coursera', description: 'Learn fundamentals', url: 'https://www.coursera.org' },
                { name: `${career.title} Certification`, platform: 'edX', description: 'Get certified', url: 'https://www.edx.org' }
            ],
            degrees: [`Bachelor's in ${career.title}`, `Master's in ${career.title}`],
            aiGenerated: true
        }));
        
        saveCareersToLocalStorage();
        saveCareersToJsonServer(careers.value);
        calculatePersonalityScores();
        console.log(`✅ Generated ${careers.value.length} fallback careers for ${dominantPersonality}`);
    };

    // =========================
    // AI CAREER GENERATION
    // =========================

    const generateCareerWithAI = async (country) => {
        const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
        
        if (!API_KEY) {
            console.error("No API key found");
            error.value = "API key not configured";
            return;
        }

        const countryLower = country?.toLowerCase() || 'us';
        const config = getCountryRequirements(country);
        
        // Collect ALL user answers with their personality data
        const userAnswersData = answers.value.map(answer => ({
            questionId: answer.questionId,
            selectedAnswer: answer.option.text,
            personalityType: answer.option.personalityType,
            traits: answer.option.traits || [],
            interests: answer.option.interests || []
        }));
        
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
        
        // Collect all traits and interests
        const allTraits = [];
        const allInterests = [];
        answers.value.forEach(answer => {
            if (answer.option?.traits) allTraits.push(...answer.option.traits);
            if (answer.option?.interests) allInterests.push(...answer.option.interests);
        });
        const uniqueTraits = [...new Set(allTraits)];
        const uniqueInterests = [...new Set(allInterests)];
        
        console.log(`🎯 Dominant Personality: ${dominantPersonality}`);
        console.log(`📋 Traits: ${uniqueTraits.join(', ')}`);
        console.log(`💡 Interests: ${uniqueInterests.join(', ')}`);
        
        const prompt = `You are an expert career counselor. Based on the user's quiz responses, recommend 3 careers that perfectly match their personality, traits, and interests.

USER'S QUIZ RESULTS:
- Primary Personality Type: ${dominantPersonality}
- Key Traits: ${uniqueTraits.join(', ')}
- Key Interests: ${uniqueInterests.join(', ')}

DETAILED ANSWERS:
${JSON.stringify(userAnswersData, null, 2)}

Based on this information, recommend 3 careers that would be an excellent fit.

Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "title": "",
      "slug": "",
      "shortDescription": "One sentence summary",
      "description": "2-3 sentence detailed description",
      "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "traits": ["trait1", "trait2", "trait3"],
      "interests": ["interest1", "interest2", "interest3"],
      "personalityType": "${dominantPersonality}"
    }
  ]
}`;

        try {
            console.log("🚀 Calling OpenRouter AI...");
            
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "Career AI Platform"
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert career counselor. Return ONLY valid JSON. Use the user's personality type, traits, and interests to recommend matching careers."
                        },
                        { 
                            role: "user", 
                            content: prompt 
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                
                if (response.status === 402 || response.status === 404) {
                    console.log("Trying fallback model...");
                    const fallbackResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${API_KEY}`,
                            "HTTP-Referer": "http://localhost:5173",
                            "X-Title": "Career AI Platform"
                        },
                        body: JSON.stringify({
                            model: "meta-llama/llama-3.2-3b-instruct",
                            messages: [
                                {
                                    role: "system",
                                    content: "You are an expert career counselor. Return ONLY valid JSON."
                                },
                                { role: "user", content: prompt }
                            ],
                            temperature: 0.7,
                            max_tokens: 1200
                        })
                    });
                    
                    if (!fallbackResponse.ok) {
                        throw new Error(`Fallback API also failed: ${fallbackResponse.status}`);
                    }
                    
                    const fallbackData = await fallbackResponse.json();
                    processAIResponse(fallbackData, country, config, dominantPersonality, uniqueTraits, uniqueInterests);
                    return;
                }
                
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            processAIResponse(data, country, config, dominantPersonality, uniqueTraits, uniqueInterests);
            
        } catch (error) {
            console.error("AI error:", error);
            error.value = "AI service unavailable. Please try again later.";
            generateIntelligentFallback(country, dominantPersonality, uniqueTraits, uniqueInterests, config);
        }
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
                console.log("🤖 Generating AI-powered career recommendations...");
                await generateCareerWithAI(country);
                localStorage.removeItem('quiz_just_completed');
            } else {
                console.log("📦 Loading cached careers");
                const loaded = loadCareersFromLocalStorage(country);
                
                if (!loaded || careers.value.length === 0) {
                    console.log("⚠️ No cache found, using AI");
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
    // INITIALIZE (CALLED AFTER ALL FUNCTIONS ARE DEFINED)
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
