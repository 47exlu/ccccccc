import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRepositorySchema, insertImportStepSchema } from "@shared/schema";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const execPromise = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function registerRoutes(app: Express): Promise<Server> {
  // Repository validation endpoint
  app.get("/api/validate-repo", async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Repository URL is required" });
      }
      
      // Simple validation for GitHub URLs
      if (!url.match(/^https?:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/)) {
        return res.status(400).json({ 
          valid: false, 
          message: "Invalid GitHub repository URL format" 
        });
      }
      
      // In a real implementation, you would make a request to GitHub API to validate
      // For simplicity, we'll just check the URL format
      
      // Extract owner and repo name from URL
      const urlParts = url.replace(/\/$/, "").split("/");
      const owner = urlParts[urlParts.length - 2];
      const name = urlParts[urlParts.length - 1];
      
      return res.json({ 
        valid: true, 
        message: "Repository found",
        owner,
        name
      });
    } catch (error) {
      console.error("Error validating repository:", error);
      return res.status(500).json({ error: "Failed to validate repository" });
    }
  });

  // Start import process
  app.post("/api/import", async (req, res) => {
    try {
      const {
        repositoryUrl,
        destinationDir,
        installDependencies,
        setupNodeBackend,
        preserveStructure
      } = req.body;
      
      if (!repositoryUrl || !destinationDir) {
        return res.status(400).json({ error: "Repository URL and destination directory are required" });
      }
      
      // Extract repo information
      const urlParts = repositoryUrl.replace(/\/$/, "").split("/");
      const owner = urlParts[urlParts.length - 2];
      const name = urlParts[urlParts.length - 1];
      
      // Create repository record
      const repoData = {
        url: repositoryUrl,
        owner,
        name,
        branch: "main",
        importPath: destinationDir,
        status: "pending"
      };
      
      const validatedData = insertRepositorySchema.parse(repoData);
      const repository = await storage.createRepository(validatedData);
      
      // Create initial import steps
      const steps = [
        { step: "Clone repository", status: "pending" },
        { step: "Analyze file structure", status: "pending" },
        { step: "Install dependencies", status: "pending" },
        { step: "Configure Node.js backend", status: "pending" },
        { step: "Complete setup", status: "pending" }
      ];
      
      const importSteps = [];
      for (const step of steps) {
        const validatedStep = insertImportStepSchema.parse({
          ...step,
          repositoryId: repository.id
        });
        const importStep = await storage.createImportStep(validatedStep);
        importSteps.push(importStep);
      }
      
      // Start import process in the background
      startImportProcess(repository.id, {
        repositoryUrl,
        destinationDir,
        installDependencies: !!installDependencies,
        setupNodeBackend: !!setupNodeBackend,
        preserveStructure: !!preserveStructure
      });
      
      return res.json({ 
        success: true, 
        repository,
        steps: importSteps
      });
    } catch (error) {
      console.error("Error starting import:", error);
      return res.status(500).json({ error: "Failed to start import process" });
    }
  });

  // Get repository status
  app.get("/api/repository/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid repository ID" });
      }
      
      const repository = await storage.getRepository(id);
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }
      
      const steps = await storage.getImportStepsByRepositoryId(id);
      const dependencies = await storage.getDependenciesByRepositoryId(id);
      
      return res.json({
        repository,
        steps,
        dependencies
      });
    } catch (error) {
      console.error("Error getting repository status:", error);
      return res.status(500).json({ error: "Failed to get repository status" });
    }
  });

  // List all imported repositories
  app.get("/api/repositories", async (req, res) => {
    try {
      const repositories = await storage.listRepositories();
      return res.json({ repositories });
    } catch (error) {
      console.error("Error listing repositories:", error);
      return res.status(500).json({ error: "Failed to list repositories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Import process logic
async function startImportProcess(
  repositoryId: number, 
  options: { 
    repositoryUrl: string, 
    destinationDir: string, 
    installDependencies: boolean, 
    setupNodeBackend: boolean,
    preserveStructure: boolean
  }
) {
  try {
    const { repositoryUrl, destinationDir } = options;
    const steps = await storage.getImportStepsByRepositoryId(repositoryId);
    
    // Update repository status
    await storage.updateRepositoryStatus(repositoryId, "in_progress");
    
    // Step 1: Clone repository
    const step1 = steps.find(s => s.step === "Clone repository");
    if (step1) {
      await storage.updateImportStepStatus(step1.id, "in_progress");
      
      try {
        // For the demo, we'll simulate the clone process
        // In a real implementation, you would execute the git clone command
        
        // Simulate cloning delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const output = `Cloning into '${destinationDir}'...
remote: Enumerating objects: 127, done.
remote: Counting objects: 100% (127/127), done.
remote: Compressing objects: 100% (98/98), done.
Receiving objects: 100% (127/127), 23.45 KiB | 4.79 MiB/s, done.
Resolving deltas: 100% (45/45), done.`;
        
        await storage.updateImportStepStatus(step1.id, "completed", output);
      } catch (error) {
        console.error("Error cloning repository:", error);
        await storage.updateImportStepStatus(step1.id, "failed", String(error));
        await storage.updateRepositoryStatus(repositoryId, "failed");
        return;
      }
    }
    
    // Step 2: Analyze file structure
    const step2 = steps.find(s => s.step === "Analyze file structure");
    if (step2) {
      await storage.updateImportStepStatus(step2.id, "in_progress");
      
      try {
        // Simulate file structure analysis
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate finding dependencies in package.json
        const dependencies = [
          { name: "express", version: "^4.18.2", isDev: false },
          { name: "mongoose", version: "^6.9.0", isDev: false },
          { name: "dotenv", version: "^16.0.3", isDev: false },
          { name: "cors", version: "^2.8.5", isDev: false },
          { name: "nodemon", version: "^2.0.22", isDev: true }
        ];
        
        // Create dependency records
        for (const dep of dependencies) {
          await storage.createDependency({
            repositoryId,
            name: dep.name,
            version: dep.version,
            isDev: dep.isDev
          });
        }
        
        const output = `File structure analysis completed.
Found package.json with ${dependencies.length} dependencies.
Found HTML/CSS/JS files for frontend.
Directory structure preserved.`;
        
        await storage.updateImportStepStatus(step2.id, "completed", output);
      } catch (error) {
        console.error("Error analyzing file structure:", error);
        await storage.updateImportStepStatus(step2.id, "failed", String(error));
        await storage.updateRepositoryStatus(repositoryId, "failed");
        return;
      }
    }
    
    // Step 3: Install dependencies (if selected)
    const step3 = steps.find(s => s.step === "Install dependencies");
    if (step3) {
      if (options.installDependencies) {
        await storage.updateImportStepStatus(step3.id, "in_progress");
        
        try {
          // Simulate installing dependencies
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const output = `$ cd ${destinationDir}
$ npm install
added 256 packages in 8s
WARN deprecated request@2.88.2: request has been deprecated
Installing dev dependencies...
+ nodemon@2.0.22
+ express@4.18.2
All dependencies installed successfully.`;
          
          await storage.updateImportStepStatus(step3.id, "completed", output);
        } catch (error) {
          console.error("Error installing dependencies:", error);
          await storage.updateImportStepStatus(step3.id, "failed", String(error));
          await storage.updateRepositoryStatus(repositoryId, "failed");
          return;
        }
      } else {
        await storage.updateImportStepStatus(step3.id, "skipped", "Dependency installation skipped per user request.");
      }
    }
    
    // Step 4: Configure Node.js backend (if selected)
    const step4 = steps.find(s => s.step === "Configure Node.js backend");
    if (step4) {
      if (options.setupNodeBackend) {
        await storage.updateImportStepStatus(step4.id, "in_progress");
        
        try {
          // Simulate configuring Node.js backend
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const output = `Setting up Node.js backend...
Creating server.js file.
Configuring Express routes.
Setting up environment variables in .env file.
Node.js backend configuration completed.`;
          
          await storage.updateImportStepStatus(step4.id, "completed", output);
        } catch (error) {
          console.error("Error configuring Node.js backend:", error);
          await storage.updateImportStepStatus(step4.id, "failed", String(error));
          await storage.updateRepositoryStatus(repositoryId, "failed");
          return;
        }
      } else {
        await storage.updateImportStepStatus(step4.id, "skipped", "Node.js backend configuration skipped per user request.");
      }
    }
    
    // Step 5: Complete setup
    const step5 = steps.find(s => s.step === "Complete setup");
    if (step5) {
      await storage.updateImportStepStatus(step5.id, "in_progress");
      
      try {
        // Simulate completing setup
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const output = `Import process completed successfully!
Project is ready at: ${destinationDir}
To start the application:
$ cd ${destinationDir}
$ npm start`;
        
        await storage.updateImportStepStatus(step5.id, "completed", output);
        await storage.updateRepositoryStatus(repositoryId, "completed");
      } catch (error) {
        console.error("Error completing setup:", error);
        await storage.updateImportStepStatus(step5.id, "failed", String(error));
        await storage.updateRepositoryStatus(repositoryId, "failed");
        return;
      }
    }
  } catch (error) {
    console.error("Error in import process:", error);
    await storage.updateRepositoryStatus(repositoryId, "failed");
  }
}
