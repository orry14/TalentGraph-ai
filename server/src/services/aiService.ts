import dotenv from 'dotenv';
dotenv.config();
import Anthropic from '@anthropic-ai/sdk';
import { Employee, Project } from '../db/seedData.js';

class AIService {
  private anthropic: Anthropic | null = null;
  private isAIEnabled = false;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'YOUR_ANTHROPIC_API_KEY') {
      try {
        this.anthropic = new Anthropic({ apiKey });
        this.isAIEnabled = true;
        console.log('✅ Anthropic Claude API client initialized successfully.');
      } catch (err) {
        console.error('❌ Failed to initialize Anthropic client:', err);
        this.isAIEnabled = false;
      }
    } else {
      console.log('ℹ️ ANTHROPIC_API_KEY not found or placeholder used. Running in Simulated AI mode.');
      this.isAIEnabled = false;
    }
  }

  // --- Real Claude Integration Helpers ---
  
  private async callClaude(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.isAIEnabled || !this.anthropic) {
      throw new Error('Claude API is not enabled');
    }

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      // Handle content block return types
      const textBlock = response.content.find(block => block.type === 'text');
      return textBlock && 'text' in textBlock ? textBlock.text : '';
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }

  // --- Core Features ---

  /**
   * 1. Resume Intelligence: Parse resume text and extract skills/experience
   */
  public async parseResume(resumeText: string): Promise<Partial<Employee>> {
    if (this.isAIEnabled) {
      const systemPrompt = `You are a resume parsing AI. Extract employee information in JSON format from the resume text. 
Return ONLY a valid JSON object matching this structure:
{
  "name": "string",
  "role": "string",
  "experienceYears": number,
  "technicalSkills": [{"name": "string", "proficiency": number}], // proficiency 1 to 5
  "softSkills": ["string"],
  "certifications": ["string"],
  "profileSummary": "string"
}`;
      try {
        const resultText = await this.callClaude(resumeText, systemPrompt);
        // Clean JSON formatting from Claude if any
        const cleanedJson = resultText.substring(
          resultText.indexOf('{'),
          resultText.lastIndexOf('}') + 1
        );
        return JSON.parse(cleanedJson);
      } catch (err) {
        console.warn('Real AI parsing failed. Falling back to simulator:', err);
      }
    }

    // --- Simulator Mode ---
    return this.simulateResumeParse(resumeText);
  }

  /**
   * 2. Learning Recommendations: Suggest certifications, roadmaps, estimated timelines
   */
  public async generateLearningRecommendations(employee: Employee): Promise<any[]> {
    if (this.isAIEnabled) {
      const systemPrompt = `You are an AI career coach. Generate 4 customized learning recommendations in JSON format based on the employee's current skills, experience, and role.
Return ONLY a valid JSON array of objects matching this structure:
[
  {
    "courseName": "string",
    "type": "course" | "certification" | "project",
    "roadmap": ["Step 1", "Step 2", "Step 3"],
    "timeline": "string (e.g. 3 months)",
    "description": "string"
  }
]`;
      try {
        const prompt = `Employee Profile:\n${JSON.stringify(employee, null, 2)}`;
        const resultText = await this.callClaude(prompt, systemPrompt);
        const cleanedJson = resultText.substring(
          resultText.indexOf('['),
          resultText.lastIndexOf(']') + 1
        );
        return JSON.parse(cleanedJson);
      } catch (err) {
        console.warn('Real AI learning generation failed. Falling back to simulator:', err);
      }
    }

    // --- Simulator Mode ---
    return this.simulateLearningRecs(employee);
  }

  /**
   * 3. Promotion Readiness: Analyze metrics, generate readiness scores
   */
  public async evaluatePromotionReadiness(employee: Employee): Promise<any> {
    if (this.isAIEnabled) {
      const systemPrompt = `You are an AI talent evaluation agent. Evaluate the employee's readiness for promotion.
Return ONLY a valid JSON object matching this structure:
{
  "promotionScore": number, // 0 to 100
  "reasoning": "string (detailed summary)",
  "areasToImprove": ["string"]
}`;
      try {
        const prompt = `Employee Profile:\n${JSON.stringify(employee, null, 2)}`;
        const resultText = await this.callClaude(prompt, systemPrompt);
        const cleanedJson = resultText.substring(
          resultText.indexOf('{'),
          resultText.lastIndexOf('}') + 1
        );
        return JSON.parse(cleanedJson);
      } catch (err) {
        console.warn('Real AI promotion evaluation failed. Falling back to simulator:', err);
      }
    }

    // --- Simulator Mode ---
    return this.simulatePromotionReadiness(employee);
  }

  /**
   * 4. AI Chat Assistant: Respond to workforce capability questions
   */
  public async askChatBot(
    message: string,
    context: { employees: Employee[]; projects: Project[] }
  ): Promise<string> {
    if (this.isAIEnabled) {
      const prompt = `You are Workforce Intelligence Chatbot, a helpful enterprise AI assistant.
Answer the user's questions based on the following employee and project data. 
Be concise, analytical, and structured (use lists and markdown where appropriate).

Employee Data:
${JSON.stringify(context.employees, null, 2)}

Project Data:
${JSON.stringify(context.projects, null, 2)}

User Question: "${message}"`;
      try {
        return await this.callClaude(prompt, 'You are an elite workforce planning analyst assistant.');
      } catch (err) {
        console.warn('Real AI chat failed. Falling back to simulator:', err);
      }
    }

    // --- Simulator Mode ---
    return this.simulateChatBot(message, context);
  }

  // ==========================================
  // --- Simulators for Out-of-box Run ---
  // ==========================================

  private simulateResumeParse(text: string): Partial<Employee> {
    const lines = text.split('\n');
    const nameLine = lines[0] || 'Jane Doe';
    
    // Guess a name
    let name = nameLine.trim();
    if (name.length > 50 || name.includes(':')) {
      name = 'Jane Doe';
    }

    // Look for keywords to identify roles
    let role = 'Software Engineer';
    let department = 'Engineering';
    const textLower = text.toLowerCase();
    
    if (textLower.includes('designer') || textLower.includes('figma') || textLower.includes('ux') || textLower.includes('ui')) {
      role = 'Product Designer';
      department = 'Design';
    } else if (textLower.includes('researcher') || textLower.includes('machine learning') || textLower.includes('data scientist') || textLower.includes('ml')) {
      role = 'Machine Learning Engineer';
      department = 'Data Science';
    } else if (textLower.includes('product manager') || textLower.includes('pm') || textLower.includes('scrum')) {
      role = 'Product Manager';
      department = 'Product';
    } else if (textLower.includes('devops') || textLower.includes('cloud') || textLower.includes('aws') || textLower.includes('kubernetes')) {
      role = 'DevOps Specialist';
      department = 'Engineering';
    } else if (textLower.includes('frontend') || textLower.includes('react') || textLower.includes('next.js')) {
      role = 'Frontend Engineer';
      department = 'Engineering';
    } else if (textLower.includes('backend') || textLower.includes('node') || textLower.includes('database')) {
      role = 'Backend Engineer';
      department = 'Engineering';
    }

    // Estimate experience
    let experienceYears = 3;
    const expMatch = textLower.match(/(\d+)\+?\s*years?/);
    if (expMatch && expMatch[1]) {
      experienceYears = parseInt(expMatch[1], 10);
    }

    // Extract skills
    const commonSkills = [
      'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes',
      'Terraform', 'SQL', 'PostgreSQL', 'Figma', 'UI/UX Design', 'Tailwind CSS',
      'Next.js', 'PyTorch', 'TensorFlow', 'LLMs', 'Git', 'Agile', 'Scrum',
      'Tableau', 'Redis', 'GraphQL', 'CI/CD'
    ];

    const technicalSkills: { name: string; proficiency: number }[] = [];
    commonSkills.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        const prof = Math.floor(Math.random() * 3) + 3; // 3 to 5
        technicalSkills.push({ name: skill, proficiency: prof });
      }
    });

    if (technicalSkills.length === 0) {
      // Default fallback skills if none detected
      technicalSkills.push({ name: 'React', proficiency: 4 });
      technicalSkills.push({ name: 'TypeScript', proficiency: 4 });
      technicalSkills.push({ name: 'HTML/CSS', proficiency: 5 });
    }

    // Soft Skills
    const softs = ['Communication', 'Collaboration', 'Problem Solving', 'Creativity', 'Leadership', 'Analytical Thinking'];
    const softSkills: string[] = [];
    softs.forEach(s => {
      if (textLower.includes(s.toLowerCase()) || Math.random() > 0.5) {
        softSkills.push(s);
      }
    });
    if (softSkills.length > 4) softSkills.length = 4;

    // Certifications
    const certs = ['AWS Solutions Architect', 'Google Cloud Engineer', 'Figma Certified Professional', 'Scrum Master (PSM I)', 'Meta Frontend Developer'];
    const certifications: string[] = [];
    certs.forEach(c => {
      if (textLower.includes(c.toLowerCase()) || Math.random() > 0.7) {
        certifications.push(c);
      }
    });

    return {
      name,
      department,
      role,
      experienceYears,
      performanceRating: 4.0 + parseFloat((Math.random() * 0.9).toFixed(1)),
      technicalSkills,
      softSkills,
      certifications,
      profileSummary: `AI Parser Summary: Passionate and results-driven ${role} with ${experienceYears} years of experience. Demonstrated strength in ${technicalSkills.slice(0, 3).map(s => s.name).join(', ')}. Strong capability in ${softSkills.slice(0, 2).join(' and ')}.`,
      currentProjects: [],
    };
  }

  private simulateLearningRecs(employee: Employee): any[] {
    const role = employee.role.toLowerCase();
    const currentSkillNames = employee.technicalSkills.map(s => s.name.toLowerCase());

    const recs = [];

    // Course 1: Main role advancement
    if (role.includes('frontend') || role.includes('react') || role.includes('designer')) {
      recs.push({
        courseName: 'Advanced Next.js Architecture and SSR Optimization',
        type: 'course',
        roadmap: [
          'Master React Server Components (RSC) and Streaming',
          'Optimize image delivery, hydration payloads, and bundle splitting',
          'Deploy optimized Edge Middleware and caching configurations'
        ],
        timeline: '6 weeks',
        description: 'Deep dive into rendering paradigms, security headers, server components, and performance audits for modern Next.js deployments.'
      });
    } else if (role.includes('data') || role.includes('ml') || role.includes('researcher')) {
      recs.push({
        courseName: 'Large Language Model Ops (LLMOps) in Production',
        type: 'course',
        roadmap: [
          'Configure pipeline for LLM fine-tuning with LoRA/QLoRA',
          'Set up vector databases (Pinecone, Chroma) for RAG networks',
          'Implement evaluation frameworks (Ragas, TruLens) for prompt testing'
        ],
        timeline: '8 weeks',
        description: 'Learn the engineering principles required to deploy, monitor, and scale generative AI and Large Language Models inside enterprise applications.'
      });
    } else {
      recs.push({
        courseName: 'Microservices with Node.js, NestJS and Event-Driven Architecture',
        type: 'course',
        roadmap: [
          'Design distributed schemas and asynchronous communication via RabbitMQ',
          'Implement transactional outbox patterns for reliable events',
          'Configure centralized logging and OpenTelemetry tracing'
        ],
        timeline: '8 weeks',
        description: 'Transition from monoliths to highly decoupled systems using event streams, message brokers, and enterprise Node.js frameworks.'
      });
    }

    // Recommendation 2: Cloud / Infrastructure (highly valuable cross-skilling)
    if (!currentSkillNames.includes('aws') && !currentSkillNames.includes('kubernetes')) {
      recs.push({
        courseName: 'AWS Certified Solutions Architect - Associate',
        type: 'certification',
        roadmap: [
          'Master AWS networking (VPCs, Subnets, Route53, CloudFront)',
          'Implement secure auto-scaling compute groups (EC2, ECS, Fargate)',
          'Study identity IAM management, databases (RDS, DynamoDB), and S3 security'
        ],
        timeline: '3 months',
        description: 'Establish foundational expertise in cloud infrastructure design, storage services, security controls, and high-availability systems.'
      });
    } else {
      recs.push({
        courseName: 'Certified Kubernetes Administrator (CKA)',
        type: 'certification',
        roadmap: [
          'Study core orchestration components: scheduler, API server, Kubelet',
          'Build cluster networking, persistent volumes, and custom resources',
          'Practice scheduling pods, daemonsets, and troubleshooting nodes'
        ],
        timeline: '2 months',
        description: 'Master container orchestration, cluster deployments, scheduling, networking configurations, and system troubleshooting.'
      });
    }

    // Recommendation 3: Technical gap or modern tech
    if (!currentSkillNames.includes('typescript') && (role.includes('engineer') || role.includes('developer'))) {
      recs.push({
        courseName: 'TypeScript Enterprise Patterns & Type Safety',
        type: 'course',
        roadmap: [
          'Learn advanced generics, conditional types, and utility types',
          'Establish strict type linting and decorators in compiler configs',
          'Refactor existing JS APIs to TS with clean declarations'
        ],
        timeline: '4 weeks',
        description: 'Eliminate runtime bugs and maximize developer ergonomics by implementing strict type systems in application architectures.'
      });
    } else if (currentSkillNames.includes('react') && !currentSkillNames.includes('tailwind css')) {
      recs.push({
        courseName: 'Design Systems with Tailwind CSS & Component Libraries',
        type: 'course',
        roadmap: [
          'Build responsive UI tokens for spacing, typography, and dark-mode',
          'Implement accessible component interactions using Headless UI/Radix',
          'Optimize CSS bundle sizes and post-process layouts'
        ],
        timeline: '3 weeks',
        description: 'Master CSS orchestration for scale, allowing rapid UI development using utility-first styling patterns.'
      });
    } else {
      recs.push({
        courseName: 'GraphQL Federation & Gateway Routing at Scale',
        type: 'course',
        roadmap: [
          'Define structured schemas and subgraph specifications',
          'Configure Apollo Router with shared security policies',
          'Optimize resolvers using DataLoader caching to prevent N+1 queries'
        ],
        timeline: '5 weeks',
        description: 'Learn to merge multiple microservice schemas into a single unified API endpoint with federated graph routing.'
      });
    }

    // Recommendation 4: Practice project
    recs.push({
      courseName: 'Build an Event-Driven Task Scheduler Platform',
      type: 'project',
      roadmap: [
        'Write task queuing backend using Redis streams and Node/Python worker threads',
        'Build a real-time reactive monitoring dashboard with Server-Sent Events (SSE)',
        'Package in Docker-compose and write auto-deploy scripts'
      ],
      timeline: '4 weeks',
      description: 'Hands-on project to practice systems design, concurrency, redis caching, and real-time WebSockets/SSE channels.'
    });

    return recs;
  }

  private simulatePromotionReadiness(employee: Employee): any {
    // Base readiness on experience, performance, and skills count
    const rating = employee.performanceRating;
    const exp = employee.experienceYears;
    const skillCount = employee.technicalSkills.length;

    // Calculate a realistic readiness score
    let score = 50;
    score += (rating - 3.0) * 20; // 3.0 performance rating gives +0, 4.0 gives +20, 5.0 gives +40
    score += Math.min(exp * 3, 25); // up to +25 for experience
    score += Math.min(skillCount * 1.5, 15); // up to +15 for skillset breadth
    score = Math.min(Math.round(score), 100);

    // Draft reasoning based on role and score
    let reasoning = '';
    const improvements: string[] = [];

    if (score >= 85) {
      reasoning = `${employee.name} is demonstrating exceptional capability in their role as a ${employee.role}. With a performance rating of ${employee.performanceRating} and ${employee.experienceYears} years of experience, they consistently deliver high-quality outcomes. Their advanced knowledge of ${employee.technicalSkills.slice(0, 3).map(s => s.name).join(', ')} has been crucial in leading project success. They have shown leadership qualities by mentoring peers and driving technical architecture.`;
      improvements.push('Transition into high-level business stakeholder communication');
      improvements.push('Focus on cross-department alignment and tech-strategy planning');
    } else if (score >= 70) {
      reasoning = `${employee.name} shows solid competency and is in a strong progression state. They have high performance (${employee.performanceRating}/5.0) and are key contributors on projects like ${employee.currentProjects.join(' or ') || 'internal tasks'}. While technically strong in ${employee.technicalSkills.slice(0, 2).map(s => s.name).join(', ')}, they need slightly more exposure leading end-to-end project timelines and presenting architectural decisions before moving to the next level.`;
      improvements.push('Take ownership of architectural designs for new features');
      improvements.push('Lead cross-functional sprints and sprint planning sessions');
      improvements.push('Expand technical depth in advanced technologies like cloud infrastructure');
    } else {
      reasoning = `${employee.name} is a valuable team member but requires more time to build experience and deepen technical proficiency in key areas. Their experience (${employee.experienceYears} years) and performance rating (${employee.performanceRating}) indicate room for growth. They should focus on increasing execution independence and tackling complex backend/frontend features with less supervision.`;
      improvements.push('Enhance core proficiency in essential tech stack elements (e.g. TypeScript/React/SQL)');
      improvements.push('Proactively document code architectures and review team pull requests');
      improvements.push('Develop stronger independence in resolving backend bugs and issues');
    }

    return {
      promotionScore: score,
      reasoning,
      areasToImprove: improvements
    };
  }

  private simulateChatBot(
    message: string,
    context: { employees: Employee[]; projects: Project[] }
  ): string {
    const msg = message.toLowerCase();

    // 1. "Who is the best React developer?"
    if (msg.includes('react') && (msg.includes('best') || msg.includes('who') || msg.includes('developer'))) {
      const devs = context.employees
        .filter(e => e.technicalSkills.some(s => s.name.toLowerCase() === 'react'))
        .map(e => ({
          name: e.name,
          prof: e.technicalSkills.find(s => s.name.toLowerCase() === 'react')?.proficiency || 0,
          role: e.role,
          rating: e.performanceRating
        }))
        .sort((a, b) => b.prof - a.prof || b.rating - a.rating);

      let reply = `### Top React Developers in the Organization\n\n`;
      reply += `Based on skill proficiency database records and performance logs, here are the top React developers:\n\n`;
      devs.forEach((d, i) => {
        reply += `${i + 1}. **${d.name}** - ${d.role}\n`;
        reply += `   * *React Proficiency:* ${'★'.repeat(d.prof)}${'☆'.repeat(5 - d.prof)} (${d.prof}/5)\n`;
        reply += `   * *Performance Rating:* ${d.rating}/5.0\n`;
      });
      reply += `\n**Recommendation:** For high-complexity UI architecture or design systems, **${devs[0]?.name}** is the most qualified candidate.`;
      return reply;
    }

    // 2. "Who can lead an AI project?"
    if (msg.includes('ai project') || msg.includes('lead ai') || (msg.includes('ai') && msg.includes('lead')) || msg.includes('machine learning')) {
      const candidates = context.employees
        .filter(e => e.technicalSkills.some(s => ['llms', 'python', 'pytorch', 'tensorflow'].includes(s.name.toLowerCase())))
        .map(e => {
          const aiSkills = e.technicalSkills.filter(s => ['llms', 'pytorch', 'tensorflow', 'python'].includes(s.name.toLowerCase()));
          const avgProf = aiSkills.reduce((sum, s) => sum + s.proficiency, 0) / aiSkills.length;
          return {
            name: e.name,
            role: e.role,
            skills: aiSkills.map(s => `${s.name} (${s.proficiency}/5)`).join(', '),
            avgProf,
            rating: e.performanceRating,
            exp: e.experienceYears
          };
        })
        .sort((a, b) => b.avgProf - a.avgProf || b.rating - a.rating);

      let reply = `### AI Project Leadership Evaluation\n\n`;
      reply += `To lead an AI or Machine Learning initiative, an engineer requires deep competence in AI frameworks (LLMs, PyTorch, Python) combined with solid leadership traits.\n\n`;
      candidates.forEach((c, i) => {
        reply += `${i + 1}. **${c.name}** - ${c.role}\n`;
        reply += `   * *Core AI Skills:* ${c.skills}\n`;
        reply += `   * *Experience:* ${c.exp} years | *Performance:* ${c.rating}/5.0\n`;
      });
      reply += `\n**Strategic Recommendation:** **Sarah Chen** is uniquely qualified. She is our Senior ML Researcher with 7 years experience, a 4.9 performance rating, and is a specialist in LLMs and NLP. Alternatively, **Alex Rivera** (Staff Engineer) has strong API design skills and cloud architecture experience, making him the perfect candidate to lead the production deployment and integration of AI APIs.`;
      return reply;
    }

    // 3. "Which team lacks cloud skills?" or "lack cloud skills"
    if (msg.includes('lack') || msg.includes('cloud') || msg.includes('weakness') || msg.includes('gap')) {
      let reply = `### Cloud Skills & Team Gaps Analysis\n\n`;
      reply += `Looking at our current engineering matrix:\n`;
      reply += `- **Cloud Experts:** **Alex Rivera** (Staff Engineer, AWS Certified Solutions Architect Professional) and **Aisha Rahman** (DevOps Engineer, CKA & AWS Professional).\n`;
      reply += `- **Low Cloud Exposure:** The frontend division (**Elena Rostova**) and junior backend devs show minimal cloud configuration profiles.\n\n`;
      reply += `**Department-wise Gaps:**\n`;
      reply += `1. **Design & Product Teams:** Possess zero cloud or infrastructure capabilities (as expected).\n`;
      reply += `2. **Frontend Developers:** Rely heavily on Vercel deployments; lack direct AWS infrastructure and Docker/Kubernetes management skills.\n`;
      reply += `3. **Data Science Team:** Strong in ML scripting (Python/PyTorch) but has low container orchestration and infrastructure provisioning experience, presenting a bottle-neck for deploying AI models autonomously.\n\n`;
      reply += `**Hiring Recommendation:** We need to hire 1 more Mid-Level Cloud/DevOps Engineer to support ML Model deployments or enroll the Data Science team in an AWS/Kubernetes training roadmap.`;
      return reply;
    }

    // 4. "Who should be promoted?"
    if (msg.includes('promote') || msg.includes('promotion') || msg.includes('readiness')) {
      const readinessList = context.employees.map(e => {
        const rating = e.performanceRating;
        const exp = e.experienceYears;
        let score = 50 + (rating - 3.0) * 20 + Math.min(exp * 3, 25);
        score = Math.min(Math.round(score), 100);
        return { name: e.name, role: e.role, score, rating, exp };
      }).sort((a, b) => b.score - a.score);

      let reply = `### Promotion Readiness Ranking\n\n`;
      reply += `Here are the candidates ranked by AI promotion readiness metrics (aggregating experience, performance, and leadership indicators):\n\n`;
      readinessList.forEach((c, i) => {
        const flag = c.score >= 85 ? '🟢 High Readiness' : c.score >= 70 ? '🟡 Moderate Readiness' : '🔴 Low Readiness';
        reply += `${i + 1}. **${c.name}** (${c.role})\n`;
        reply += `   * *Score:* **${c.score}/100** (${flag})\n`;
        reply += `   * *Performance:* ${c.rating}/5.0 | *Experience:* ${c.exp} years\n`;
      });
      reply += `\n**Top Candidates for Immediate Promotion:**\n`;
      reply += `- **Sarah Chen**: Ready to move into ML Principal/Lead Researcher. Consistently rated 4.9/5.0 with deep expertise.\n`;
      reply += `- **Alex Rivera**: Ready for Principal Engineer. Has 10 years experience, a 4.8/5.0 rating, and serves as architectural lead.`;
      return reply;
    }

    // 5. "What skills should we hire next?" or "skills to hire"
    if (msg.includes('hire') || msg.includes('future') || msg.includes('recruit')) {
      return `### Strategic Hiring Recommendations\n\nBased on current project backlogs and upcoming requirements, here are the top 3 tech skills we need to hire for:\n\n1. **MLOps / Cloud Engineers (High Priority)**\n   * *Reason:* While we have Sarah Chen (Senior ML Researcher) creating models, deploying them is a bottleneck. We need engineers with combined Python, PyTorch, Kubernetes, and AWS deployment experience.\n\n2. **Senior Backend Developers (Redis / Distributed Systems)**\n   * *Reason:* Projects like the "NextGen Core API" require low latency Caching (Redis) and high-concurrency Node.js endpoints. We currently only have 1 Staff Engineer and 1 Mid Backend engineer capable of handling this.\n\n3. **Accessibility-Focused Frontend Engineers**\n   * *Reason:* To support the Customer Portal Redesign and our Design System 2.0 roll-out, we require React/TS engineers who have deep CSS/Tailwind skills paired with accessibility (WCAG) testing experience.`;
    }

    // Default reply
    return `### Workforce Intelligence Chatbot\n\nHello! I am your AI assistant, capable of querying employee capabilities, project requirements, and organizational skill gaps.\n\nHere are some questions you can ask me:\n- *"Who is the best React developer?"*\n- *"Who should be promoted next?"*\n- *"Who is qualified to lead our upcoming AI project?"*\n- *"What are our main cloud/infrastructure skill weaknesses?"*\n- *"What skills should we hire for next?"*`;
  }
}

export const aiService = new AIService();
