import { Event, Team, Score, Judge, User } from '../types';

// Mock Judges - 10 Internal + 2 External
export const mockJudges: Judge[] = [
  // Internal Judges (10) - 2 per domain
  // Fintech and E-commerce (2 judges)
  {
    id: 'judge-1',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@judges.com',
    expertise: ['Fintech and E-commerce'],
    assignedEventIds: ['event-1'],
    type: 'Internal',
    assignedDomain: 'Fintech and E-commerce'
  },
  {
    id: 'judge-2',
    name: 'Arun Kumar',
    email: 'arun.kumar@judges.com',
    expertise: ['Fintech and E-commerce'],
    assignedEventIds: ['event-1'],
    type: 'Internal',
    assignedDomain: 'Fintech and E-commerce'
  },
  // Health and BioTech (2 judges)
  {
    id: 'judge-3',
    name: 'Rahul Mehta',
    email: 'rahul.mehta@judges.com',
    expertise: ['Health and BioTech'],
    assignedEventIds: ['event-1'],
    type: 'Internal',
    assignedDomain: 'Health and BioTech'
  },
  {
    id: 'judge-4',
    name: 'Sneha Joshi',
    email: 'sneha.joshi@judges.com',
    expertise: ['Health and BioTech'],
    assignedEventIds: ['event-1'],
    type: 'Internal',
    assignedDomain: 'Health and BioTech'
  },
  // Agri-Tech & Rural Empowerment (2 judges)
  {
    id: 'judge-5',
    name: 'Ananya Kapoor',
    email: 'ananya.kapoor@judges.com',
    expertise: ['Agri-Tech & Rural Empowerment'],
    assignedEventIds: ['event-1'],
    type: 'Internal',
    assignedDomain: 'Agri-Tech & Rural Empowerment'
  },
  {
    id: 'judge-6',
    name: 'Divya Reddy',
    email: 'divya.reddy@judges.com',
    expertise: ['Agri-Tech & Rural Empowerment'],
    assignedEventIds: ['event-1'],
    type: 'Internal',
    assignedDomain: 'Agri-Tech & Rural Empowerment'
  },
  // Sustainable solutions and smart cities (2 judges)
  {
    id: 'judge-7',
    name: 'Vikram Singh',
    email: 'vikram.singh@judges.com',
    expertise: ['Sustainable solutions and smart cities'],
    assignedEventIds: ['event-1'],
    type: 'Internal',
    assignedDomain: 'Sustainable solutions and smart cities'
  },
  {
    id: 'judge-8',
    name: 'Karthik Iyer',
    email: 'karthik.iyer@judges.com',
    expertise: ['Sustainable solutions and smart cities'],
    assignedEventIds: ['event-1'],
    type: 'Internal',
    assignedDomain: 'Sustainable solutions and smart cities'
  },
  // Skills and Edtech (2 judges)
  {
    id: 'judge-9',
    name: 'Meera Patel',
    email: 'meera.patel@judges.com',
    expertise: ['Skills and Edtech'],
    assignedEventIds: ['event-1'],
    type: 'Internal',
    assignedDomain: 'Skills and Edtech'
  },
  {
    id: 'judge-10',
    name: 'Rohan Das',
    email: 'rohan.das@judges.com',
    expertise: ['Skills and Edtech'],
    assignedEventIds: ['event-1'],
    type: 'Internal',
    assignedDomain: 'Skills and Edtech'
  },
  // External Judges (2) - No domain assignment, they judge all domains in Round 2
  {
    id: 'judge-ext-1',
    name: 'Prof. Rajiv Malhotra',
    email: 'rajiv.malhotra@external.com',
    expertise: ['All Domains'],
    assignedEventIds: ['event-1'],
    type: 'External'
  },
  {
    id: 'judge-ext-2',
    name: 'Ms. Kavita Deshmukh',
    email: 'kavita.deshmukh@external.com',
    expertise: ['All Domains'],
    assignedEventIds: ['event-1'],
    type: 'External'
  }
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'PITCH PERFECT 2026',
    type: 'Startup Pitching',
    description: 'National-level startup pitching competition with multi-round evaluation process.',
    domains: [
      'Fintech and E-commerce',
      'Health and BioTech',
      'Agri-Tech & Rural Empowerment',
      'Sustainable solutions and smart cities',
      'Skills and Edtech'
    ],
    date: '2026-02-20',
    registrationFee: 499,
    format: 'Round 1 (Internal Judges) → Round 2 (External Judges) → Top 3 Winners',
    deadlines: ['Registration: 15 Feb 2026', 'Round 1: 17 Feb 2026', 'Round 2: 19 Feb 2026', 'Finals: 20 Feb 2026'],
    prizePool: '₹5,00,000 Total (Winner: ₹2L, Runner-up: ₹1.5L, 2nd Runner-up: ₹1L, Consolation: ₹50K each)',
    assignedJudges: [
      'judge-1', 'judge-2', 'judge-3', 'judge-4', 'judge-5',
      'judge-6', 'judge-7', 'judge-8', 'judge-9', 'judge-10',
      'judge-ext-1', 'judge-ext-2'
    ],
    scoringCriteria: [
      { id: 'crit-1', name: 'Problem Identification', maxScore: 15, description: 'Clarity and relevance of the problem being addressed' },
      { id: 'crit-2', name: 'Innovation & Creativity', maxScore: 20, description: 'Uniqueness and innovative approach to the solution' },
      { id: 'crit-3', name: 'Feasibility & Practicality', maxScore: 20, description: 'Implementation viability and practical execution plan' },
      { id: 'crit-4', name: 'Market / Impact Potential', maxScore: 15, description: 'Market size, scalability, and potential social impact' },
      { id: 'crit-5', name: 'Technology & Domain Relevance', maxScore: 15, description: 'Technical soundness and domain expertise' },
      { id: 'crit-6', name: 'Pitch Delivery & Q&A', maxScore: 15, description: 'Presentation quality and ability to answer questions' }
    ],
    isLocked: false,
    createdAt: '2026-01-15T10:00:00Z'
  }
];

