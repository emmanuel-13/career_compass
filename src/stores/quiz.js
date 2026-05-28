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
        if (t.includes('social') || t.includes('counselor')) return '🤝';
        if (t.includes('lawyer')) return '⚖️';
        if (t.includes('teacher')) return '📚';
        if (t.includes('business') || t.includes('manager')) return '📋';
        if (t.includes('designer')) return '🎨';
        if (t.includes('writer')) return '✍️';
        return '🎯';
    };

    // =========================
    // CALCULATE MATCH SCORE BASED ON USER'S ANSWERS
    // =========================

    const calculateMatchScore = (career) => {
        let score = 0;
        let totalPossible = 0;
        
        answers.value.forEach(answer => {
            const userOption = answer.option;
            if (!userOption) return;
            
            // Personality match (30 points)
            totalPossible += 30;
            if (userOption.personalityType === career.personalityType) {
                score += 30;
            }
            
            // Traits match (up to 35 points)
            if (userOption.traits && userOption.traits.length > 0) {
                totalPossible += 35;
                let traitMatches = 0;
                userOption.traits.forEach(userTrait => {
                    if (career.traits && career.traits.some(t => t.toLowerCase() === userTrait.toLowerCase())) {
                        traitMatches++;
                    }
                });
                // Each trait match adds proportional points
                score += (traitMatches / userOption.traits.length) * 35;
            }
            
            // Interests match (up to 35 points)
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
        
        // Calculate percentage (max 100)
        const finalScore = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
        return Math.min(finalScore, 100);
    };

    // =========================
    // GET FALLBACK CAREERS WITH MATCH SCORES
    // =========================

    const getFallbackCareers = (country, personality) => {
        const countryLower = country?.toLowerCase() === 'nigeria' || country?.toLowerCase() === 'ng' ? 'nigeria' : 'us';
        const config = getCountryRequirements(country);
        
        let baseCareers = [];
        
        if (countryLower === 'nigeria') {
            baseCareers = [
                {
                    id: 1,
                    title: 'Software Developer',
                    slug: 'software-developer',
                    icon: '💻',
                    shortDescription: 'Build innovative software solutions for Nigerian businesses',
                    description: 'Software developers create applications, websites, and systems that solve real-world problems. In Nigeria, this career is growing rapidly with the tech ecosystem in Lagos, Abuja, and other cities.',
                    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Database Management'],
                    traits: ['Analytical', 'Logical', 'Creative', 'Problem-solving'],
                    interests: ['Technology', 'Coding', 'Problem-solving', 'Innovation'],
                    personalityType: 'Technical Innovator',
                    country: 'ng',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English Language', 'Mathematics', 'Physics', 'Computer Studies'],
                        jambSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry'],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'University of Lagos (UNILAG)', ranking: '1st in Nigeria', programName: 'Computer Science' },
                        { name: 'Obafemi Awolowo University (OAU)', ranking: '2nd in Nigeria', programName: 'Computer Engineering' },
                        { name: 'University of Ibadan (UI)', ranking: '3rd in Nigeria', programName: 'Computer Science' },
                        { name: 'Ahmadu Bello University (ABU)', ranking: '4th in Nigeria', programName: 'Computer Science' },
                        { name: 'Federal University of Technology, Minna', ranking: 'Top Tech University', programName: 'Software Engineering' }
                    ],
                    salary: { entry: 1200000, midMin: 2400000, midMax: 4200000, senior: 6000000, currency: 'NGN', period: 'year' },
                    relatedCareers: ['Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Mobile App Developer'],
                    pathway: [
                        { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Mathematics, Physics, and Computer Studies.' },
                        { step: 2, title: 'Earn Bachelor\'s Degree', duration: '4 years', description: 'Complete a degree in Computer Science or related field.' },
                        { step: 3, title: 'Build Portfolio', duration: '1-2 years', description: 'Create personal projects and build a GitHub portfolio.' },
                        { step: 4, title: 'Internship', duration: '6-12 months', description: 'Gain practical experience at tech companies.' },
                        { step: 5, title: 'Professional Certification', duration: 'Ongoing', description: 'Pursue AWS, Google Cloud, or Azure certifications.' }
                    ],
                    courses: [
                        { name: 'CS50: Introduction to Computer Science', platform: 'Harvard edX', description: 'Learn programming fundamentals', url: 'https://www.edx.org/course/cs50s-introduction-to-computer-science' },
                        { name: 'Full Stack Web Development', platform: 'Meta Coursera', description: 'Become a full-stack developer', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' },
                        { name: 'Python for Everybody', platform: 'University of Michigan', description: 'Master Python programming', url: 'https://www.coursera.org/specializations/python' }
                    ],
                    degrees: ['BSc Computer Science', 'BEng Software Engineering', 'MSc Computer Science']
                },
                {
                    id: 2,
                    title: 'Medical Doctor',
                    slug: 'medical-doctor',
                    icon: '👨‍⚕️',
                    shortDescription: 'Provide essential healthcare services to Nigerian communities',
                    description: 'Medical doctors diagnose and treat illnesses, injuries, and other health conditions. In Nigeria, doctors work in hospitals, clinics, and community health centers.',
                    skills: ['Diagnosis', 'Patient Care', 'Medical Knowledge', 'Emergency Response', 'Communication'],
                    traits: ['Compassionate', 'Patient', 'Observant', 'Dedicated', 'Empathetic'],
                    interests: ['Healthcare', 'Helping others', 'Science', 'Medical research'],
                    personalityType: 'Healthcare Helper',
                    country: 'ng',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics'],
                        jambSubjects: ['English', 'Biology', 'Chemistry', 'Physics'],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'University of Lagos (UNILAG)', ranking: '1st in Nigeria', programName: 'Medicine and Surgery' },
                        { name: 'University of Ibadan (UI)', ranking: '2nd in Nigeria', programName: 'Medicine and Surgery' },
                        { name: 'Obafemi Awolowo University (OAU)', ranking: '3rd in Nigeria', programName: 'Medicine' },
                        { name: 'Ahmadu Bello University (ABU)', ranking: '4th in Nigeria', programName: 'Medicine' },
                        { name: 'University of Nigeria, Nsukka (UNN)', ranking: '5th in Nigeria', programName: 'Medicine' }
                    ],
                    salary: { entry: 2400000, midMin: 4800000, midMax: 7200000, senior: 12000000, currency: 'NGN', period: 'year' },
                    relatedCareers: ['Pediatrician', 'Surgeon', 'Psychiatrist', 'Public Health Physician', 'Medical Researcher'],
                    pathway: [
                        { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Sciences - Biology, Chemistry, Physics.' },
                        { step: 2, title: 'Bachelor of Medicine (MBBS)', duration: '6 years', description: 'Complete medical school.' },
                        { step: 3, title: 'Internship (Housemanship)', duration: '1 year', description: 'Rotating internship at a teaching hospital.' },
                        { step: 4, title: 'NYSC', duration: '1 year', description: 'National Youth Service Corps.' },
                        { step: 5, title: 'Residency Program', duration: '4-6 years', description: 'Specialize in a specific field of medicine.' }
                    ],
                    courses: [
                        { name: 'Human Anatomy and Physiology', platform: 'Coursera', description: 'Understand the human body', url: 'https://www.coursera.org/specializations/human-anatomy-physiology' },
                        { name: 'Medical Terminology', platform: 'edX', description: 'Learn medical language', url: 'https://www.edx.org/course/medical-terminology' },
                        { name: 'Tropical Medicine', platform: 'Liverpool School of Tropical Medicine', description: 'Study tropical diseases', url: 'https://www.lstmed.ac.uk/study' }
                    ],
                    degrees: ['MBBS', 'MD', 'MPH']
                },
                {
                    id: 3,
                    title: 'Business Administrator',
                    slug: 'business-administrator',
                    icon: '📋',
                    shortDescription: 'Lead and manage business operations in Nigerian organizations',
                    description: 'Business administrators oversee daily operations, manage teams, and develop strategies for organizational growth.',
                    skills: ['Management', 'Leadership', 'Strategic Planning', 'Financial Analysis', 'Communication'],
                    traits: ['Organized', 'Decisive', 'Strategic', 'Motivated', 'Leadership'],
                    interests: ['Business', 'Management', 'Leadership', 'Entrepreneurship'],
                    personalityType: 'Business Leader',
                    country: 'ng',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English Language', 'Mathematics', 'Economics', 'Accounting'],
                        jambSubjects: ['English', 'Mathematics', 'Economics', 'Commerce'],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'University of Lagos (UNILAG)', ranking: '1st in Nigeria', programName: 'Business Administration' },
                        { name: 'Obafemi Awolowo University (OAU)', ranking: '2nd in Nigeria', programName: 'Business Administration' },
                        { name: 'University of Ibadan (UI)', ranking: '3rd in Nigeria', programName: 'Business Administration' },
                        { name: 'Pan-Atlantic University (LBS)', ranking: 'Top Business School', programName: 'Business Administration' },
                        { name: 'Ahmadu Bello University (ABU)', ranking: 'Top Northern University', programName: 'Business Administration' }
                    ],
                    salary: { entry: 1800000, midMin: 3000000, midMax: 5400000, senior: 9000000, currency: 'NGN', period: 'year' },
                    relatedCareers: ['Management Consultant', 'Project Manager', 'Operations Manager', 'Entrepreneur', 'Financial Analyst'],
                    pathway: [
                        { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Mathematics, Economics, and Accounting.' },
                        { step: 2, title: 'Earn Bachelor\'s Degree', duration: '4 years', description: 'Complete BSc in Business Administration.' },
                        { step: 3, title: 'Gain Work Experience', duration: '2-3 years', description: 'Work in entry-level management positions.' },
                        { step: 4, title: 'Master\'s Degree (MBA)', duration: '2 years', description: 'Pursue an MBA for advanced opportunities.' },
                        { step: 5, title: 'Professional Certifications', duration: 'Ongoing', description: 'PMP, CIPM, or other certifications.' }
                    ],
                    courses: [
                        { name: 'Business Foundations', platform: 'Wharton Coursera', description: 'Learn core business principles', url: 'https://www.coursera.org/specializations/wharton-business-foundations' },
                        { name: 'Project Management Professional', platform: 'Google Coursera', description: 'Master project management', url: 'https://www.coursera.org/professional-certificates/google-project-management' },
                        { name: 'Financial Accounting', platform: 'UVA Darden', description: 'Understand financial statements', url: 'https://www.coursera.org/learn/financial-accounting' }
                    ],
                    degrees: ['BSc Business Administration', 'MBA', 'MSc Management']
                },
                {
                    id: 4,
                    title: 'Content Creator',
                    slug: 'content-creator',
                    icon: '✍️',
                    shortDescription: 'Create engaging digital content for Nigerian and global audiences',
                    description: 'Content creators produce videos, articles, social media posts, and other digital content. Nigeria has a vibrant creative industry.',
                    skills: ['Writing', 'Video Editing', 'Creativity', 'Social Media Management', 'Storytelling'],
                    traits: ['Creative', 'Expressive', 'Empathetic', 'Adaptable', 'Imaginative'],
                    interests: ['Content creation', 'Social media', 'Storytelling', 'Digital marketing'],
                    personalityType: 'Creative Communicator',
                    country: 'ng',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English Language', 'Literature', 'Government', 'Economics'],
                        jambSubjects: ['English', 'Literature', 'Government', 'Economics'],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'University of Lagos (UNILAG)', ranking: '1st in Nigeria', programName: 'Mass Communication' },
                        { name: 'Obafemi Awolowo University (OAU)', ranking: '2nd in Nigeria', programName: 'Mass Communication' },
                        { name: 'University of Ibadan (UI)', ranking: '3rd in Nigeria', programName: 'Communication and Language Arts' },
                        { name: 'Pan-Atlantic University', ranking: 'Top Private', programName: 'Media and Communication' },
                        { name: 'Ahmadu Bello University (ABU)', ranking: 'Top Northern University', programName: 'Mass Communication' }
                    ],
                    salary: { entry: 960000, midMin: 1800000, midMax: 3600000, senior: 6000000, currency: 'NGN', period: 'year' },
                    relatedCareers: ['Social Media Manager', 'Video Editor', 'Digital Marketer', 'Podcaster', 'Graphic Designer'],
                    pathway: [
                        { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on English, Literature, and Arts.' },
                        { step: 2, title: 'Earn Bachelor\'s Degree', duration: '4 years', description: 'Study Mass Communication or related field.' },
                        { step: 3, title: 'Build Portfolio', duration: '1-2 years', description: 'Create content, grow social media presence.' },
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
                    id: 5,
                    title: 'Data Analyst',
                    slug: 'data-analyst',
                    icon: '📊',
                    shortDescription: 'Analyze data to help businesses make better decisions',
                    description: 'Data analysts collect, process, and perform statistical analyses on data to help organizations make informed decisions.',
                    skills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics', 'Critical Thinking'],
                    traits: ['Analytical', 'Detail-oriented', 'Logical', 'Curious', 'Methodical'],
                    interests: ['Data', 'Statistics', 'Problem-solving', 'Technology'],
                    personalityType: 'Technical Innovator',
                    country: 'ng',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English Language', 'Mathematics', 'Economics', 'Computer Studies'],
                        jambSubjects: ['English', 'Mathematics', 'Economics', 'Physics'],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'University of Lagos', ranking: '1st', programName: 'Statistics' },
                        { name: 'University of Ibadan', ranking: '2nd', programName: 'Computer Science' },
                        { name: 'Obafemi Awolowo University', ranking: '3rd', programName: 'Mathematics' },
                        { name: 'Covenant University', ranking: 'Top Private', programName: 'Data Science' },
                        { name: 'Federal University of Technology, Minna', ranking: 'Top Tech', programName: 'Statistics' }
                    ],
                    salary: { entry: 1500000, midMin: 2800000, midMax: 4500000, senior: 6500000, currency: 'NGN', period: 'year' },
                    relatedCareers: ['Business Analyst', 'Data Scientist', 'BI Analyst', 'Data Engineer'],
                    pathway: [
                        { step: 1, title: 'Complete Secondary Education', duration: '4 years', description: 'Focus on Mathematics and Statistics.' },
                        { step: 2, title: 'Earn Bachelor\'s Degree', duration: '4 years', description: 'Study Statistics, Mathematics, or Computer Science.' },
                        { step: 3, title: 'Learn Data Tools', duration: '6-12 months', description: 'Master SQL, Excel, Python, and Tableau.' },
                        { step: 4, title: 'Build Portfolio', duration: '1 year', description: 'Create data analysis projects on GitHub.' },
                        { step: 5, title: 'Certification', duration: 'Ongoing', description: 'Get Google Data Analytics or Microsoft certification.' }
                    ],
                    courses: [
                        { name: 'Google Data Analytics Professional Certificate', platform: 'Google Coursera', description: 'Learn data analysis', url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
                        { name: 'SQL for Data Science', platform: 'UC Davis', description: 'Master SQL', url: 'https://www.coursera.org/learn/sql-for-data-science' },
                        { name: 'Python for Data Science', platform: 'IBM', description: 'Learn Python for data', url: 'https://www.coursera.org/learn/python-for-applied-data-science-ai' }
                    ],
                    degrees: ['BSc Statistics', 'BSc Computer Science', 'MSc Data Science']
                }
            ];
        } else {
            baseCareers = [
                {
                    id: 1,
                    title: 'Software Engineer',
                    slug: 'software-engineer',
                    icon: '💻',
                    shortDescription: 'Build and maintain software applications',
                    description: 'Software engineers design, develop, and test software applications that power modern businesses.',
                    skills: ['Programming', 'Problem Solving', 'Debugging', 'Teamwork', 'System Design'],
                    traits: ['Analytical', 'Detail-oriented', 'Logical', 'Innovative', 'Patient'],
                    interests: ['Technology', 'Problem-solving', 'Innovation', 'Coding'],
                    personalityType: 'Technical Innovator',
                    country: 'us',
                    requirements: {
                        examSystem: config.examSystem,
                        examSubjects: ['English', 'Mathematics', 'Physics', 'Computer Science'],
                        jambSubjects: [],
                        examDescription: config.examDescription,
                        additionalTests: config.additionalTests
                    },
                    universities: [
                        { name: 'Massachusetts Institute of Technology (MIT)', ranking: '1st in US', programName: 'Computer Science' },
                        { name: 'Stanford University', ranking: '2nd in US', programName: 'Computer Science' },
                        { name: 'Carnegie Mellon University', ranking: '3rd in US', programName: 'Software Engineering' },
                        { name: 'UC Berkeley', ranking: '4th in US', programName: 'Computer Science' },
                        { name: 'California Institute of Technology', ranking: '5th in US', programName: 'Computer Science' }
                    ],
                    salary: { entry: 85000, midMin: 110000, midMax: 150000, senior: 200000, currency: 'USD', period: 'year' },
                    relatedCareers: ['Data Scientist', 'DevOps Engineer', 'Cloud Architect', 'Mobile Developer', 'Security Engineer'],
                    pathway: [
                        { step: 1, title: 'High School Diploma', duration: '4 years', description: 'Focus on Mathematics and Science.' },
                        { step: 2, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Earn a BS in Computer Science.' },
                        { step: 3, title: 'Internship', duration: '3-6 months', description: 'Gain practical experience.' },
                        { step: 4, title: 'Entry-Level Position', duration: '2 years', description: 'Start as a junior developer.' },
                        { step: 5, title: 'Senior Engineer', duration: 'Ongoing', description: 'Advance to senior roles.' }
                    ],
                    courses: [
                        { name: 'CS50: Introduction to Computer Science', platform: 'Harvard edX', description: 'Learn programming fundamentals', url: 'https://www.edx.org/course/cs50s-introduction-to-computer-science' },
                        { name: 'Data Structures and Algorithms', platform: 'Coursera', description: 'Master algorithms', url: 'https://www.coursera.org/specializations/data-structures-algorithms' },
                        { name: 'Full Stack Web Development', platform: 'Meta Coursera', description: 'Become a full-stack developer', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' }
                    ],
                    degrees: ['BS Computer Science', 'BEng Software Engineering', 'MS Computer Science']
                }
            ];
        }
        
        // Calculate match scores for each career based on user's answers
        return baseCareers.map(career => ({
            ...career,
            match: calculateMatchScore(career)
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
            console.log("Calling OpenRouter with free model...");
            
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
                            content: "You are a career expert. Return ONLY valid JSON. No markdown, no extra text."
                        },
                        { 
                            role: "user", 
                            content: prompt 
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 800,
                    top_p: 0.9
                })
            });

            if (!response.ok) {
                console.warn(`API Error: ${response.status}, using fallback`);
                generateCareerFallback(country);
                return;
            }

            const data = await response.json();
            let aiText = data.choices[0].message.content;
            
            aiText = aiText.replace(/```json\s*|\s*```/g, '').trim();
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) aiText = jsonMatch[0];
            
            const parsed = JSON.parse(aiText);
            if (!parsed.recommendations) throw new Error("Invalid response");

            // Get fallback careers for complete data
            const fallbackCareers = getFallbackCareers(country, dominantPersonality);
            
            const recommendedCareers = parsed.recommendations.slice(0, 3).map((aiCareer, index) => {
                const fallback = fallbackCareers[index % fallbackCareers.length];
                
                // Create career with AI title/description but fallback for other fields
                const newCareer = {
                    id: Date.now() + index + Math.random(),
                    slug: aiCareer.slug || fallback.slug,
                    title: aiCareer.title || fallback.title,
                    icon: fallback.icon,
                    shortDescription: aiCareer.shortDescription || fallback.shortDescription,
                    description: aiCareer.description || fallback.description,
                    skills: aiCareer.skills || fallback.skills,
                    traits: fallback.traits || [],
                    interests: fallback.interests || [],
                    personalityType: fallback.personalityType || dominantPersonality,
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
                    aiGenerated: true
                };
                
                // Calculate match score based on user's answers
                newCareer.match = calculateMatchScore(newCareer);
                
                return newCareer;
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
        console.log('✅ Using fallback careers with calculated match scores');
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
