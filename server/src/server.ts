import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';

// Parse PDF imports carefully
// @ts-ignore
import pdf from 'pdf-parse';

import { db } from './db/dbClient.js';
import { aiService } from './services/aiService.js';
import { analytics } from './services/analytics.js';

// Configure dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and body parsing
app.use(cors());
app.use(express.json());

// Set up file uploading using Multer (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- API Endpoints ---

/**
 * Reset Database
 */
app.post('/api/reset', async (req, res) => {
  try {
    await db.resetDatabase();
    res.status(200).json({ message: 'Database reset to initial seed data successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset database: ' + err.message });
  }
});

/**
 * Authentication login route (mock authentication)
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Simulate successful login for workspace platform
  // Real implementation can query Supabase auth client: db.supabaseClient.auth.signInWithPassword(...)
  if (email.endsWith('@workforce.ai') && password === 'admin123') {
    return res.status(200).json({
      user: {
        id: 'usr-admin',
        email,
        name: 'Workspace Administrator',
        role: 'Manager'
      },
      token: 'jwt-mock-session-token-998877'
    });
  }

  // Fallback for user demo login
  if (password === 'demo') {
    return res.status(200).json({
      user: {
        id: 'usr-demo',
        email,
        name: 'Demo Account',
        role: 'Viewer'
      },
      token: 'jwt-mock-demo-token-112233'
    });
  }

  return res.status(401).json({ error: 'Invalid credentials. Hint: use any email and password "demo", or standard admin login.' });
});

/**
 * Get all employees
 */
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await db.getEmployees();
    res.status(200).json(employees);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all projects
 */
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.getProjects();
    res.status(200).json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get individual employee with their associated AI recommendations & evaluations
 */
app.get('/api/employees/:id', async (req, res) => {
  try {
    const employee = await db.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Fetch recommendations and evaluations (creates them if not found)
    let learningRecs = await db.getLearningRecommendations(employee.id);
    if (learningRecs.length === 0) {
      learningRecs = await aiService.generateLearningRecommendations(employee);
      await db.saveLearningRecommendations(employee.id, learningRecs);
    }

    let promotionEval = await db.getPromotionEvaluation(employee.id);
    if (!promotionEval) {
      promotionEval = await aiService.evaluatePromotionReadiness(employee);
      await db.savePromotionEvaluation(employee.id, promotionEval);
    }

    res.status(200).json({
      ...employee,
      learningRecommendations: learningRecs,
      promotionEvaluation: promotionEval
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Re-evaluate Learning Recommendations (force AI regeneration)
 */
app.post('/api/employees/:id/recommendations', async (req, res) => {
  try {
    const employee = await db.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const learningRecs = await aiService.generateLearningRecommendations(employee);
    await db.saveLearningRecommendations(employee.id, learningRecs);
    res.status(200).json(learningRecs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Re-evaluate Promotion Readiness (force AI regeneration)
 */
app.post('/api/employees/:id/promotion', async (req, res) => {
  try {
    const employee = await db.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const promotionEval = await aiService.evaluatePromotionReadiness(employee);
    await db.savePromotionEvaluation(employee.id, promotionEval);
    res.status(200).json(promotionEval);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Upload and parse resume to generate an employee profile
 */
app.post('/api/employees/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    let resumeText = '';
    const fileMime = req.file.mimetype;

    if (fileMime === 'application/pdf') {
      try {
        const parsedPdf = await pdf(req.file.buffer);
        resumeText = parsedPdf.text;
      } catch (parseErr) {
        console.error('PDF parse error, falling back to buffer decoding:', parseErr);
        resumeText = req.file.buffer.toString('utf-8');
      }
    } else {
      // Decode txt/doc buffer
      resumeText = req.file.buffer.toString('utf-8');
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the uploaded resume.' });
    }

    // Call AI service to parse the resume text into an employee schema
    const parsedProfile = await aiService.parseResume(resumeText);

    // Build the final employee object
    const newEmployee = {
      id: `emp-${Date.now()}`,
      name: parsedProfile.name || 'Parsed Candidate',
      email: parsedProfile.email || `candidate-${Date.now()}@workforce.ai`,
      department: parsedProfile.department || 'Engineering',
      role: parsedProfile.role || 'Software Engineer',
      experienceYears: parsedProfile.experienceYears || 2,
      performanceRating: parsedProfile.performanceRating || 4.2,
      technicalSkills: parsedProfile.technicalSkills || [{ name: 'React', proficiency: 3 }],
      softSkills: parsedProfile.softSkills || ['Communication'],
      certifications: parsedProfile.certifications || [],
      resumeText,
      currentProjects: [],
      profileSummary: parsedProfile.profileSummary || 'Successfully ingested and analyzed via AI Resume Intelligence.'
    };

    // Save to database
    await db.saveEmployee(newEmployee);

    res.status(201).json(newEmployee);
  } catch (err: any) {
    console.error('Error in upload-resume:', err);
    res.status(500).json({ error: 'Failed to process resume: ' + err.message });
  }
});

/**
 * Get dashboard analytics stats
 */
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const employees = await db.getEmployees();
    const projects = await db.getProjects();
    const stats = analytics.calculateDashboardStats(employees, projects);
    res.status(200).json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Post Project Staffing recommendations
 */
app.post('/api/staffing/recommend', async (req, res) => {
  try {
    const { projectName, requiredSkills, teamSize, durationMonths } = req.body;

    if (!projectName || !requiredSkills || !teamSize || !durationMonths) {
      return res.status(400).json({ error: 'Missing required parameters: projectName, requiredSkills, teamSize, durationMonths' });
    }

    const employees = await db.getEmployees();
    const staffingRec = analytics.recommendStaffing(
      projectName,
      requiredSkills,
      parseInt(teamSize, 10),
      parseInt(durationMonths, 10),
      employees
    );

    res.status(200).json(staffingRec);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Skill Gap Analysis
 */
app.get('/api/gap-analysis', async (req, res) => {
  try {
    const employees = await db.getEmployees();
    const gapReport = analytics.runGapAnalysis(employees);
    res.status(200).json(gapReport);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * AI Chatbot query
 */
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const employees = await db.getEmployees();
    const projects = await db.getProjects();

    const response = await aiService.askChatBot(message, { employees, projects });
    res.status(200).json({ response });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Workforce Intelligence Platform Server running on http://localhost:${PORT}`);
});
