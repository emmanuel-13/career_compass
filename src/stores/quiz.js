// =========================
// AI CAREER GENERATION - IMPROVED WITH PERSONALITY FORCING
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
    
    // Calculate dominant personality and collect user's actual answers
    const personalityCounts = {};
    const userTraits = [];
    const userInterests = [];
    
    answers.value.forEach(item => {
        const type = item.option?.personalityType;
        if (type) {
            personalityCounts[type] = (personalityCounts[type] || 0) + 1;
        }
        if (item.option?.traits) {
            userTraits.push(...item.option.traits);
        }
        if (item.option?.interests) {
            userInterests.push(...item.option.interests);
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
    
    // Map personality to career categories with specific examples
    const personalityCareerMap = {
        'Technical Innovator': {
            categories: ['Engineering', 'Technology', 'Software Development', 'Data Science', 'IT'],
            exampleCareers: ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Software Architect', 'DevOps Engineer'],
            forbidden: ['Doctor', 'Nurse', 'Teacher', 'Artist', 'Lawyer', 'Journalist']
        },
        'Creative Communicator': {
            categories: ['Arts', 'Media', 'Communication', 'Design', 'Writing', 'Journalism'],
            exampleCareers: ['Graphic Designer', 'Content Writer', 'Journalist', 'Public Relations Specialist', 'Video Editor'],
            forbidden: ['Software Engineer', 'Data Scientist', 'Doctor', 'Accountant', 'Civil Engineer']
        },
        'Healthcare Helper': {
            categories: ['Healthcare', 'Medicine', 'Nursing', 'Pharmacy', 'Public Health', 'Psychology'],
            exampleCareers: ['Medical Doctor', 'Registered Nurse', 'Pharmacist', 'Physiotherapist', 'Clinical Psychologist'],
            forbidden: ['Software Engineer', 'Data Scientist', 'Accountant', 'Civil Engineer', 'Graphic Designer']
        },
        'Business Leader': {
            categories: ['Business', 'Finance', 'Management', 'Marketing', 'Entrepreneurship', 'Accounting'],
            exampleCareers: ['Business Administrator', 'Financial Analyst', 'Marketing Manager', 'Project Manager', 'Accountant'],
            forbidden: ['Doctor', 'Nurse', 'Software Engineer', 'Graphic Designer', 'Journalist']
        }
    };
    
    const personalityInfo = personalityCareerMap[dominantPersonality];
    
    // Get the user's actual answers for context
    const userAnswersSummary = answers.value.map(item => ({
        questionId: item.questionId,
        answer: item.option?.text,
        selectedTraits: item.option?.traits || [],
        selectedInterests: item.option?.interests || []
    }));
    
    // STRONG PROMPT with personality forcing
    const prompt = `You are a career expert. The user has a ${dominantPersonality} personality type.

CRITICAL RULES:
- The user's personality is ${dominantPersonality}. You MUST recommend careers from these categories ONLY: ${personalityInfo.categories.join(', ')}
- DO NOT recommend: ${personalityInfo.forbidden.join(', ')}
- Example careers for this personality: ${personalityInfo.exampleCareers.join(', ')}

User's answers:
${JSON.stringify(userAnswersSummary, null, 2)}

User's collected traits: ${userTraits.join(', ')}
User's interests: ${userInterests.join(', ')}

Based on their specific answers, recommend 3 careers that match their ${dominantPersonality} personality.

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
        console.log(`🎯 Generating careers for personality: ${dominantPersonality}`);
        console.log(`📋 Forbidden careers: ${personalityInfo.forbidden.join(', ')}`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
                        content: `You are a career expert. The user has a ${dominantPersonality} personality type. You MUST recommend careers ONLY from these categories: ${personalityInfo.categories.join(', ')}. NEVER recommend careers like: ${personalityInfo.forbidden.join(', ')}. Return ONLY valid JSON.`
                    },
                    { 
                        role: "user", 
                        content: prompt 
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            console.warn(`API Error: ${response.status}, using personality-based database`);
            generatePersonalityBasedCareers(country);
            return;
        }

        const data = await response.json();
        let aiText = data.choices[0].message.content;
        
        aiText = aiText.replace(/```json\s*|\s*```/g, '').trim();
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) aiText = jsonMatch[0];
        
        const parsed = JSON.parse(aiText);
        if (!parsed.recommendations || parsed.recommendations.length === 0) {
            throw new Error("Invalid response");
        }

        // Get complete career data from database to merge with AI results
        const dbCareers = getCareersByPersonality(dominantPersonality, country);
        
        const recommendedCareers = parsed.recommendations.slice(0, 3).map((aiCareer, index) => {
            // Find matching database career or use first one
            const dbCareer = dbCareers.find(c => 
                c.title.toLowerCase().includes(aiCareer.title?.toLowerCase().split(' ')[0] || '')
            ) || dbCareers[index % dbCareers.length];
            
            return {
                id: Date.now() + index + Math.random(),
                slug: aiCareer.slug || dbCareer.slug,
                title: aiCareer.title || dbCareer.title,
                icon: dbCareer.icon,
                shortDescription: aiCareer.shortDescription || dbCareer.shortDescription,
                description: aiCareer.description || dbCareer.description,
                skills: aiCareer.skills || dbCareer.skills,
                traits: dbCareer.traits,
                interests: dbCareer.interests,
                personalityType: dominantPersonality,
                country: countryLower === 'ng' ? 'ng' : 'us',
                requirements: dbCareer.requirements,
                universities: dbCareer.universities,
                salary: dbCareer.salary,
                relatedCareers: dbCareer.relatedCareers,
                pathway: dbCareer.pathway,
                courses: dbCareer.courses,
                degrees: dbCareer.degrees,
                match: calculateMatchScore(dbCareer),
                aiGenerated: true
            };
        });

        careers.value = recommendedCareers.sort((a, b) => b.match - a.match).slice(0, 3);
        
        saveCareersToLocalStorage();
        await saveCareersToJsonServer(recommendedCareers);
        calculatePersonalityScores();
        
        console.log(`✅ AI generated ${careers.value.length} careers for ${dominantPersonality} personality`);
        
    } catch (error) {
        console.error("AI error:", error);
        generatePersonalityBasedCareers(country);
    }
};

// =========================
// PERSONALITY-BASED CAREER DATABASE (FALLBACK)
// =========================

const getCareersByPersonality = (personalityType, country) => {
    const countryLower = country?.toLowerCase() === 'nigeria' || country?.toLowerCase() === 'ng' ? 'nigeria' : 'us';
    const config = getCountryRequirements(country);
    
    const careerDatabase = {
        'Technical Innovator': [
            {
                title: 'Software Developer',
                slug: 'software-developer',
                icon: '💻',
                shortDescription: 'Build innovative software solutions',
                description: 'Software developers create applications, websites, and systems that solve real-world problems.',
                skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Database Management'],
                traits: ['Analytical', 'Logical', 'Creative', 'Problem-solving'],
                interests: ['Technology', 'Coding', 'Problem-solving', 'Innovation'],
                personalityType: 'Technical Innovator',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Physics', 'Computer Studies'] : ['English', 'Mathematics', 'Physics', 'Computer Science'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Physics', 'Chemistry'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Computer Science' },
                    { name: 'Obafemi Awolowo University', ranking: '2nd', programName: 'Computer Engineering' },
                    { name: 'University of Ibadan', ranking: '3rd', programName: 'Computer Science' }
                ] : [
                    { name: 'MIT', ranking: '1st', programName: 'Computer Science' },
                    { name: 'Stanford', ranking: '2nd', programName: 'Computer Science' },
                    { name: 'Carnegie Mellon', ranking: '3rd', programName: 'Software Engineering' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 1200000, midMin: 2400000, midMax: 4200000, senior: 6000000, currency: 'NGN', period: 'year' } :
                    { entry: 85000, midMin: 110000, midMax: 150000, senior: 200000, currency: 'USD', period: 'year' },
                relatedCareers: ['Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Mobile Developer'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Mathematics and Computer Studies.' },
                    { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Computer Science or Software Engineering.' },
                    { step: 3, title: 'Build Portfolio', duration: '1-2 years', description: 'Create personal projects on GitHub.' },
                    { step: 4, title: 'Internship', duration: '6-12 months', description: 'Gain practical experience.' },
                    { step: 5, title: 'Professional Certification', duration: 'Ongoing', description: 'AWS, Azure, or Google Cloud certifications.' }
                ],
                courses: [
                    { name: 'CS50: Introduction to Computer Science', platform: 'Harvard edX', description: 'Learn programming fundamentals', url: 'https://www.edx.org/course/cs50s-introduction-to-computer-science' },
                    { name: 'Python for Everybody', platform: 'University of Michigan', description: 'Master Python programming', url: 'https://www.coursera.org/specializations/python' },
                    { name: 'Full Stack Web Development', platform: 'Meta Coursera', description: 'Become a full-stack developer', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' }
                ],
                degrees: ['BSc Computer Science', 'BEng Software Engineering', 'MSc Computer Science']
            },
            {
                title: 'Civil Engineer',
                slug: 'civil-engineer',
                icon: '🏗️',
                shortDescription: 'Design and build infrastructure projects',
                description: 'Civil engineers plan, design, and supervise construction of infrastructure like roads, bridges, and buildings.',
                skills: ['Structural Analysis', 'AutoCAD', 'Project Management', 'Mathematics', 'Material Science'],
                traits: ['Analytical', 'Detail-oriented', 'Problem-solving', 'Practical'],
                interests: ['Construction', 'Design', 'Infrastructure', 'Building'],
                personalityType: 'Technical Innovator',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Physics', 'Chemistry'] : ['English', 'Mathematics', 'Physics', 'Chemistry'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Physics', 'Chemistry'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Civil Engineering' },
                    { name: 'Obafemi Awolowo University', ranking: '2nd', programName: 'Civil Engineering' },
                    { name: 'University of Ibadan', ranking: '3rd', programName: 'Civil Engineering' }
                ] : [
                    { name: 'MIT', ranking: '1st', programName: 'Civil Engineering' },
                    { name: 'UC Berkeley', ranking: '2nd', programName: 'Civil Engineering' },
                    { name: 'Stanford', ranking: '3rd', programName: 'Civil Engineering' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 1500000, midMin: 3000000, midMax: 5000000, senior: 8000000, currency: 'NGN', period: 'year' } :
                    { entry: 65000, midMin: 85000, midMax: 120000, senior: 150000, currency: 'USD', period: 'year' },
                relatedCareers: ['Structural Engineer', 'Construction Manager', 'Transportation Engineer', 'Environmental Engineer'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Mathematics and Physics.' },
                    { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Civil Engineering.' },
                    { step: 3, title: 'Internship', duration: '6-12 months', description: 'Gain field experience.' },
                    { step: 4, title: 'Professional License', duration: '2-4 years', description: 'Pass licensing exams.' },
                    { step: 5, title: 'Senior Engineer', duration: 'Ongoing', description: 'Lead major infrastructure projects.' }
                ],
                courses: [
                    { name: 'Introduction to Civil Engineering', platform: 'Coursera', description: 'Learn civil engineering basics', url: 'https://www.coursera.org/learn/civil-engineering' },
                    { name: 'AutoCAD for Beginners', platform: 'Udemy', description: 'Master AutoCAD', url: 'https://www.udemy.com/course/autocad-beginners/' },
                    { name: 'Structural Engineering', platform: 'edX', description: 'Learn structural design', url: 'https://www.edx.org/course/structural-engineering' }
                ],
                degrees: ['BSc Civil Engineering', 'MSc Civil Engineering', 'MEng Structural Engineering']
            },
            {
                title: 'Electrical Engineer',
                slug: 'electrical-engineer',
                icon: '⚡',
                shortDescription: 'Design and develop electrical systems',
                description: 'Electrical engineers design, develop, and test electrical equipment and systems for various applications.',
                skills: ['Circuit Design', 'Power Systems', 'Electronics', 'MATLAB', 'Problem Solving'],
                traits: ['Analytical', 'Detail-oriented', 'Logical', 'Innovative'],
                interests: ['Electronics', 'Power systems', 'Technology', 'Renewable energy'],
                personalityType: 'Technical Innovator',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Physics', 'Chemistry'] : ['English', 'Mathematics', 'Physics', 'Chemistry'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Physics', 'Chemistry'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Electrical Engineering' },
                    { name: 'Obafemi Awolowo University', ranking: '2nd', programName: 'Electrical Engineering' },
                    { name: 'University of Ibadan', ranking: '3rd', programName: 'Electrical Engineering' }
                ] : [
                    { name: 'MIT', ranking: '1st', programName: 'Electrical Engineering' },
                    { name: 'Stanford', ranking: '2nd', programName: 'Electrical Engineering' },
                    { name: 'UC Berkeley', ranking: '3rd', programName: 'Electrical Engineering' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 1500000, midMin: 3000000, midMax: 5000000, senior: 8000000, currency: 'NGN', period: 'year' } :
                    { entry: 75000, midMin: 95000, midMax: 130000, senior: 160000, currency: 'USD', period: 'year' },
                relatedCareers: ['Power Engineer', 'Electronics Engineer', 'Control Engineer', 'Renewable Energy Engineer'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Mathematics and Physics.' },
                    { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Electrical Engineering.' },
                    { step: 3, title: 'Internship', duration: '6-12 months', description: 'Gain hands-on experience.' },
                    { step: 4, title: 'Professional License', duration: '2-4 years', description: 'Pass licensing exams.' },
                    { step: 5, title: 'Senior Engineer', duration: 'Ongoing', description: 'Lead electrical system projects.' }
                ],
                courses: [
                    { name: 'Introduction to Electrical Engineering', platform: 'Coursera', description: 'Learn electrical engineering basics', url: 'https://www.coursera.org/learn/electrical-engineering' },
                    { name: 'Power Electronics', platform: 'Coursera', description: 'Master power electronics', url: 'https://www.coursera.org/learn/power-electronics' },
                    { name: 'Circuit Design', platform: 'edX', description: 'Learn circuit design', url: 'https://www.edx.org/course/circuit-design' }
                ],
                degrees: ['BSc Electrical Engineering', 'MSc Electrical Engineering', 'MEng Power Systems']
            }
        ],
        'Creative Communicator': [
            {
                title: 'Content Creator',
                slug: 'content-creator',
                icon: '✍️',
                shortDescription: 'Create engaging digital content for audiences',
                description: 'Content creators produce videos, articles, social media posts, and other digital content.',
                skills: ['Writing', 'Video Editing', 'Creativity', 'Social Media', 'Storytelling'],
                traits: ['Creative', 'Expressive', 'Empathetic', 'Adaptable'],
                interests: ['Content creation', 'Social media', 'Storytelling', 'Digital marketing'],
                personalityType: 'Creative Communicator',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Literature', 'Government', 'Economics'] : ['English', 'Literature', 'Media Studies', 'Arts'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Literature', 'Government', 'Economics'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Mass Communication' },
                    { name: 'Obafemi Awolowo University', ranking: '2nd', programName: 'Mass Communication' },
                    { name: 'University of Ibadan', ranking: '3rd', programName: 'Communication Arts' }
                ] : [
                    { name: 'New York University', ranking: '1st', programName: 'Media Studies' },
                    { name: 'University of Southern California', ranking: '2nd', programName: 'Communication' },
                    { name: 'Northwestern University', ranking: '3rd', programName: 'Journalism' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 960000, midMin: 1800000, midMax: 3600000, senior: 6000000, currency: 'NGN', period: 'year' } :
                    { entry: 45000, midMin: 60000, midMax: 80000, senior: 100000, currency: 'USD', period: 'year' },
                relatedCareers: ['Social Media Manager', 'Video Editor', 'Digital Marketer', 'Podcaster'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on English, Literature, and Arts.' },
                    { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Mass Communication or Media Studies.' },
                    { step: 3, title: 'Build Portfolio', duration: '1-2 years', description: 'Create content and build audience.' },
                    { step: 4, title: 'Internship', duration: '6-12 months', description: 'Work with media companies.' },
                    { step: 5, title: 'Specialize', duration: 'Ongoing', description: 'Focus on video, writing, or social media.' }
                ],
                courses: [
                    { name: 'Content Creation Masterclass', platform: 'HubSpot Academy', description: 'Learn content marketing', url: 'https://academy.hubspot.com/courses/content-marketing' },
                    { name: 'Video Editing with DaVinci Resolve', platform: 'Blackmagic Design', description: 'Master video editing', url: 'https://www.blackmagicdesign.com/products/davinciresolve/training' },
                    { name: 'Social Media Marketing', platform: 'Meta Blueprint', description: 'Learn social media advertising', url: 'https://www.facebook.com/business/learn' }
                ],
                degrees: ['BA Mass Communication', 'BA Media Studies', 'MA Digital Media']
            },
            {
                title: 'Graphic Designer',
                slug: 'graphic-designer',
                icon: '🎨',
                shortDescription: 'Create visual designs for brands and media',
                description: 'Graphic designers create visual concepts using software to communicate ideas that inspire and captivate consumers.',
                skills: ['Adobe Creative Suite', 'Typography', 'Color Theory', 'Layout Design', 'Creativity'],
                traits: ['Creative', 'Artistic', 'Detail-oriented', 'Visual'],
                interests: ['Design', 'Art', 'Typography', 'Digital media'],
                personalityType: 'Creative Communicator',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Fine Arts', 'Literature', 'Economics'] : ['English', 'Art', 'Design', 'Media Studies'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Fine Arts', 'Literature', 'Economics'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Creative Arts' },
                    { name: 'Obafemi Awolowo University', ranking: '2nd', programName: 'Fine Arts' },
                    { name: 'Ahmadu Bello University', ranking: '3rd', programName: 'Visual Arts' }
                ] : [
                    { name: 'Rhode Island School of Design', ranking: '1st', programName: 'Graphic Design' },
                    { name: 'Parsons School of Design', ranking: '2nd', programName: 'Communication Design' },
                    { name: 'California Institute of the Arts', ranking: '3rd', programName: 'Graphic Design' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 1200000, midMin: 2400000, midMax: 4200000, senior: 6500000, currency: 'NGN', period: 'year' } :
                    { entry: 45000, midMin: 55000, midMax: 75000, senior: 90000, currency: 'USD', period: 'year' },
                relatedCareers: ['UI/UX Designer', 'Illustrator', 'Motion Designer', 'Art Director'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Arts and Design.' },
                    { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Graphic Design or Fine Arts.' },
                    { step: 3, title: 'Learn Software', duration: '6-12 months', description: 'Master Adobe Creative Suite.' },
                    { step: 4, title: 'Build Portfolio', duration: '1-2 years', description: 'Create design projects.' },
                    { step: 5, title: 'Freelance or Agency', duration: 'Ongoing', description: 'Work with clients or design agencies.' }
                ],
                courses: [
                    { name: 'Graphic Design Specialization', platform: 'CalArts Coursera', description: 'Learn graphic design', url: 'https://www.coursera.org/specializations/graphic-design' },
                    { name: 'Adobe Photoshop Masterclass', platform: 'Udemy', description: 'Master Photoshop', url: 'https://www.udemy.com/course/adobe-photoshop-cc-masterclass/' },
                    { name: 'UI/UX Design', platform: 'Google Coursera', description: 'Learn UI/UX', url: 'https://www.coursera.org/professional-certificates/google-ux-design' }
                ],
                degrees: ['BA Fine Arts', 'BDes Graphic Design', 'MA Visual Communication']
            },
            {
                title: 'Journalist',
                slug: 'journalist',
                icon: '📰',
                shortDescription: 'Report news and stories for media outlets',
                description: 'Journalists research, write, and report news stories for newspapers, magazines, television, and online platforms.',
                skills: ['Writing', 'Research', 'Interviewing', 'Editing', 'Fact-checking'],
                traits: ['Curious', 'Persistent', 'Ethical', 'Communicative'],
                interests: ['Writing', 'News', 'Research', 'Storytelling'],
                personalityType: 'Creative Communicator',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Literature', 'Government', 'Economics'] : ['English', 'Journalism', 'Media Studies', 'Political Science'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Literature', 'Government', 'Economics'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Mass Communication' },
                    { name: 'University of Ibadan', ranking: '2nd', programName: 'Communication and Language Arts' },
                    { name: 'Obafemi Awolowo University', ranking: '3rd', programName: 'Mass Communication' }
                ] : [
                    { name: 'Columbia University', ranking: '1st', programName: 'Journalism' },
                    { name: 'Northwestern University', ranking: '2nd', programName: 'Journalism' },
                    { name: 'University of Missouri', ranking: '3rd', programName: 'Journalism' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 900000, midMin: 1500000, midMax: 3000000, senior: 5000000, currency: 'NGN', period: 'year' } :
                    { entry: 35000, midMin: 50000, midMax: 70000, senior: 90000, currency: 'USD', period: 'year' },
                relatedCareers: ['Editor', 'Reporter', 'News Anchor', 'Investigative Journalist'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on English and Literature.' },
                    { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Journalism or Mass Communication.' },
                    { step: 3, title: 'Internship', duration: '6-12 months', description: 'Work at a news outlet.' },
                    { step: 4, title: 'Build Portfolio', duration: '1-2 years', description: 'Publish articles and stories.' },
                    { step: 5, title: 'Specialize', duration: 'Ongoing', description: 'Focus on political, business, or investigative journalism.' }
                ],
                courses: [
                    { name: 'Journalism Skills for the Digital Age', platform: 'Coursera', description: 'Modern journalism techniques', url: 'https://www.coursera.org/learn/journalism-skills' },
                    { name: 'Data Journalism', platform: 'Coursera', description: 'Tell stories with data', url: 'https://www.coursera.org/learn/data-journalism' },
                    { name: 'Investigative Journalism', platform: 'edX', description: 'Learn investigative techniques', url: 'https://www.edx.org/course/investigative-journalism' }
                ],
                degrees: ['BA Journalism', 'BA Mass Communication', 'MA Journalism']
            }
        ],
        'Healthcare Helper': [
            {
                title: 'Medical Doctor',
                slug: 'medical-doctor',
                icon: '👨‍⚕️',
                shortDescription: 'Diagnose and treat medical conditions',
                description: 'Medical doctors diagnose and treat illnesses, injuries, and other health conditions.',
                skills: ['Diagnosis', 'Patient Care', 'Medical Knowledge', 'Emergency Response', 'Communication'],
                traits: ['Compassionate', 'Patient', 'Observant', 'Dedicated'],
                interests: ['Healthcare', 'Helping others', 'Science', 'Medicine'],
                personalityType: 'Healthcare Helper',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics'] : ['English', 'Biology', 'Chemistry', 'Physics', 'Mathematics'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Biology', 'Chemistry', 'Physics'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Medicine and Surgery' },
                    { name: 'University of Ibadan', ranking: '2nd', programName: 'Medicine and Surgery' },
                    { name: 'Obafemi Awolowo University', ranking: '3rd', programName: 'Medicine' }
                ] : [
                    { name: 'Harvard University', ranking: '1st', programName: 'Medicine' },
                    { name: 'Johns Hopkins University', ranking: '2nd', programName: 'Medicine' },
                    { name: 'Stanford University', ranking: '3rd', programName: 'Medicine' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 2400000, midMin: 4800000, midMax: 7200000, senior: 12000000, currency: 'NGN', period: 'year' } :
                    { entry: 120000, midMin: 180000, midMax: 250000, senior: 350000, currency: 'USD', period: 'year' },
                relatedCareers: ['Pediatrician', 'Surgeon', 'Psychiatrist', 'Cardiologist'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Sciences - Biology, Chemistry, Physics.' },
                    { step: 2, title: 'Medical School', duration: '6 years', description: 'Complete MBBS or MD program.' },
                    { step: 3, title: 'Internship', duration: '1 year', description: 'Rotating internship at teaching hospital.' },
                    { step: 4, title: 'Residency', duration: '3-5 years', description: 'Specialize in a field of medicine.' },
                    { step: 5, title: 'Fellowship', duration: '1-3 years', description: 'Sub-specialize in advanced area.' }
                ],
                courses: [
                    { name: 'Human Anatomy and Physiology', platform: 'Coursera', description: 'Understand the human body', url: 'https://www.coursera.org/specializations/human-anatomy-physiology' },
                    { name: 'Medical Terminology', platform: 'edX', description: 'Learn medical language', url: 'https://www.edx.org/course/medical-terminology' },
                    { name: 'Clinical Skills', platform: 'FutureLearn', description: 'Develop clinical skills', url: 'https://www.futurelearn.com/courses/clinical-skills' }
                ],
                degrees: ['MBBS', 'MD', 'MPH']
            },
            {
                title: 'Registered Nurse',
                slug: 'registered-nurse',
                icon: '🩺',
                shortDescription: 'Provide patient care and support',
                description: 'Nurses care for patients, administer medications, and support doctors in healthcare settings.',
                skills: ['Patient Care', 'Medication Administration', 'Empathy', 'Communication', 'Critical Thinking'],
                traits: ['Compassionate', 'Patient', 'Detail-oriented', 'Caring'],
                interests: ['Healthcare', 'Helping others', 'Patient care', 'Medicine'],
                personalityType: 'Healthcare Helper',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics'] : ['English', 'Biology', 'Chemistry', 'Mathematics'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Biology', 'Chemistry', 'Physics'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Nursing' },
                    { name: 'University of Ibadan', ranking: '2nd', programName: 'Nursing' },
                    { name: 'Obafemi Awolowo University', ranking: '3rd', programName: 'Nursing' }
                ] : [
                    { name: 'University of Pennsylvania', ranking: '1st', programName: 'Nursing' },
                    { name: 'Johns Hopkins University', ranking: '2nd', programName: 'Nursing' },
                    { name: 'University of Washington', ranking: '3rd', programName: 'Nursing' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 1800000, midMin: 3000000, midMax: 4800000, senior: 7200000, currency: 'NGN', period: 'year' } :
                    { entry: 60000, midMin: 75000, midMax: 90000, senior: 110000, currency: 'USD', period: 'year' },
                relatedCareers: ['Nurse Practitioner', 'Clinical Nurse Specialist', 'Nurse Educator'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Sciences.' },
                    { step: 2, title: 'Bachelor of Nursing', duration: '4 years', description: 'Complete BSN degree.' },
                    { step: 3, title: 'Licensing Exam', duration: '6 months', description: 'Pass NCLEX or local board exam.' },
                    { step: 4, title: 'Clinical Experience', duration: '1-2 years', description: 'Work in hospital or clinic.' },
                    { step: 5, title: 'Specialization', duration: 'Ongoing', description: 'Focus on critical care, pediatrics, or oncology.' }
                ],
                courses: [
                    { name: 'Nursing Fundamentals', platform: 'Coursera', description: 'Learn nursing basics', url: 'https://www.coursera.org/learn/nursing-fundamentals' },
                    { name: 'Patient Care Skills', platform: 'edX', description: 'Develop care skills', url: 'https://www.edx.org/course/patient-care' },
                    { name: 'Critical Care Nursing', platform: 'OpenWHO', description: 'Learn critical care', url: 'https://openwho.org/courses' }
                ],
                degrees: ['BSN', 'MSN', 'DNP']
            },
            {
                title: 'Pharmacist',
                slug: 'pharmacist',
                icon: '💊',
                shortDescription: 'Dispense medications and counsel patients',
                description: 'Pharmacists prepare and dispense medications, counsel patients on drug use, and ensure medication safety.',
                skills: ['Pharmacology', 'Patient Counseling', 'Medication Management', 'Attention to Detail', 'Communication'],
                traits: ['Detail-oriented', 'Responsible', 'Caring', 'Scientific'],
                interests: ['Healthcare', 'Science', 'Medicine', 'Chemistry'],
                personalityType: 'Healthcare Helper',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics'] : ['English', 'Biology', 'Chemistry', 'Mathematics'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Biology', 'Chemistry', 'Physics'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Pharmacy' },
                    { name: 'University of Ibadan', ranking: '2nd', programName: 'Pharmacy' },
                    { name: 'Obafemi Awolowo University', ranking: '3rd', programName: 'Pharmacy' }
                ] : [
                    { name: 'University of California San Francisco', ranking: '1st', programName: 'Pharmacy' },
                    { name: 'University of Michigan', ranking: '2nd', programName: 'Pharmacy' },
                    { name: 'University of Minnesota', ranking: '3rd', programName: 'Pharmacy' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 2000000, midMin: 3600000, midMax: 6000000, senior: 9000000, currency: 'NGN', period: 'year' } :
                    { entry: 80000, midMin: 100000, midMax: 120000, senior: 140000, currency: 'USD', period: 'year' },
                relatedCareers: ['Clinical Pharmacist', 'Hospital Pharmacist', 'Community Pharmacist'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Sciences.' },
                    { step: 2, title: 'Pharmacy Degree', duration: '5 years', description: 'Complete BPharm or PharmD.' },
                    { step: 3, title: 'Internship', duration: '1 year', description: 'Pharmacy internship.' },
                    { step: 4, title: 'Licensing Exam', duration: '6 months', description: 'Pass pharmacy board exam.' },
                    { step: 5, title: 'Specialization', duration: 'Ongoing', description: 'Focus on clinical or hospital pharmacy.' }
                ],
                courses: [
                    { name: 'Pharmacology Basics', platform: 'Coursera', description: 'Learn pharmacology', url: 'https://www.coursera.org/learn/pharmacology' },
                    { name: 'Pharmacy Practice', platform: 'FutureLearn', description: 'Learn pharmacy practice', url: 'https://www.futurelearn.com/courses/pharmacy-practice' },
                    { name: 'Clinical Pharmacy', platform: 'edX', description: 'Study clinical pharmacy', url: 'https://www.edx.org/course/clinical-pharmacy' }
                ],
                degrees: ['BPharm', 'PharmD', 'MSc Clinical Pharmacy']
            }
        ],
        'Business Leader': [
            {
                title: 'Business Administrator',
                slug: 'business-administrator',
                icon: '📋',
                shortDescription: 'Manage business operations and lead teams',
                description: 'Business administrators oversee daily operations, manage teams, and develop strategies for organizational growth.',
                skills: ['Management', 'Leadership', 'Strategic Planning', 'Financial Analysis', 'Communication'],
                traits: ['Organized', 'Decisive', 'Strategic', 'Motivated'],
                interests: ['Business', 'Management', 'Leadership', 'Entrepreneurship'],
                personalityType: 'Business Leader',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Economics', 'Accounting'] : ['English', 'Mathematics', 'Economics', 'Business'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Economics', 'Commerce'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Business Administration' },
                    { name: 'Obafemi Awolowo University', ranking: '2nd', programName: 'Business Administration' },
                    { name: 'University of Ibadan', ranking: '3rd', programName: 'Business Administration' }
                ] : [
                    { name: 'Harvard University', ranking: '1st', programName: 'Business Administration' },
                    { name: 'Stanford University', ranking: '2nd', programName: 'Business Administration' },
                    { name: 'University of Pennsylvania Wharton', ranking: '3rd', programName: 'Business Administration' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 1800000, midMin: 3000000, midMax: 5400000, senior: 9000000, currency: 'NGN', period: 'year' } :
                    { entry: 60000, midMin: 80000, midMax: 110000, senior: 150000, currency: 'USD', period: 'year' },
                relatedCareers: ['Operations Manager', 'General Manager', 'Management Consultant', 'Entrepreneur'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Business subjects.' },
                    { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Business Administration.' },
                    { step: 3, title: 'Gain Experience', duration: '2-3 years', description: 'Work in management roles.' },
                    { step: 4, title: 'MBA', duration: '2 years', description: 'Master of Business Administration.' },
                    { step: 5, title: 'Executive Role', duration: 'Ongoing', description: 'Become manager or director.' }
                ],
                courses: [
                    { name: 'Business Foundations', platform: 'Wharton Coursera', description: 'Learn core business principles', url: 'https://www.coursera.org/specializations/wharton-business-foundations' },
                    { name: 'Project Management Professional', platform: 'Google Coursera', description: 'Master project management', url: 'https://www.coursera.org/professional-certificates/google-project-management' },
                    { name: 'Financial Accounting', platform: 'UVA Darden', description: 'Understand financial statements', url: 'https://www.coursera.org/learn/financial-accounting' }
                ],
                degrees: ['BBA', 'MBA', 'MSc Management']
            },
            {
                title: 'Project Manager',
                slug: 'project-manager',
                icon: '📊',
                shortDescription: 'Lead and manage projects to success',
                description: 'Project managers plan, execute, and close projects across various industries.',
                skills: ['Leadership', 'Planning', 'Risk Management', 'Budgeting', 'Communication'],
                traits: ['Organized', 'Decisive', 'Motivated', 'Problem-solver'],
                interests: ['Management', 'Strategy', 'Teamwork', 'Planning'],
                personalityType: 'Business Leader',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Economics', 'Accounting'] : ['English', 'Mathematics', 'Business', 'Economics'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Economics', 'Commerce'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Business Administration' },
                    { name: 'Pan-Atlantic University', ranking: 'Top Business School', programName: 'Project Management' },
                    { name: 'Obafemi Awolowo University', ranking: '3rd', programName: 'Management' }
                ] : [
                    { name: 'University of Pennsylvania', ranking: '1st', programName: 'Project Management' },
                    { name: 'Boston University', ranking: '2nd', programName: 'Project Management' },
                    { name: 'George Washington University', ranking: '3rd', programName: 'Project Management' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 2000000, midMin: 3600000, midMax: 6000000, senior: 10000000, currency: 'NGN', period: 'year' } :
                    { entry: 65000, midMin: 85000, midMax: 115000, senior: 145000, currency: 'USD', period: 'year' },
                relatedCareers: ['Program Manager', 'Product Manager', 'Scrum Master', 'Operations Manager'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Business and Mathematics.' },
                    { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Business or Management.' },
                    { step: 3, title: 'PMP Certification', duration: '6 months', description: 'Get Project Management Professional certified.' },
                    { step: 4, title: 'Gain Experience', duration: '2-3 years', description: 'Work as project coordinator.' },
                    { step: 5, title: 'Senior PM Role', duration: 'Ongoing', description: 'Lead complex projects.' }
                ],
                courses: [
                    { name: 'Google Project Management', platform: 'Google Coursera', description: 'Learn project management', url: 'https://www.coursera.org/professional-certificates/google-project-management' },
                    { name: 'PMP Certification Prep', platform: 'PMI', description: 'Prepare for PMP exam', url: 'https://www.pmi.org' },
                    { name: 'Agile with Scrum', platform: 'Coursera', description: 'Master Agile methodology', url: 'https://www.coursera.org/learn/agile-scrum' }
                ],
                degrees: ['BBA', 'MBA', 'MSc Project Management']
            },
            {
                title: 'Marketing Manager',
                slug: 'marketing-manager',
                icon: '📈',
                shortDescription: 'Develop and execute marketing strategies',
                description: 'Marketing managers create campaigns, analyze markets, and promote products to target audiences.',
                skills: ['Marketing Strategy', 'Market Research', 'Digital Marketing', 'Brand Management', 'Analytics'],
                traits: ['Creative', 'Strategic', 'Communication', 'Analytical'],
                interests: ['Marketing', 'Advertising', 'Branding', 'Digital Media'],
                personalityType: 'Business Leader',
                requirements: {
                    examSystem: config.examSystem,
                    examSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Economics', 'Accounting'] : ['English', 'Marketing', 'Business', 'Economics'],
                    jambSubjects: countryLower === 'nigeria' ? ['English', 'Mathematics', 'Economics', 'Commerce'] : [],
                    examDescription: config.examDescription,
                    additionalTests: config.additionalTests
                },
                universities: countryLower === 'nigeria' ? [
                    { name: 'University of Lagos', ranking: '1st', programName: 'Marketing' },
                    { name: 'Pan-Atlantic University', ranking: 'Top Business School', programName: 'Marketing' },
                    { name: 'Obafemi Awolowo University', ranking: '3rd', programName: 'Marketing' }
                ] : [
                    { name: 'Northwestern University', ranking: '1st', programName: 'Marketing' },
                    { name: 'University of Pennsylvania', ranking: '2nd', programName: 'Marketing' },
                    { name: 'Stanford University', ranking: '3rd', programName: 'Marketing' }
                ],
                salary: countryLower === 'nigeria' ? 
                    { entry: 2000000, midMin: 3600000, midMax: 6000000, senior: 10000000, currency: 'NGN', period: 'year' } :
                    { entry: 55000, midMin: 75000, midMax: 105000, senior: 140000, currency: 'USD', period: 'year' },
                relatedCareers: ['Brand Manager', 'Digital Marketing Specialist', 'Product Marketing Manager', 'Social Media Manager'],
                pathway: [
                    { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Business and English.' },
                    { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Marketing or Business Administration.' },
                    { step: 3, title: 'Digital Marketing Cert', duration: '6 months', description: 'Google or HubSpot certification.' },
                    { step: 4, title: 'Gain Experience', duration: '2-3 years', description: 'Work in marketing roles.' },
                    { step: 5, title: 'Management Role', duration: 'Ongoing', description: 'Lead marketing teams and campaigns.' }
                ],
                courses: [
                    { name: 'Digital Marketing Specialization', platform: 'UIUC Coursera', description: 'Master digital marketing', url: 'https://www.coursera.org/specializations/digital-marketing' },
                    { name: 'Google Digital Garage', platform: 'Google', description: 'Free digital marketing certification', url: 'https://learndigital.withgoogle.com/digitalgarage' },
                    { name: 'Marketing Analytics', platform: 'Coursera', description: 'Learn marketing analytics', url: 'https://www.coursera.org/learn/marketing-analytics' }
                ],
                degrees: ['BBA Marketing', 'MBA Marketing', 'MSc Marketing']
            }
        ]
    };
    
    const careersList = careerDatabase[personalityType] || careerDatabase['Technical Innovator'];
    
    return careersList.map(career => ({
        ...career,
        id: Math.random(),
        country: countryLower === 'nigeria' ? 'ng' : 'us',
        match: calculateMatchScore(career),
        aiGenerated: true
    }));
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
// PERSONALITY-BASED CAREER GENERATION
// =========================

const generatePersonalityBasedCareers = (country) => {
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
    
    console.log(`🎯 Dominant personality: ${dominantPersonality}`);
    
    careers.value = getCareersByPersonality(dominantPersonality, country);
    careers.value = careers.value.sort((a, b) => b.match - a.match).slice(0, 3);
    
    saveCareersToLocalStorage();
    saveCareersToJsonServer(careers.value);
    calculatePersonalityScores();
    
    console.log(`✅ Generated ${careers.value.length} personality-based careers`);
};

// =========================
// FALLBACK SYSTEM
// =========================

const generateCareerFallback = (country) => {
    if (loadCareersFromLocalStorage(country)) {
        calculatePersonalityScores();
        console.log('✅ Using cached careers');
        return;
    }
    
    generatePersonalityBasedCareers(country);
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
