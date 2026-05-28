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
    // HELPER: GET COUNTRY-SPECIFIC REQUIREMENTS
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
    // FALLBACK CAREERS (Used when API fails)
    // =========================

    const getFallbackCareers = (country, personality) => {
        const countryLower = country?.toLowerCase() === 'nigeria' || country?.toLowerCase() === 'ng' ? 'nigeria' : 'us';
        const config = getCountryRequirements(country);
        
        if (countryLower === 'nigeria') {
            return [
                {
                    id: 1,
                    title: 'Software Developer',
                    slug: 'software-developer',
                    icon: '💻',
                    shortDescription: 'Build innovative software solutions',
                    description: 'Software developers create applications and systems that solve real-world problems.',
                    skills: ['JavaScript', 'Python', 'React', 'Node.js'],
                    traits: ['Analytical', 'Logical', 'Creative'],
                    interests: ['Technology', 'Coding', 'Problem-solving'],
                    personalityType: personality,
                    country: 'ng',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Mathematics', 'Physics', 'Computer Studies'],
                        jambSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry'],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'University of Lagos', ranking: '1st', programName: 'Computer Science' },
                        { name: 'Obafemi Awolowo University', ranking: '2nd', programName: 'Computer Engineering' },
                        { name: 'University of Ibadan', ranking: '3rd', programName: 'Computer Science' }
                    ],
                    salary: { entry: 1200000, midMin: 2400000, midMax: 4200000, senior: 6000000, currency: 'NGN', period: 'year' },
                    relatedCareers: ['Frontend Developer', 'Backend Developer', 'Mobile Developer'],
                    pathway: [
                        { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Mathematics and Physics.' },
                        { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Computer Science.' },
                        { step: 3, title: 'Internship', duration: '6 months', description: 'Gain practical experience.' },
                        { step: 4, title: 'Entry-Level Job', duration: '1-2 years', description: 'Start as junior developer.' },
                        { step: 5, title: 'Senior Developer', duration: 'Ongoing', description: 'Advance to senior role.' }
                    ],
                    courses: [
                        { name: 'CS50', platform: 'Harvard edX', description: 'Learn programming', url: 'https://www.edx.org' },
                        { name: 'Python for Everybody', platform: 'Coursera', description: 'Learn Python', url: 'https://www.coursera.org' },
                        { name: 'Web Development', platform: 'Udemy', description: 'Learn web dev', url: 'https://www.udemy.com' }
                    ],
                    degrees: ['BSc Computer Science', 'MSc Computer Science'],
                    match: 85,
                    aiGenerated: true
                },
                {
                    id: 2,
                    title: 'Medical Doctor',
                    slug: 'medical-doctor',
                    icon: '👨‍⚕️',
                    shortDescription: 'Provide essential healthcare services',
                    description: 'Medical doctors diagnose and treat illnesses and health conditions.',
                    skills: ['Diagnosis', 'Patient Care', 'Medical Knowledge', 'Communication'],
                    traits: ['Compassionate', 'Patient', 'Observant'],
                    interests: ['Healthcare', 'Helping others', 'Science'],
                    personalityType: personality,
                    country: 'ng',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics'],
                        jambSubjects: ['English', 'Biology', 'Chemistry', 'Physics'],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'University of Lagos', ranking: '1st', programName: 'Medicine' },
                        { name: 'University of Ibadan', ranking: '2nd', programName: 'Medicine' },
                        { name: 'Obafemi Awolowo University', ranking: '3rd', programName: 'Medicine' }
                    ],
                    salary: { entry: 2400000, midMin: 4800000, midMax: 7200000, senior: 12000000, currency: 'NGN', period: 'year' },
                    relatedCareers: ['Pediatrician', 'Surgeon', 'Psychiatrist'],
                    pathway: [
                        { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Sciences.' },
                        { step: 2, title: 'Medical School', duration: '6 years', description: 'Complete MBBS.' },
                        { step: 3, title: 'Internship', duration: '1 year', description: 'Hospital training.' },
                        { step: 4, title: 'Residency', duration: '3-5 years', description: 'Specialize.' },
                        { step: 5, title: 'Consultant', duration: 'Ongoing', description: 'Become specialist.' }
                    ],
                    courses: [
                        { name: 'Human Anatomy', platform: 'Coursera', description: 'Learn anatomy', url: 'https://www.coursera.org' },
                        { name: 'Medical Terminology', platform: 'edX', description: 'Learn medical terms', url: 'https://www.edx.org' },
                        { name: 'Clinical Skills', platform: 'FutureLearn', description: 'Develop skills', url: 'https://www.futurelearn.com' }
                    ],
                    degrees: ['MBBS', 'MD', 'MPH'],
                    match: 85,
                    aiGenerated: true
                },
                {
                    id: 3,
                    title: 'Business Administrator',
                    slug: 'business-administrator',
                    icon: '📋',
                    shortDescription: 'Manage business operations',
                    description: 'Business administrators oversee daily operations and manage teams.',
                    skills: ['Management', 'Leadership', 'Strategic Planning', 'Communication'],
                    traits: ['Organized', 'Decisive', 'Strategic'],
                    interests: ['Business', 'Management', 'Leadership'],
                    personalityType: personality,
                    country: 'ng',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Mathematics', 'Economics', 'Accounting'],
                        jambSubjects: ['English', 'Mathematics', 'Economics', 'Commerce'],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'University of Lagos', ranking: '1st', programName: 'Business Administration' },
                        { name: 'Pan-Atlantic University', ranking: 'Top Business', programName: 'Business Administration' },
                        { name: 'Obafemi Awolowo University', ranking: '3rd', programName: 'Business Administration' }
                    ],
                    salary: { entry: 1800000, midMin: 3000000, midMax: 5400000, senior: 9000000, currency: 'NGN', period: 'year' },
                    relatedCareers: ['Operations Manager', 'Project Manager', 'Entrepreneur'],
                    pathway: [
                        { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Business subjects.' },
                        { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Business Administration.' },
                        { step: 3, title: 'Gain Experience', duration: '2-3 years', description: 'Work in management.' },
                        { step: 4, title: 'MBA', duration: '2 years', description: 'Master of Business Administration.' },
                        { step: 5, title: 'Executive Role', duration: 'Ongoing', description: 'Become manager or director.' }
                    ],
                    courses: [
                        { name: 'Business Foundations', platform: 'Wharton Coursera', description: 'Learn business', url: 'https://www.coursera.org' },
                        { name: 'Project Management', platform: 'Google Coursera', description: 'Learn PM', url: 'https://www.coursera.org' },
                        { name: 'Leadership Skills', platform: 'Harvard Online', description: 'Develop leadership', url: 'https://www.harvardonline.com' }
                    ],
                    degrees: ['BBA', 'MBA', 'MSc Management'],
                    match: 85,
                    aiGenerated: true
                },
                {
                    id: 4,
                    title: 'Data Analyst',
                    slug: 'data-analyst',
                    icon: '📊',
                    shortDescription: 'Analyze data to drive business decisions',
                    description: 'Data analysts collect and analyze data to help organizations make informed decisions.',
                    skills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics'],
                    traits: ['Analytical', 'Detail-oriented', 'Logical'],
                    interests: ['Data', 'Statistics', 'Technology'],
                    personalityType: personality,
                    country: 'ng',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Mathematics', 'Economics', 'Computer Studies'],
                        jambSubjects: ['English', 'Mathematics', 'Economics', 'Physics'],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'University of Lagos', ranking: '1st', programName: 'Statistics' },
                        { name: 'University of Ibadan', ranking: '2nd', programName: 'Computer Science' },
                        { name: 'Obafemi Awolowo University', ranking: '3rd', programName: 'Mathematics' }
                    ],
                    salary: { entry: 1500000, midMin: 2800000, midMax: 4500000, senior: 6500000, currency: 'NGN', period: 'year' },
                    relatedCareers: ['Business Analyst', 'Data Scientist', 'BI Analyst'],
                    pathway: [
                        { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Mathematics.' },
                        { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Statistics or Computer Science.' },
                        { step: 3, title: 'Learn Tools', duration: '6 months', description: 'SQL, Excel, Python.' },
                        { step: 4, title: 'Internship', duration: '6 months', description: 'Gain experience.' },
                        { step: 5, title: 'Data Analyst', duration: 'Ongoing', description: 'Work as analyst.' }
                    ],
                    courses: [
                        { name: 'Google Data Analytics', platform: 'Google Coursera', description: 'Learn data analysis', url: 'https://www.coursera.org' },
                        { name: 'SQL for Data Science', platform: 'UC Davis', description: 'Master SQL', url: 'https://www.coursera.org' },
                        { name: 'Python for Data Science', platform: 'IBM', description: 'Learn Python', url: 'https://www.coursera.org' }
                    ],
                    degrees: ['BSc Statistics', 'BSc Computer Science', 'BSc Mathematics'],
                    match: 85,
                    aiGenerated: true
                },
                {
                    id: 5,
                    title: 'Content Creator',
                    slug: 'content-creator',
                    icon: '✍️',
                    shortDescription: 'Create engaging digital content',
                    description: 'Content creators produce videos, articles, and social media content.',
                    skills: ['Writing', 'Video Editing', 'Creativity', 'Social Media'],
                    traits: ['Creative', 'Expressive', 'Adaptable'],
                    interests: ['Content creation', 'Social media', 'Storytelling'],
                    personalityType: personality,
                    country: 'ng',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Literature', 'Government', 'Economics'],
                        jambSubjects: ['English', 'Literature', 'Government', 'Economics'],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'University of Lagos', ranking: '1st', programName: 'Mass Communication' },
                        { name: 'Obafemi Awolowo University', ranking: '2nd', programName: 'Mass Communication' },
                        { name: 'University of Ibadan', ranking: '3rd', programName: 'Communication Arts' }
                    ],
                    salary: { entry: 960000, midMin: 1800000, midMax: 3600000, senior: 6000000, currency: 'NGN', period: 'year' },
                    relatedCareers: ['Social Media Manager', 'Video Editor', 'Digital Marketer'],
                    pathway: [
                        { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Arts.' },
                        { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Mass Communication.' },
                        { step: 3, title: 'Build Portfolio', duration: '1-2 years', description: 'Create content.' },
                        { step: 4, title: 'Grow Audience', duration: '1-2 years', description: 'Build following.' },
                        { step: 5, title: 'Monetize', duration: 'Ongoing', description: 'Brand deals and sponsorships.' }
                    ],
                    courses: [
                        { name: 'Content Creation', platform: 'HubSpot', description: 'Learn content', url: 'https://academy.hubspot.com' },
                        { name: 'Video Editing', platform: 'Adobe', description: 'Learn editing', url: 'https://www.adobe.com' },
                        { name: 'Social Media Marketing', platform: 'Meta', description: 'Learn social media', url: 'https://www.facebook.com/business/learn' }
                    ],
                    degrees: ['BA Mass Communication', 'BA Media Studies'],
                    match: 85,
                    aiGenerated: true
                }
            ];
        } else {
            return [
                {
                    id: 1,
                    title: 'Software Engineer',
                    slug: 'software-engineer',
                    icon: '💻',
                    shortDescription: 'Build software applications',
                    description: 'Software engineers design and develop software applications.',
                    skills: ['Programming', 'Problem Solving', 'Debugging'],
                    traits: ['Analytical', 'Logical', 'Detail-oriented'],
                    interests: ['Technology', 'Coding', 'Problem-solving'],
                    personalityType: personality,
                    country: 'us',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Mathematics', 'Physics', 'Computer Science'],
                        jambSubjects: [],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'MIT', ranking: '1st', programName: 'Computer Science' },
                        { name: 'Stanford', ranking: '2nd', programName: 'Computer Science' },
                        { name: 'UC Berkeley', ranking: '3rd', programName: 'Computer Science' }
                    ],
                    salary: { entry: 85000, midMin: 110000, midMax: 150000, senior: 200000, currency: 'USD', period: 'year' },
                    relatedCareers: ['Frontend Developer', 'Backend Developer', 'DevOps Engineer'],
                    pathway: [
                        { step: 1, title: 'High School Diploma', duration: '4 years', description: 'Focus on Math and Science.' },
                        { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Computer Science.' },
                        { step: 3, title: 'Internship', duration: '3-6 months', description: 'Gain experience.' },
                        { step: 4, title: 'Entry-Level Job', duration: '1-2 years', description: 'Junior developer.' },
                        { step: 5, title: 'Senior Engineer', duration: 'Ongoing', description: 'Senior role.' }
                    ],
                    courses: [
                        { name: 'CS50', platform: 'Harvard edX', description: 'Learn programming', url: 'https://www.edx.org' },
                        { name: 'Data Structures', platform: 'Coursera', description: 'Learn algorithms', url: 'https://www.coursera.org' },
                        { name: 'Web Development', platform: 'Meta Coursera', description: 'Learn web dev', url: 'https://www.coursera.org' }
                    ],
                    degrees: ['BS Computer Science', 'MS Computer Science'],
                    match: 85,
                    aiGenerated: true
                },
                {
                    id: 2,
                    title: 'Data Scientist',
                    slug: 'data-scientist',
                    icon: '📊',
                    shortDescription: 'Extract insights from data',
                    description: 'Data scientists analyze complex data to help organizations make better decisions.',
                    skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
                    traits: ['Analytical', 'Curious', 'Detail-oriented'],
                    interests: ['Data', 'Statistics', 'Machine Learning'],
                    personalityType: personality,
                    country: 'us',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Mathematics', 'Computer Science', 'Statistics'],
                        jambSubjects: [],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'Stanford', ranking: '1st', programName: 'Data Science' },
                        { name: 'MIT', ranking: '2nd', programName: 'Data Science' },
                        { name: 'UC Berkeley', ranking: '3rd', programName: 'Data Science' }
                    ],
                    salary: { entry: 95000, midMin: 120000, midMax: 160000, senior: 220000, currency: 'USD', period: 'year' },
                    relatedCareers: ['Data Analyst', 'ML Engineer', 'Business Analyst'],
                    pathway: [
                        { step: 1, title: 'High School Diploma', duration: '4 years', description: 'Focus on Math and Statistics.' },
                        { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Data Science or Statistics.' },
                        { step: 3, title: 'Master\'s Degree', duration: '2 years', description: 'Advanced degree often preferred.' },
                        { step: 4, title: 'Internship', duration: '6 months', description: 'Gain experience.' },
                        { step: 5, title: 'Data Scientist', duration: 'Ongoing', description: 'Work as data scientist.' }
                    ],
                    courses: [
                        { name: 'Data Science Specialization', platform: 'Johns Hopkins', description: 'Learn data science', url: 'https://www.coursera.org' },
                        { name: 'Machine Learning', platform: 'Stanford', description: 'Learn ML', url: 'https://www.coursera.org' },
                        { name: 'Python for Data Science', platform: 'IBM', description: 'Learn Python', url: 'https://www.coursera.org' }
                    ],
                    degrees: ['BS Data Science', 'MS Data Science', 'PhD Statistics'],
                    match: 85,
                    aiGenerated: true
                },
                {
                    id: 3,
                    title: 'Project Manager',
                    slug: 'project-manager',
                    icon: '📋',
                    shortDescription: 'Lead and manage projects',
                    description: 'Project managers plan, execute, and close projects across various industries.',
                    skills: ['Leadership', 'Planning', 'Communication', 'Risk Management', 'Budgeting'],
                    traits: ['Organized', 'Decisive', 'Motivated'],
                    interests: ['Management', 'Strategy', 'Teamwork'],
                    personalityType: personality,
                    country: 'us',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Mathematics', 'Business', 'Economics'],
                        jambSubjects: [],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'Harvard', ranking: '1st', programName: 'Business Administration' },
                        { name: 'Stanford', ranking: '2nd', programName: 'Management' },
                        { name: 'UPenn Wharton', ranking: '3rd', programName: 'Business' }
                    ],
                    salary: { entry: 70000, midMin: 90000, midMax: 120000, senior: 150000, currency: 'USD', period: 'year' },
                    relatedCareers: ['Program Manager', 'Product Manager', 'Scrum Master'],
                    pathway: [
                        { step: 1, title: 'High School Diploma', duration: '4 years', description: 'Focus on Business subjects.' },
                        { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Business or Management.' },
                        { step: 3, title: 'PMP Certification', duration: '6 months', description: 'Get certified.' },
                        { step: 4, title: 'Gain Experience', duration: '2-3 years', description: 'Work as project coordinator.' },
                        { step: 5, title: 'Project Manager', duration: 'Ongoing', description: 'Lead projects.' }
                    ],
                    courses: [
                        { name: 'Google Project Management', platform: 'Google Coursera', description: 'Learn PM', url: 'https://www.coursera.org' },
                        { name: 'PMP Certification Prep', platform: 'PMI', description: 'Prepare for PMP', url: 'https://www.pmi.org' },
                        { name: 'Agile with Scrum', platform: 'Coursera', description: 'Learn Agile', url: 'https://www.coursera.org' }
                    ],
                    degrees: ['BBA', 'MBA', 'MS Management'],
                    match: 85,
                    aiGenerated: true
                },
                {
                    id: 4,
                    title: 'Registered Nurse',
                    slug: 'registered-nurse',
                    icon: '🩺',
                    shortDescription: 'Provide patient care',
                    description: 'Nurses care for patients in hospitals, clinics, and other healthcare settings.',
                    skills: ['Patient Care', 'Empathy', 'Medical Knowledge', 'Communication', 'Critical Thinking'],
                    traits: ['Compassionate', 'Patient', 'Observant'],
                    interests: ['Healthcare', 'Helping others', 'Medicine'],
                    personalityType: personality,
                    country: 'us',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Mathematics', 'Biology', 'Chemistry'],
                        jambSubjects: [],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'Johns Hopkins', ranking: '1st', programName: 'Nursing' },
                        { name: 'University of Pennsylvania', ranking: '2nd', programName: 'Nursing' },
                        { name: 'University of Washington', ranking: '3rd', programName: 'Nursing' }
                    ],
                    salary: { entry: 60000, midMin: 75000, midMax: 90000, senior: 110000, currency: 'USD', period: 'year' },
                    relatedCareers: ['Nurse Practitioner', 'Clinical Nurse Specialist', 'Nurse Educator'],
                    pathway: [
                        { step: 1, title: 'High School Diploma', duration: '4 years', description: 'Focus on Sciences.' },
                        { step: 2, title: 'BSN Degree', duration: '4 years', description: 'Bachelor of Science in Nursing.' },
                        { step: 3, title: 'NCLEX Exam', duration: '6 months', description: 'Pass licensing exam.' },
                        { step: 4, title: 'Clinical Experience', duration: '1-2 years', description: 'Work in hospital.' },
                        { step: 5, title: 'Specialization', duration: 'Ongoing', description: 'Focus on area of interest.' }
                    ],
                    courses: [
                        { name: 'Nursing Fundamentals', platform: 'Coursera', description: 'Learn nursing basics', url: 'https://www.coursera.org' },
                        { name: 'Patient Care Skills', platform: 'edX', description: 'Develop skills', url: 'https://www.edx.org' },
                        { name: 'Critical Care Nursing', platform: 'OpenWHO', description: 'Learn critical care', url: 'https://openwho.org' }
                    ],
                    degrees: ['BSN', 'MSN', 'DNP'],
                    match: 85,
                    aiGenerated: true
                },
                {
                    id: 5,
                    title: 'Marketing Specialist',
                    slug: 'marketing-specialist',
                    icon: '📈',
                    shortDescription: 'Develop marketing campaigns',
                    description: 'Marketing specialists create strategies to promote products and services.',
                    skills: ['Digital Marketing', 'Analytics', 'Strategy', 'Content Creation', 'SEO'],
                    traits: ['Creative', 'Analytical', 'Communicative'],
                    interests: ['Marketing', 'Advertising', 'Digital Media'],
                    personalityType: personality,
                    country: 'us',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Mathematics', 'Business', 'Economics'],
                        jambSubjects: [],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'Northwestern', ranking: '1st', programName: 'Marketing' },
                        { name: 'UPenn Wharton', ranking: '2nd', programName: 'Marketing' },
                        { name: 'Stanford', ranking: '3rd', programName: 'Marketing' }
                    ],
                    salary: { entry: 50000, midMin: 65000, midMax: 85000, senior: 110000, currency: 'USD', period: 'year' },
                    relatedCareers: ['Brand Manager', 'Digital Marketing Manager', 'SEO Specialist'],
                    pathway: [
                        { step: 1, title: 'High School Diploma', duration: '4 years', description: 'Focus on Business.' },
                        { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Study Marketing or Business.' },
                        { step: 3, title: 'Digital Marketing Cert', duration: '6 months', description: 'Google or HubSpot cert.' },
                        { step: 4, title: 'Internship', duration: '6 months', description: 'Gain experience.' },
                        { step: 5, title: 'Marketing Specialist', duration: 'Ongoing', description: 'Work in marketing.' }
                    ],
                    courses: [
                        { name: 'Digital Marketing', platform: 'Google Digital Garage', description: 'Learn digital marketing', url: 'https://learndigital.withgoogle.com' },
                        { name: 'Marketing Analytics', platform: 'Coursera', description: 'Learn analytics', url: 'https://www.coursera.org' },
                        { name: 'SEO Training', platform: 'Moz', description: 'Learn SEO', url: 'https://moz.com' }
                    ],
                    degrees: ['BBA Marketing', 'MS Marketing', 'MBA'],
                    match: 85,
                    aiGenerated: true
                }
            ];
        }
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
                    console.log("⚠️ No cache found, using fallback careers");
                    generateCareerFallback(country);
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

        // Simpler prompt for the free model
        const prompt = `You are a career expert for ${country.toUpperCase()}. 

Based on the user's personality (${dominantPersonality}), recommend 3 careers.

For EACH career, provide: title, slug, shortDescription, description, and skills array (5 items).

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
            console.log("Calling OpenRouter with free model (Llama 3.2)...");
            
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "Career AI Platform"
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-3.2-3b-instruct",  // Free model
                    messages: [
                        {
                            role: "system",
                            content: "You are a career expert. Return ONLY valid JSON. No markdown, no extra text. Keep responses concise."
                        },
                        { 
                            role: "user", 
                            content: prompt 
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 800,  // Reduced to save credits
                    top_p: 0.9
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                
                // If free model fails, try fallback
                if (errorData.error?.code === 402) {
                    console.log("Insufficient credits, using fallback careers");
                    generateCareerFallback(country);
                    return;
                }
                
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            let aiText = data.choices[0].message.content;
            console.log("Raw AI response:", aiText);
            
            aiText = aiText.replace(/```json\s*|\s*```/g, '').trim();
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) aiText = jsonMatch[0];
            
            const parsed = JSON.parse(aiText);
            if (!parsed.recommendations) throw new Error("Invalid response");

            // Merge AI results with fallback data for complete fields
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
