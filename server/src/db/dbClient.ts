import dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { seedEmployees, seedProjects, Employee, Project } from './seedData.js';

// Setup __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path for the local JSON database file
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE_PATH = path.join(DATA_DIR, 'db.json');

// Interface for database structure
interface Schema {
  employees: Employee[];
  projects: Project[];
  learningRecommendations: Record<string, any[]>;
  promotionEvaluations: Record<string, any>;
}

class DatabaseAdapter {
  private supabaseClient: SupabaseClient | null = null;
  private isSupabaseEnabled = false;
  private localData: Schema | null = null;

  constructor() {
    this.initSupabase();
    this.initLocalDB();
  }

  private initSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'YOUR_SUPABASE_URL') {
      try {
        this.supabaseClient = createClient(supabaseUrl, supabaseKey);
        this.isSupabaseEnabled = true;
        console.log('✅ Supabase client initialized successfully.');
      } catch (err) {
        console.error('❌ Failed to initialize Supabase client:', err);
        this.isSupabaseEnabled = false;
      }
    } else {
      console.log('ℹ️ Supabase environment variables not found or placeholder used. Falling back to local database.');
      this.isSupabaseEnabled = false;
    }
  }

  private initLocalDB() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.localData = JSON.parse(raw);
        console.log('✅ Loaded data from local JSON database.');
      } else {
        this.resetLocalDB();
      }
    } catch (err) {
      console.error('❌ Failed to initialize local database:', err);
      // Fallback to in-memory store if disk write fails
      this.localData = {
        employees: [...seedEmployees],
        projects: [...seedProjects],
        learningRecommendations: {},
        promotionEvaluations: {}
      };
    }
  }

  public async resetDatabase() {
    // 1. Reset local DB
    this.localData = {
      employees: JSON.parse(JSON.stringify(seedEmployees)),
      projects: JSON.parse(JSON.stringify(seedProjects)),
      learningRecommendations: {},
      promotionEvaluations: {}
    };
    this.saveLocalDB();
    console.log('✅ Local database reset to initial seed data.');

    // 2. Reset Supabase DB if enabled
    if (this.isSupabaseEnabled && this.supabaseClient) {
      console.log('ℹ️ Seeding Supabase database with dummy values...');
      try {
        // Clear child tables first to avoid foreign key violations
        await this.supabaseClient.from('learning_recommendations').delete().neq('id', 0);
        await this.supabaseClient.from('promotion_evaluations').delete().neq('id', 0);
        
        // Clear parent tables
        await this.supabaseClient.from('employees').delete().neq('id', '0');
        await this.supabaseClient.from('projects').delete().neq('id', '0');

        // Insert employees
        const { error: empErr } = await this.supabaseClient
          .from('employees')
          .insert(seedEmployees);
        if (empErr) {
          console.error('Error seeding Supabase employees:', empErr);
        } else {
          console.log('✅ Employees seeded to Supabase.');
        }

        // Insert projects
        const { error: projErr } = await this.supabaseClient
          .from('projects')
          .insert(seedProjects);
        if (projErr) {
          console.error('Error seeding Supabase projects:', projErr);
        } else {
          console.log('✅ Projects seeded to Supabase.');
        }

        console.log('✅ Supabase database successfully seeded with initial dummy values.');
      } catch (err) {
        console.error('❌ Failed to seed Supabase database:', err);
      }
    }
  }

  public resetLocalDB() {
    this.localData = {
      employees: JSON.parse(JSON.stringify(seedEmployees)),
      projects: JSON.parse(JSON.stringify(seedProjects)),
      learningRecommendations: {},
      promotionEvaluations: {}
    };
    this.saveLocalDB();
    console.log('✅ Local database reset to initial seed data.');
  }

  private saveLocalDB() {
    if (this.localData) {
      try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.localData, null, 2), 'utf-8');
      } catch (err) {
        console.error('❌ Failed to write to local database file:', err);
      }
    }
  }

  // --- API Methods ---

  public async getEmployees(): Promise<Employee[]> {
    if (this.isSupabaseEnabled && this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('employees')
        .select('*');
      if (!error && data) return data as Employee[];
      console.warn('Fallback to local: Supabase error fetching employees:', error);
    }
    return this.localData?.employees || [];
  }

  public async getEmployeeById(id: string): Promise<Employee | null> {
    const employees = await this.getEmployees();
    return employees.find(e => e.id === id) || null;
  }

  public async saveEmployee(employee: Employee): Promise<Employee> {
    if (this.isSupabaseEnabled && this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('employees')
        .upsert(employee)
        .select()
        .single();
      if (!error && data) return data as Employee;
      console.warn('Fallback to local: Supabase error saving employee:', error);
    }

    if (this.localData) {
      const idx = this.localData.employees.findIndex(e => e.id === employee.id);
      if (idx !== -1) {
        this.localData.employees[idx] = employee;
      } else {
        this.localData.employees.push(employee);
      }
      this.saveLocalDB();
    }
    return employee;
  }

  public async getProjects(): Promise<Project[]> {
    if (this.isSupabaseEnabled && this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('projects')
        .select('*');
      if (!error && data) return data as Project[];
      console.warn('Fallback to local: Supabase error fetching projects:', error);
    }
    return this.localData?.projects || [];
  }

  public async saveProject(project: Project): Promise<Project> {
    if (this.isSupabaseEnabled && this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('projects')
        .upsert(project)
        .select()
        .single();
      if (!error && data) return data as Project;
      console.warn('Fallback to local: Supabase error saving project:', error);
    }

    if (this.localData) {
      const idx = this.localData.projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        this.localData.projects[idx] = project;
      } else {
        this.localData.projects.push(project);
      }
      this.saveLocalDB();
    }
    return project;
  }

  public async getLearningRecommendations(employeeId: string): Promise<any[]> {
    if (this.isSupabaseEnabled && this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('learning_recommendations')
        .select('*')
        .eq('employee_id', employeeId);
      if (!error && data) return data;
      console.warn('Fallback to local: Supabase error fetching learning recs:', error);
    }
    return this.localData?.learningRecommendations[employeeId] || [];
  }

  public async saveLearningRecommendations(employeeId: string, recs: any[]): Promise<any[]> {
    if (this.isSupabaseEnabled && this.supabaseClient) {
      const dbRecs = recs.map(r => ({ ...r, employee_id: employeeId }));
      const { data, error } = await this.supabaseClient
        .from('learning_recommendations')
        .upsert(dbRecs)
        .select();
      if (!error && data) return data;
      console.warn('Fallback to local: Supabase error saving learning recs:', error);
    }

    if (this.localData) {
      this.localData.learningRecommendations[employeeId] = recs;
      this.saveLocalDB();
    }
    return recs;
  }

  public async getPromotionEvaluation(employeeId: string): Promise<any | null> {
    if (this.isSupabaseEnabled && this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('promotion_evaluations')
        .select('*')
        .eq('employee_id', employeeId)
        .order('evaluated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
      console.warn('Fallback to local: Supabase error fetching promotion eval:', error);
    }
    return this.localData?.promotionEvaluations[employeeId] || null;
  }

  public async savePromotionEvaluation(employeeId: string, evaluation: any): Promise<any> {
    if (this.isSupabaseEnabled && this.supabaseClient) {
      const dbEval = { ...evaluation, employee_id: employeeId, evaluated_at: new Date().toISOString() };
      const { data, error } = await this.supabaseClient
        .from('promotion_evaluations')
        .upsert(dbEval)
        .select()
        .single();
      if (!error && data) return data;
      console.warn('Fallback to local: Supabase error saving promotion eval:', error);
    }

    if (this.localData) {
      this.localData.promotionEvaluations[employeeId] = {
        ...evaluation,
        evaluatedAt: new Date().toISOString()
      };
      this.saveLocalDB();
    }
    return evaluation;
  }
}

export const db = new DatabaseAdapter();
