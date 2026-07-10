export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  experienceYears: number;
  performanceRating: number;
  technicalSkills: { name: string; proficiency: number }[]; // proficiency: 1-5
  softSkills: string[];
  certifications: string[];
  resumeText: string;
  currentProjects: string[];
  profileSummary: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  teamSize: number;
  durationMonths: number;
}

export const seedEmployees: Employee[] = [
  {
    id: "emp-01",
    name: "Alex Rivera",
    email: "alex.rivera@workforce.ai",
    department: "Engineering",
    role: "Staff Engineer (Cloud & AI)",
    experienceYears: 10,
    performanceRating: 4.8,
    technicalSkills: [
      { name: "React", proficiency: 5 },
      { name: "TypeScript", proficiency: 5 },
      { name: "Node.js", proficiency: 5 },
      { name: "AWS", proficiency: 4 },
      { name: "Docker", proficiency: 4 },
      { name: "Kubernetes", proficiency: 4 },
      { name: "Terraform", proficiency: 4 },
      { name: "Python", proficiency: 3 }
    ],
    softSkills: ["Mentorship", "Leadership", "Architecture Design", "Strategic Planning"],
    certifications: ["AWS Certified Solutions Architect - Professional", "Certified Kubernetes Administrator (CKA)"],
    currentProjects: ["NextGen Core API", "AI Workforce Graphs"],
    profileSummary: "Experienced software architect specializing in building scalable cloud-native architectures, microservices, and AI-enabled API integrations. Passionate about mentoring junior developers and establishing robust DevOps pipelines.",
    resumeText: "ALEX RIVERA\nStaff Engineer (Cloud & AI)\nSUMMARY:\nHighly accomplished Staff Engineer with 10 years of experience designing and building high-performance web applications and cloud architectures. Expert in React, Node.js, and container orchestration with Kubernetes.\nEXPERIENCE:\n- Staff Engineer at TechCorp (2022-Present)\n  Architected microservices processing 1M+ requests/day. Mentored 15+ engineers.\n- Lead Dev at DevSolutions (2018-2022)\n  Built React dashboard and migrated server infrastructure to AWS.\nSKILLS:\nReact, TypeScript, Node.js, AWS, Docker, Kubernetes, Terraform, Python."
  },
  {
    id: "emp-02",
    name: "Sarah Chen",
    email: "sarah.chen@workforce.ai",
    department: "Data Science",
    role: "Senior ML Researcher",
    experienceYears: 7,
    performanceRating: 4.9,
    technicalSkills: [
      { name: "Python", proficiency: 5 },
      { name: "PyTorch", proficiency: 5 },
      { name: "TensorFlow", proficiency: 4 },
      { name: "SQL", proficiency: 4 },
      { name: "Pandas", proficiency: 5 },
      { name: "LLMs", proficiency: 5 },
      { name: "TypeScript", proficiency: 2 }
    ],
    softSkills: ["Scientific Research", "Technical Writing", "Analytical Thinking", "Cross-functional Collaboration"],
    certifications: ["DeepLearning.AI TensorFlow Developer", "Google Professional Machine Learning Engineer"],
    currentProjects: ["AI Talent Extractor", "Enterprise Chatbot Integration"],
    profileSummary: "Machine learning specialist focused on Natural Language Processing (NLP) and Large Language Model (LLM) fine-tuning. Proven track rate of deploying deep learning models in production systems to drive automation and data intelligence.",
    resumeText: "SARAH CHEN\nSenior ML Researcher\nSUMMARY:\nSenior Data Scientist and Machine Learning Researcher with 7 years of experience. Specialist in deep learning, natural language processing, and integrating Large Language Models (LLMs) into SaaS platforms.\nEXPERIENCE:\n- Senior ML Researcher at NeuralInsights (2021-Present)\n  Fine-tuned LLM architectures to automate document analysis, improving accuracy by 35%.\n- Data Scientist at AnalyticsCorp (2019-2021)\n  Created predictive analytics models for customer behavior tracking.\nSKILLS:\nPython, PyTorch, TensorFlow, LLMs, SQL, Pandas, NLP."
  },
  {
    id: "emp-03",
    name: "Marcus Vance",
    email: "marcus.vance@workforce.ai",
    department: "Design",
    role: "Lead Product Designer",
    experienceYears: 8,
    performanceRating: 4.6,
    technicalSkills: [
      { name: "Figma", proficiency: 5 },
      { name: "UX/UI Design", proficiency: 5 },
      { name: "Prototyping", proficiency: 5 },
      { name: "CSS", proficiency: 4 },
      { name: "Tailwind CSS", proficiency: 4 },
      { name: "HTML", proficiency: 4 },
      { name: "React", proficiency: 3 }
    ],
    softSkills: ["Design Thinking", "User Empathy", "Creative Problem Solving", "Visual Communication"],
    certifications: ["Figma Certified Professional", "NN/g UX Master Certified"],
    currentProjects: ["Design System 2.0", "AI Workforce Graphs"],
    profileSummary: "User-centric designer with 8 years of experience building comprehensive design systems, high-fidelity prototypes, and fluid interactive experiences. Combines artistic creativity with frontend code knowledge for pixel-perfect implementations.",
    resumeText: "MARCUS VANCE\nLead Product Designer\nSUMMARY:\nCreative Lead Product Designer with 8 years of experience. Expert in Figma, designing modular design systems, and conducting qualitative user research. Strong background in HTML/CSS and React implementations.\nEXPERIENCE:\n- Lead Designer at PixelPerfect (2020-Present)\n  Redesigned enterprise dashboard, reducing user bounce rates by 40%.\n- Product Designer at StudioB (2018-2020)\n  Created end-to-end user flows for consumer finance mobile application.\nSKILLS:\nFigma, UI/UX, CSS, Tailwind CSS, Prototyping, User Research."
  },
  {
    id: "emp-04",
    name: "Elena Rostova",
    email: "elena.rostova@workforce.ai",
    department: "Engineering",
    role: "Senior Frontend Engineer",
    experienceYears: 6,
    performanceRating: 4.5,
    technicalSkills: [
      { name: "React", proficiency: 5 },
      { name: "TypeScript", proficiency: 5 },
      { name: "Next.js", proficiency: 4 },
      { name: "Tailwind CSS", proficiency: 5 },
      { name: "Redux", proficiency: 4 },
      { name: "Cypress", proficiency: 4 },
      { name: "GraphQL", proficiency: 3 }
    ],
    softSkills: ["Team Collaboration", "Attention to Detail", "Agile Methodologies", "User Experience Focus"],
    certifications: ["Meta Certified Front-End Developer"],
    currentProjects: ["Customer Portal Redesign", "AI Workforce Graphs"],
    profileSummary: "Frontend engineer dedicated to crafting performant, accessible, and responsive user interfaces. Specializes in modern React patterns, state management, and end-to-end automated UI testing.",
    resumeText: "ELENA ROSTOVA\nSenior Frontend Engineer\nSUMMARY:\nSenior Frontend Engineer with 6 years of experience building complex React web applications. Expert in TypeScript, Next.js, and CSS frameworks like Tailwind. Passionate about accessibility (WCAG) and unit testing.\nEXPERIENCE:\n- Senior Frontend Developer at CloudPortal (2021-Present)\n  Developed responsive user portals in TypeScript, increasing page speed by 50%.\n- Frontend Engineer at WebDev Co (2018-2021)\n  Created modular UI components in React and integrated REST APIs.\nSKILLS:\nReact, TypeScript, Next.js, Tailwind CSS, Redux, Cypress, HTML/CSS."
  },
  {
    id: "emp-05",
    name: "David Kim",
    email: "david.kim@workforce.ai",
    department: "Product",
    role: "Senior Product Manager",
    experienceYears: 9,
    performanceRating: 4.7,
    technicalSkills: [
      { name: "Product Strategy", proficiency: 5 },
      { name: "Agile/Scrum", proficiency: 5 },
      { name: "SQL", proficiency: 3 },
      { name: "JIRA/Confluence", proficiency: 5 },
      { name: "Data Analytics", proficiency: 4 },
      { name: "A/B Testing", proficiency: 4 }
    ],
    softSkills: ["Leadership", "Stakeholder Management", "Negotiation", "Public Speaking"],
    certifications: ["Pragmatic Institute Certified Product Manager", "Certified Scrum Product Owner (CSPO)"],
    currentProjects: ["AI Talent Extractor", "NextGen Core API"],
    profileSummary: "Strategic product leader who bridges engineering, design, and business. Experienced in managing cross-functional teams to launch enterprise SaaS features. Focused on data-driven prioritization and growth loops.",
    resumeText: "DAVID KIM\nSenior Product Manager\nSUMMARY:\nSenior Product Manager with 9 years of experience managing complex SaaS software products. Strong track record of defining product visions, executing roadmaps, and coordinating engineering teams.\nEXPERIENCE:\n- Senior PM at EnterpriseFlow (2021-Present)\n  Led the roadmap for AI analytics features, contributing to $2M ARR growth.\n- Product Manager at SaaSify (2017-2021)\n  Managed search and recommendations teams, increasing conversion by 25%.\nSKILLS:\nProduct Strategy, Agile, Scrum, JIRA, A/B Testing, User Research."
  },
  {
    id: "emp-06",
    name: "Aisha Rahman",
    email: "aisha.rahman@workforce.ai",
    department: "Engineering",
    role: "Senior DevOps Engineer",
    experienceYears: 5,
    performanceRating: 4.4,
    technicalSkills: [
      { name: "AWS", proficiency: 5 },
      { name: "Docker", proficiency: 5 },
      { name: "Kubernetes", proficiency: 5 },
      { name: "CI/CD", proficiency: 5 },
      { name: "Terraform", proficiency: 4 },
      { name: "Python", proficiency: 3 },
      { name: "Bash", proficiency: 4 }
    ],
    softSkills: ["Problem Solving", "Resilience", "Incident Management", "Communication"],
    certifications: ["AWS Certified DevOps Engineer - Professional", "HashiCorp Certified Terraform Associate"],
    currentProjects: ["NextGen Core API"],
    profileSummary: "DevOps engineer specializing in infrastructure-as-code, high-availability setups, and zero-downtime deployment pipelines. Passionate about automating repetitive manual operations and scaling security standards.",
    resumeText: "AISHA RAHMAN\nDevOps Engineer\nSUMMARY:\nFocused DevOps Engineer with 5 years of experience deploying and hosting scalable applications. Certified AWS Professional and Kubernetes expert. Automation champion.\nEXPERIENCE:\n- DevOps Engineer at CloudOps (2022-Present)\n  Automated cloud resource creation with Terraform, cutting infrastructure provisioning time by 80%.\n- Infrastructure Engineer at StartupHub (2019-2022)\n  Configured Gitlab CI/CD pipelines and managed Docker containers in production.\nSKILLS:\nAWS, Kubernetes, Docker, CI/CD, Terraform, Python, Linux, Bash."
  },
  {
    id: "emp-07",
    name: "James O'Connor",
    email: "james.oconnor@workforce.ai",
    department: "Engineering",
    role: "Backend Software Engineer",
    experienceYears: 4,
    performanceRating: 4.2,
    technicalSkills: [
      { name: "Node.js", proficiency: 4 },
      { name: "TypeScript", proficiency: 4 },
      { name: "PostgreSQL", proficiency: 4 },
      { name: "Redis", proficiency: 3 },
      { name: "GraphQL", proficiency: 3 },
      { name: "Docker", proficiency: 3 },
      { name: "React", proficiency: 2 }
    ],
    softSkills: ["Active Listening", "Collaboration", "Critical Thinking", "Adaptability"],
    certifications: ["Node.js Application Developer (LFW211)"],
    currentProjects: ["Customer Portal Redesign", "NextGen Core API"],
    profileSummary: "Backend engineer focused on database optimization, cache architectures, and clean API design. Enjoys writing robust test coverage and tackling complex data synchronization problems.",
    resumeText: "JAMES O'CONNOR\nBackend Software Engineer\nSUMMARY:\nBackend Engineer with 4 years of experience specializing in Node.js, TypeScript, and SQL database optimizations. Proficient in designing secure and performant REST and GraphQL APIs.\nEXPERIENCE:\n- Backend Developer at CoreSystems (2021-Present)\n  Optimized PostgreSQL queries, reducing database read latency by 45%.\n- Software Developer at WebBuilders (2020-2021)\n  Built node-based microservices and managed Redis caching layers.\nSKILLS:\nNode.js, TypeScript, PostgreSQL, Redis, GraphQL, Docker."
  },
  {
    id: "emp-08",
    name: "Sofia Martinez",
    email: "sofia.martinez@workforce.ai",
    department: "Data Science",
    role: "Data Analyst",
    experienceYears: 3,
    performanceRating: 4.3,
    technicalSkills: [
      { name: "Python", proficiency: 4 },
      { name: "SQL", proficiency: 4 },
      { name: "Tableau", proficiency: 5 },
      { name: "Pandas", proficiency: 4 },
      { name: "Excel", proficiency: 5 },
      { name: "R", proficiency: 3 }
    ],
    softSkills: ["Data Storytelling", "Presentation Skills", "Teamwork", "Curiosity"],
    certifications: ["Tableau Desktop Specialist", "Google Data Analytics Professional Certificate"],
    currentProjects: ["AI Talent Extractor", "Design System 2.0"],
    profileSummary: "Data analyst dedicated to turning complex datasets into clear, interactive business dashboards. Skilled in data cleaning, exploratory data analysis (EDA), and presenting findings to stakeholders.",
    resumeText: "SOFIA MARTINEZ\nData Analyst\nSUMMARY:\nAnalytical Data Analyst with 3 years of experience. Expert in writing advanced SQL queries, data wrangling with Python (Pandas), and building interactive dashboards in Tableau.\nEXPERIENCE:\n- Data Analyst at RetailMetrics (2022-Present)\n  Built customer segments dashboard, driving a 15% increase in marketing campaign conversion.\n- Junior Analyst at FinData (2021-2022)\n  Conducted daily data QA and compiled financial performance reports.\nSKILLS:\nPython, SQL, Tableau, Pandas, R, Microsoft Excel."
  }
];

