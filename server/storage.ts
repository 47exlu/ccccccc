import { 
  User, InsertUser, 
  Repository, InsertRepository, 
  Dependency, InsertDependency, 
  ImportStep, InsertImportStep
} from "@shared/schema";

// Modify the interface with CRUD methods needed
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Repository operations
  getRepository(id: number): Promise<Repository | undefined>;
  getRepositoryByUrl(url: string): Promise<Repository | undefined>;
  listRepositories(): Promise<Repository[]>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  updateRepositoryStatus(id: number, status: string): Promise<Repository>;
  
  // Dependency operations
  createDependency(dependency: InsertDependency): Promise<Dependency>;
  getDependenciesByRepositoryId(repositoryId: number): Promise<Dependency[]>;
  
  // Import steps operations
  createImportStep(step: InsertImportStep): Promise<ImportStep>;
  getImportStepsByRepositoryId(repositoryId: number): Promise<ImportStep[]>;
  updateImportStepStatus(id: number, status: string, output?: string): Promise<ImportStep>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private repositories: Map<number, Repository>;
  private dependencies: Map<number, Dependency>;
  private importSteps: Map<number, ImportStep>;
  private currentUserId: number;
  private currentRepoId: number;
  private currentDependencyId: number;
  private currentStepId: number;

  constructor() {
    this.users = new Map();
    this.repositories = new Map();
    this.dependencies = new Map();
    this.importSteps = new Map();
    this.currentUserId = 1;
    this.currentRepoId = 1;
    this.currentDependencyId = 1;
    this.currentStepId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Repository methods
  async getRepository(id: number): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }

  async getRepositoryByUrl(url: string): Promise<Repository | undefined> {
    return Array.from(this.repositories.values()).find(
      (repo) => repo.url === url,
    );
  }

  async listRepositories(): Promise<Repository[]> {
    return Array.from(this.repositories.values());
  }

  async createRepository(repository: InsertRepository): Promise<Repository> {
    const id = this.currentRepoId++;
    const date = new Date();
    const newRepo: Repository = { ...repository, id, importDate: date };
    this.repositories.set(id, newRepo);
    return newRepo;
  }

  async updateRepositoryStatus(id: number, status: string): Promise<Repository> {
    const repo = await this.getRepository(id);
    if (!repo) {
      throw new Error(`Repository with ID ${id} not found`);
    }
    
    const updatedRepo = { ...repo, status };
    this.repositories.set(id, updatedRepo);
    return updatedRepo;
  }

  // Dependency methods
  async createDependency(dependency: InsertDependency): Promise<Dependency> {
    const id = this.currentDependencyId++;
    const newDependency: Dependency = { ...dependency, id };
    this.dependencies.set(id, newDependency);
    return newDependency;
  }

  async getDependenciesByRepositoryId(repositoryId: number): Promise<Dependency[]> {
    return Array.from(this.dependencies.values()).filter(
      (dep) => dep.repositoryId === repositoryId,
    );
  }

  // Import steps methods
  async createImportStep(step: InsertImportStep): Promise<ImportStep> {
    const id = this.currentStepId++;
    const date = new Date();
    const newStep: ImportStep = { ...step, id, timestamp: date };
    this.importSteps.set(id, newStep);
    return newStep;
  }

  async getImportStepsByRepositoryId(repositoryId: number): Promise<ImportStep[]> {
    return Array.from(this.importSteps.values())
      .filter((step) => step.repositoryId === repositoryId)
      .sort((a, b) => a.id - b.id);
  }

  async updateImportStepStatus(id: number, status: string, output?: string): Promise<ImportStep> {
    const step = this.importSteps.get(id);
    if (!step) {
      throw new Error(`Import step with ID ${id} not found`);
    }
    
    const updatedStep: ImportStep = { 
      ...step, 
      status, 
      ...(output ? { output } : {})
    };
    
    this.importSteps.set(id, updatedStep);
    return updatedStep;
  }
}

export const storage = new MemStorage();