// Mock Teams - 5 domains with multiple teams each
export const mockTeams: Team[] = [
  // Fintech and E-commerce Teams
  {
    id: 'team-1',
    teamName: 'PayFlow Innovations',
    eventId: 'event-1',
    members: [
      { name: 'Arjun Patel', email: 'arjun@payflow.com', phone: '+91 98765 43210' },
      { name: 'Sneha Reddy', email: 'sneha@payflow.com', phone: '+91 98765 43211' }
    ],
    domain: 'Fintech and E-commerce',
    problemStatement: 'Developing an AI-powered payment gateway that reduces transaction failures by 40% and provides instant payment reconciliation for small businesses',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-01T10:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-1']
    }
  },
  {
    id: 'team-2',
    teamName: 'ShopSmart AI',
    eventId: 'event-1',
    members: [
      { name: 'Rajesh Kumar', email: 'rajesh@shopsmart.com', phone: '+91 98765 43220' },
      { name: 'Priya Singh', email: 'priya@shopsmart.com', phone: '+91 98765 43221' }
    ],
    domain: 'Fintech and E-commerce',
    problemStatement: 'Creating a personalized e-commerce platform using machine learning to predict customer preferences and reduce cart abandonment by 50%',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-02T10:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-2']
    }
  },
  {
    id: 'team-3',
    teamName: 'CreditScore Pro',
    eventId: 'event-1',
    members: [
      { name: 'Anil Sharma', email: 'anil@creditscore.com', phone: '+91 98765 43230' }
    ],
    domain: 'Fintech and E-commerce',
    problemStatement: 'Building an alternative credit scoring system for the unbanked population using digital footprint analysis and mobile money transactions',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-03T10:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-1']
    }
  },
  {
    id: 'team-4',
    teamName: 'MicroLoan Connect',
    eventId: 'event-1',
    members: [
      { name: 'Deepak Verma', email: 'deepak@microloan.com', phone: '+91 98765 43240' },
      { name: 'Kavita Nair', email: 'kavita@microloan.com', phone: '+91 98765 43241' }
    ],
    domain: 'Fintech and E-commerce',
    problemStatement: 'Connecting rural entrepreneurs with micro-lenders through a blockchain-based peer-to-peer lending platform with zero intermediary costs',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-04T10:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-2']
    }
  },
  {
    id: 'team-5',
    teamName: 'BlockChain Wallet',
    eventId: 'event-1',
    members: [
      { name: 'Suresh Iyer', email: 'suresh@blockchain.com', phone: '+91 98765 43250' }
    ],
    domain: 'Fintech and E-commerce',
    problemStatement: 'Developing a secure, multi-currency digital wallet with built-in smart contracts for automated savings and investment management',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-05T10:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-1']
    }
  },
  {
    id: 'team-26',
    teamName: 'InsureTech Pro',
    eventId: 'event-1',
    members: [
      { name: 'Karan Malhotra', email: 'karan@insuretech.com', phone: '+91 98765 43510' },
      { name: 'Simran Kaur', email: 'simran@insuretech.com', phone: '+91 98765 43511' }
    ],
    domain: 'Fintech and E-commerce',
    problemStatement: 'AI-driven insurance platform that provides personalized coverage recommendations and instant claims processing for micro-insurance products',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-06T10:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-2']
    }
  },
  {
    id: 'team-27',
    teamName: 'Invoice Factoring AI',
    eventId: 'event-1',
    members: [
      { name: 'Harsh Agarwal', email: 'harsh@invoiceai.com', phone: '+91 98765 43520' }
    ],
    domain: 'Fintech and E-commerce',
    problemStatement: 'Real-time invoice factoring platform for MSMEs with AI-powered credit risk assessment and instant liquidity solutions',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-07T10:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-1']
    }
  },
  {
    id: 'team-28',
    teamName: 'Crypto Exchange Local',
    eventId: 'event-1',
    members: [
      { name: 'Neha Chopra', email: 'neha@cryptolocal.com', phone: '+91 98765 43530' },
      { name: 'Ayush Verma', email: 'ayush@cryptolocal.com', phone: '+91 98765 43531' }
    ],
    domain: 'Fintech and E-commerce',
    problemStatement: 'Localized cryptocurrency exchange platform with simplified KYC and support for regional payment methods targeting tier-2 and tier-3 cities',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-08T10:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-2']
    }
  },
  {
    id: 'team-29',
    teamName: 'Budget Planner AI',
    eventId: 'event-1',
    members: [
      { name: 'Ritu Sharma', email: 'ritu@budgetai.com', phone: '+91 98765 43540' }
    ],
    domain: 'Fintech and E-commerce',
    problemStatement: 'Smart personal finance management app with automated expense tracking, investment suggestions, and goal-based savings plans',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-09T10:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-1']
    }
  },
  {
    id: 'team-30',
    teamName: 'Trade Finance Hub',
    eventId: 'event-1',
    members: [
      { name: 'Vikrant Singh', email: 'vikrant@tradehub.com', phone: '+91 98765 43550' },
      { name: 'Pallavi Desai', email: 'pallavi@tradehub.com', phone: '+91 98765 43551' }
    ],
    domain: 'Fintech and E-commerce',
    problemStatement: 'Digital trade finance platform connecting exporters with banks and providing instant working capital against export orders',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-10T10:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-2']
    }
  },

  // Health and BioTech Teams
  {
    id: 'team-6',
    teamName: 'HealthTrack AI',
    eventId: 'event-1',
    members: [
      { name: 'Dr. Meena Patel', email: 'meena@healthtrack.com', phone: '+91 98765 43260' },
      { name: 'Rahul Joshi', email: 'rahul@healthtrack.com', phone: '+91 98765 43261' }
    ],
    domain: 'Health and BioTech',
    problemStatement: 'AI-powered health monitoring system that predicts potential health issues 30 days in advance using wearable device data and genetic information',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-01T11:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-3']
    }
  },
  {
    id: 'team-7',
    teamName: 'MediDrone Delivery',
    eventId: 'event-1',
    members: [
      { name: 'Sanjay Gupta', email: 'sanjay@medidrone.com', phone: '+91 98765 43270' }
    ],
    domain: 'Health and BioTech',
    problemStatement: 'Autonomous drone network for delivering emergency medical supplies to remote areas within 15 minutes of request',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-02T11:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-4']
    }
  },
  {
    id: 'team-8',
    teamName: 'BioSense Diagnostics',
    eventId: 'event-1',
    members: [
      { name: 'Pooja Menon', email: 'pooja@biosense.com', phone: '+91 98765 43280' },
      { name: 'Amit Shah', email: 'amit@biosense.com', phone: '+91 98765 43281' }
    ],
    domain: 'Health and BioTech',
    problemStatement: 'Portable biosensor device for rapid disease detection in rural clinics without the need for laboratory infrastructure',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-03T11:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-3']
    }
  },
  {
    id: 'team-9',
    teamName: 'TeleMed Solutions',
    eventId: 'event-1',
    members: [
      { name: 'Neha Kapoor', email: 'neha@telemed.com', phone: '+91 98765 43290' }
    ],
    domain: 'Health and BioTech',
    problemStatement: 'Comprehensive telemedicine platform connecting patients in tier-3 cities with specialist doctors through multilingual video consultations',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-04T11:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-4']
    }
  },
  {
    id: 'team-10',
    teamName: 'Mental Wellness App',
    eventId: 'event-1',
    members: [
      { name: 'Vikram Rao', email: 'vikram@mentalwellness.com', phone: '+91 98765 43300' },
      { name: 'Shreya Das', email: 'shreya@mentalwellness.com', phone: '+91 98765 43301' }
    ],
    domain: 'Health and BioTech',
    problemStatement: 'Mobile app providing affordable mental health support through AI-powered therapy sessions and connecting users with certified counselors',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-05T11:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-3']
    }
  },
  {
    id: 'team-31',
    teamName: 'DNA Sequencing Lab',
    eventId: 'event-1',
    members: [
      { name: 'Dr. Arvind Kumar', email: 'arvind@dnalab.com', phone: '+91 98765 43560' },
      { name: 'Shruti Mishra', email: 'shruti@dnalab.com', phone: '+91 98765 43561' }
    ],
    domain: 'Health and BioTech',
    problemStatement: 'Affordable DNA sequencing service for personalized medicine with focus on genetic disease prediction and customized treatment plans',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-06T11:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-4']
    }
  },
  {
    id: 'team-32',
    teamName: 'Remote Surgery Robot',
    eventId: 'event-1',
    members: [
      { name: 'Tarun Jain', email: 'tarun@remotesurgery.com', phone: '+91 98765 43570' }
    ],
    domain: 'Health and BioTech',
    problemStatement: 'Robotic surgery platform enabling expert surgeons to perform complex operations remotely in rural hospitals using 5G connectivity',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-07T11:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-3']
    }
  },
  {
    id: 'team-33',
    teamName: 'PharmaTech Delivery',
    eventId: 'event-1',
    members: [
      { name: 'Radhika Nair', email: 'radhika@pharmatech.com', phone: '+91 98765 43580' },
      { name: 'Mohit Sinha', email: 'mohit@pharmatech.com', phone: '+91 98765 43581' }
    ],
    domain: 'Health and BioTech',
    problemStatement: 'On-demand medicine delivery platform with AI-powered prescription verification and automated pharmacy inventory management',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-08T11:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-4']
    }
  },
  {
    id: 'team-34',
    teamName: 'Maternal Health Monitor',
    eventId: 'event-1',
    members: [
      { name: 'Anjana Reddy', email: 'anjana@maternalhealth.com', phone: '+91 98765 43590' }
    ],
    domain: 'Health and BioTech',
    problemStatement: 'Comprehensive maternal health tracking system with risk prediction algorithms and 24/7 medical consultation for expecting mothers',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-09T11:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-3']
    }
  },
  {
    id: 'team-35',
    teamName: 'Nutrition AI Coach',
    eventId: 'event-1',
    members: [
      { name: 'Kiran Bose', email: 'kiran@nutritionai.com', phone: '+91 98765 43600' },
      { name: 'Tanvi Mehta', email: 'tanvi@nutritionai.com', phone: '+91 98765 43601' }
    ],
    domain: 'Health and BioTech',
    problemStatement: 'AI-powered nutrition and fitness coach providing personalized diet plans based on health metrics, goals, and local food availability',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-10T11:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-4']
    }
  },

  // Agri-Tech & Rural Empowerment Teams
  {
    id: 'team-11',
    teamName: 'FarmSense IoT',
    eventId: 'event-1',
    members: [
      { name: 'Ramesh Kumar', email: 'ramesh@farmsense.com', phone: '+91 98765 43310' },
      { name: 'Lakshmi Iyer', email: 'lakshmi@farmsense.com', phone: '+91 98765 43311' }
    ],
    domain: 'Agri-Tech & Rural Empowerment',
    problemStatement: 'IoT-based precision agriculture system that optimizes water usage and fertilizer application, reducing costs by 35% while increasing crop yield',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-01T12:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-5']
    }
  },
  {
    id: 'team-12',
    teamName: 'Crop Doctor AI',
    eventId: 'event-1',
    members: [
      { name: 'Sunil Patil', email: 'sunil@cropdoctor.com', phone: '+91 98765 43320' }
    ],
    domain: 'Agri-Tech & Rural Empowerment',
    problemStatement: 'Mobile-based AI system that diagnoses crop diseases from smartphone photos and provides treatment recommendations in local languages',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-02T12:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-6']
    }
  },
  {
    id: 'team-13',
    teamName: 'Rural E-Market',
    eventId: 'event-1',
    members: [
      { name: 'Ganesh Naik', email: 'ganesh@ruralemarket.com', phone: '+91 98765 43330' },
      { name: 'Anita Desai', email: 'anita@ruralemarket.com', phone: '+91 98765 43331' }
    ],
    domain: 'Agri-Tech & Rural Empowerment',
    problemStatement: 'Direct farmer-to-consumer marketplace platform eliminating middlemen and increasing farmer profits by 45% through blockchain-verified transactions',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-03T12:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-5']
    }
  },
  {
    id: 'team-14',
    teamName: 'Livestock Manager',
    eventId: 'event-1',
    members: [
      { name: 'Mahesh Yadav', email: 'mahesh@livestock.com', phone: '+91 98765 43340' }
    ],
    domain: 'Agri-Tech & Rural Empowerment',
    problemStatement: 'Comprehensive livestock management system with health monitoring, breeding tracking, and market price alerts for dairy farmers',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-04T12:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-6']
    }
  },
  {
    id: 'team-15',
    teamName: 'Soil Health Monitor',
    eventId: 'event-1',
    members: [
      { name: 'Praveen Singh', email: 'praveen@soilhealth.com', phone: '+91 98765 43350' },
      { name: 'Radha Krishna', email: 'radha@soilhealth.com', phone: '+91 98765 43351' }
    ],
    domain: 'Agri-Tech & Rural Empowerment',
    problemStatement: 'Real-time soil quality monitoring system using affordable sensors to provide farmers with optimal planting schedules and crop recommendations',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-05T12:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-5']
    }
  },

  // Additional Agri-Tech & Rural Empowerment Teams (5 more)
  {
    id: 'team-36',
    teamName: 'Weather Predict AI',
    eventId: 'event-1',
    members: [
      { name: 'Bharat Chaudhary', email: 'bharat@weatherai.com', phone: '+91 98765 43610' },
      { name: 'Sunita Yadav', email: 'sunita@weatherai.com', phone: '+91 98765 43611' }
    ],
    domain: 'Agri-Tech & Rural Empowerment',
    problemStatement: 'Hyperlocal weather prediction system for farmers using satellite data and IoT sensors to optimize planting and harvesting schedules',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-06T12:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-6']
    }
  },
  {
    id: 'team-37',
    teamName: 'Drone Crop Survey',
    eventId: 'event-1',
    members: [
      { name: 'Aditya Patil', email: 'aditya@dronesurvey.com', phone: '+91 98765 43620' }
    ],
    domain: 'Agri-Tech & Rural Empowerment',
    problemStatement: 'Automated drone-based crop health monitoring and pest detection service providing real-time alerts to farmers via mobile app',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-07T12:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-5']
    }
  },
  {
    id: 'team-38',
    teamName: 'Agri Credit Score',
    eventId: 'event-1',
    members: [
      { name: 'Pavan Kumar', email: 'pavan@agricredit.com', phone: '+91 98765 43630' },
      { name: 'Meena Devi', email: 'meena@agricredit.com', phone: '+91 98765 43631' }
    ],
    domain: 'Agri-Tech & Rural Empowerment',
    problemStatement: 'Alternative credit scoring platform for farmers using land records, crop data, and weather patterns to facilitate easy agricultural loans',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-08T12:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-6']
    }
  },
  {
    id: 'team-39',
    teamName: 'Cold Chain Manager',
    eventId: 'event-1',
    members: [
      { name: 'Ranjit Singh', email: 'ranjit@coldchain.com', phone: '+91 98765 43640' }
    ],
    domain: 'Agri-Tech & Rural Empowerment',
    problemStatement: 'IoT-enabled cold chain monitoring system reducing post-harvest losses by 60% through real-time temperature and humidity tracking',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-09T12:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-5']
    }
  },
  {
    id: 'team-40',
    teamName: 'Rural Skill Academy',
    eventId: 'event-1',
    members: [
      { name: 'Pradeep Sharma', email: 'pradeep@ruralskill.com', phone: '+91 98765 43650' },
      { name: 'Lalita Kumari', email: 'lalita@ruralskill.com', phone: '+91 98765 43651' }
    ],
    domain: 'Agri-Tech & Rural Empowerment',
    problemStatement: 'Mobile-first vocational training platform for rural youth with offline content access and placement support in agriculture and allied sectors',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-10T12:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-6']
    }
  },

  // Sustainable solutions and smart cities Teams
  {
    id: 'team-16',
    teamName: 'Smart Waste Manager',
    eventId: 'event-1',
    members: [
      { name: 'Arjun Deshmukh', email: 'arjun@smartwaste.com', phone: '+91 98765 43360' },
      { name: 'Priyanka Kulkarni', email: 'priyanka@smartwaste.com', phone: '+91 98765 43361' }
    ],
    domain: 'Sustainable solutions and smart cities',
    problemStatement: 'AI-powered waste segregation and collection optimization system that reduces municipal waste management costs by 30% and improves recycling rates',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-01T13:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-7']
    }
  },
  {
    id: 'team-17',
    teamName: 'Solar Grid Optimizer',
    eventId: 'event-1',
    members: [
      { name: 'Kiran Bhat', email: 'kiran@solargrid.com', phone: '+91 98765 43370' }
    ],
    domain: 'Sustainable solutions and smart cities',
    problemStatement: 'Smart grid management system for distributed solar energy that balances load and maximizes renewable energy utilization across neighborhoods',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-02T13:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-8']
    }
  },
  {
    id: 'team-18',
    teamName: 'Water Conservation IoT',
    eventId: 'event-1',
    members: [
      { name: 'Madhav Reddy', email: 'madhav@wateriot.com', phone: '+91 98765 43380' },
      { name: 'Geeta Pillai', email: 'geeta@wateriot.com', phone: '+91 98765 43381' }
    ],
    domain: 'Sustainable solutions and smart cities',
    problemStatement: 'IoT-based water distribution network monitoring system that detects leaks in real-time and reduces water wastage by 40% in urban areas',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-03T13:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-7']
    }
  },
  {
    id: 'team-19',
    teamName: 'Air Quality Tracker',
    eventId: 'event-1',
    members: [
      { name: 'Sameer Jain', email: 'sameer@airquality.com', phone: '+91 98765 43390' }
    ],
    domain: 'Sustainable solutions and smart cities',
    problemStatement: 'Low-cost air quality monitoring network providing hyperlocal pollution data and health alerts to citizens through mobile app notifications',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-04T13:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-8']
    }
  },
  {
    id: 'team-20',
    teamName: 'Green Transportation',
    eventId: 'event-1',
    members: [
      { name: 'Ravi Tiwari', email: 'ravi@greentrans.com', phone: '+91 98765 43400' },
      { name: 'Shalini Mehta', email: 'shalini@greentrans.com', phone: '+91 98765 43401' }
    ],
    domain: 'Sustainable solutions and smart cities',
    problemStatement: 'Electric vehicle ride-sharing platform with optimized routing to reduce urban carbon emissions by 25% and provide affordable green transportation',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-05T13:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-7']
    }
  },

  // Additional Sustainable solutions and smart cities Teams (5 more)
  {
    id: 'team-41',
    teamName: 'Smart Parking System',
    eventId: 'event-1',
    members: [
      { name: 'Rohit Khanna', email: 'rohit@smartparking.com', phone: '+91 98765 43660' },
      { name: 'Nisha Patel', email: 'nisha@smartparking.com', phone: '+91 98765 43661' }
    ],
    domain: 'Sustainable solutions and smart cities',
    problemStatement: 'AI-powered smart parking management system reducing traffic congestion by 35% through real-time spot detection and dynamic pricing',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-06T13:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-8']
    }
  },
  {
    id: 'team-42',
    teamName: 'E-Waste Recycler',
    eventId: 'event-1',
    members: [
      { name: 'Gaurav Malhotra', email: 'gaurav@ewaste.com', phone: '+91 98765 43670' }
    ],
    domain: 'Sustainable solutions and smart cities',
    problemStatement: 'Comprehensive e-waste collection and recycling platform with doorstep pickup service and rewards program for responsible disposal',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-07T13:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-7']
    }
  },
  {
    id: 'team-43',
    teamName: 'Smart Street Lights',
    eventId: 'event-1',
    members: [
      { name: 'Alok Verma', email: 'alok@smartlights.com', phone: '+91 98765 43680' },
      { name: 'Preeti Jain', email: 'preeti@smartlights.com', phone: '+91 98765 43681' }
    ],
    domain: 'Sustainable solutions and smart cities',
    problemStatement: 'Intelligent street lighting system with motion sensors and adaptive brightness reducing municipal energy costs by 50% and improving safety',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-08T13:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-8']
    }
  },
  {
    id: 'team-44',
    teamName: 'Rainwater Harvesting IoT',
    eventId: 'event-1',
    members: [
      { name: 'Manish Dubey', email: 'manish@rainwater.com', phone: '+91 98765 43690' }
    ],
    domain: 'Sustainable solutions and smart cities',
    problemStatement: 'Smart rainwater harvesting system for urban buildings with automated collection, filtration, and usage optimization reducing water bills by 40%',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-09T13:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-7']
    }
  },
  {
    id: 'team-45',
    teamName: 'Carbon Credit Marketplace',
    eventId: 'event-1',
    members: [
      { name: 'Siddharth Rao', email: 'siddharth@carbonmarket.com', phone: '+91 98765 43700' },
      { name: 'Anita Menon', email: 'anita@carbonmarket.com', phone: '+91 98765 43701' }
    ],
    domain: 'Sustainable solutions and smart cities',
    problemStatement: 'Blockchain-based carbon credit trading platform enabling individuals and small businesses to monetize their sustainability efforts',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-10T13:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-8']
    }
  },

  // Skills and Edtech Teams
  {
    id: 'team-21',
    teamName: 'SkillUp Platform',
    eventId: 'event-1',
    members: [
      { name: 'Nikhil Agarwal', email: 'nikhil@skillup.com', phone: '+91 98765 43410' },
      { name: 'Anjali Gupta', email: 'anjali@skillup.com', phone: '+91 98765 43411' }
    ],
    domain: 'Skills and Edtech',
    problemStatement: 'Personalized skills development platform using AI to match learners with industry-relevant courses and provide job placement assistance',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-01T14:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-9']
    }
  },
  {
    id: 'team-22',
    teamName: 'AI Tutor Bot',
    eventId: 'event-1',
    members: [
      { name: 'Ashok Kumar', email: 'ashok@aitutor.com', phone: '+91 98765 43420' }
    ],
    domain: 'Skills and Edtech',
    problemStatement: 'AI-powered personalized tutor that adapts to each student learning pace and provides 24/7 homework help in multiple subjects',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-02T14:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-10']
    }
  },
  {
    id: 'team-23',
    teamName: 'Language Learning VR',
    eventId: 'event-1',
    members: [
      { name: 'Pooja Malhotra', email: 'pooja@languagevr.com', phone: '+91 98765 43430' },
      { name: 'Vishal Sinha', email: 'vishal@languagevr.com', phone: '+91 98765 43431' }
    ],
    domain: 'Skills and Edtech',
    problemStatement: 'Immersive VR platform for language learning through real-world simulations and interactive conversations with AI native speakers',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-03T14:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-9']
    }
  },
  {
    id: 'team-24',
    teamName: 'Career Guidance AI',
    eventId: 'event-1',
    members: [
      { name: 'Manish Bhatt', email: 'manish@careerguidance.com', phone: '+91 98765 43440' }
    ],
    domain: 'Skills and Edtech',
    problemStatement: 'AI-powered career counseling platform analyzing student aptitudes, market trends, and providing personalized career roadmaps for students',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-04T14:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-10']
    }
  },
  {
    id: 'team-25',
    teamName: 'Exam Prep Platform',
    eventId: 'event-1',
    members: [
      { name: 'Divya Shetty', email: 'divya@examprep.com', phone: '+91 98765 43450' },
      { name: 'Rohan Kulkarni', email: 'rohan@examprep.com', phone: '+91 98765 43451' }
    ],
    domain: 'Skills and Edtech',
    problemStatement: 'Comprehensive online exam preparation platform with adaptive testing, performance analytics, and peer-to-peer study groups',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-05T14:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-9']
    }
  },

  // Additional Skills and Edtech Teams (5 more)
  {
    id: 'team-46',
    teamName: 'Coding Bootcamp Online',
    eventId: 'event-1',
    members: [
      { name: 'Abhishek Roy', email: 'abhishek@codingboot.com', phone: '+91 98765 43710' },
      { name: 'Sonali Thakur', email: 'sonali@codingboot.com', phone: '+91 98765 43711' }
    ],
    domain: 'Skills and Edtech',
    problemStatement: 'Affordable coding bootcamp with live mentorship, hands-on projects, and guaranteed internship placement for tier-2/3 city students',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-06T14:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-10']
    }
  },
  {
    id: 'team-47',
    teamName: 'Scholarship Finder AI',
    eventId: 'event-1',
    members: [
      { name: 'Neeraj Kumar', email: 'neeraj@scholarship.com', phone: '+91 98765 43720' }
    ],
    domain: 'Skills and Edtech',
    problemStatement: 'AI-powered scholarship discovery and application platform matching students with 1000+ funding opportunities based on their profile',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-07T14:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-9']
    }
  },
  {
    id: 'team-48',
    teamName: 'Interactive Lab Simulator',
    eventId: 'event-1',
    members: [
      { name: 'Varun Chopra', email: 'varun@labsim.com', phone: '+91 98765 43730' },
      { name: 'Priya Nambiar', email: 'priya@labsim.com', phone: '+91 98765 43731' }
    ],
    domain: 'Skills and Edtech',
    problemStatement: 'Virtual laboratory platform for science students in schools lacking infrastructure, offering 200+ interactive experiments',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-08T14:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-10']
    }
  },
  {
    id: 'team-49',
    teamName: 'Parent-Teacher Connect',
    eventId: 'event-1',
    members: [
      { name: 'Rajat Saxena', email: 'rajat@ptconnect.com', phone: '+91 98765 43740' }
    ],
    domain: 'Skills and Edtech',
    problemStatement: 'Comprehensive parent-teacher communication platform with real-time student progress tracking, attendance alerts, and assignment updates',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-09T14:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-9']
    }
  },
  {
    id: 'team-50',
    teamName: 'Gamified Math Learning',
    eventId: 'event-1',
    members: [
      { name: 'Snehal Desai', email: 'snehal@mathgame.com', phone: '+91 98765 43750' },
      { name: 'Kunal Mehta', email: 'kunal@mathgame.com', phone: '+91 98765 43751' }
    ],
    domain: 'Skills and Edtech',
    problemStatement: 'Gamified mathematics learning platform making complex concepts fun through storytelling, rewards, and competitive challenges for K-12 students',
    qualificationStatus: 'Qualified',
    createdAt: '2026-02-10T14:00:00Z',
    currentRound: 'Round 1',
    allocatedJudges: {
      round1: ['judge-10']
    }
  }
];

export const mockScores: Score[] = [];

// Mock Admin User
export const mockAdminUser: User = {
  id: 'admin-1',
  name: 'System Administrator',
  email: 'admin@pitchperfect.com',
  role: 'admin'
};

// Mock Judge Users
export const mockJudgeUsers: User[] = mockJudges.map(judge => ({
  id: judge.id,
  name: judge.name,
  email: judge.email,
  role: 'judge' as const,
  judgeProfile: judge
}));