export const seedProjects: Project[] = [
  {
    id: "proj-01",
    name: "NextGen Core API",
    description: "Re-architecting the central core API layer to use GraphQL and a distributed Redis cache, enabling faster mobile client requests and sub-50ms data retrievals.",
    requiredSkills: ["Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "Redis"],
    teamSize: 4,
    durationMonths: 6
  },
  {
    id: "proj-02",
    name: "AI Talent Extractor",
    description: "Developing custom NLP parsers and LLM embeddings to automatically ingest and classify resumes, extract skills, and predict employee project compatibility.",
    requiredSkills: ["Python", "PyTorch", "LLMs", "SQL", "Pandas", "Product Strategy"],
    teamSize: 3,
    durationMonths: 4
  },
  {
    id: "proj-03",
    name: "Design System 2.0",
    description: "Establishing a unified, accessible, and responsive component library based on Tailwind CSS and Figma tokens to unify all external SaaS dashboards.",
    requiredSkills: ["Figma", "UX/UI Design", "Tailwind CSS", "React", "TypeScript"],
    teamSize: 3,
    durationMonths: 5
  },
  {
    id: "proj-04",
    name: "Customer Portal Redesign",
    description: "Re-imagining the customer portal dashboard into a modern, real-time reactive workspace leveraging Next.js server components and WebSockets.",
    requiredSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL"],
    teamSize: 3,
    durationMonths: 6
  }
];
