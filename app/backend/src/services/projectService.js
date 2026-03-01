import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The path to the frontend data file
const DATA_FILE_PATH = path.join(__dirname, '../../../src/data/projects.json');

class ProjectService {
  constructor() {
    this.projects = [];
    this.initialized = false;
  }

  // Load the projects into memory once on startup
  async init() {
    if (this.initialized) return;
    try {
      const data = await fs.promises.readFile(DATA_FILE_PATH, 'utf-8');
      this.projects = JSON.parse(data);
      this.initialized = true;
      console.log('⚡ Bolt: Projects loaded into memory for fast access.');
    } catch (error) {
      console.error('Failed to load projects.json:', error);
      // If file doesn't exist, start with an empty array
      this.projects = [];
      this.initialized = true;
    }
  }

  // Fast O(1) return from memory
  getProjects() {
    return this.projects;
  }

  // Get project by ID - fast O(N) lookup
  getProjectById(id) {
    return this.projects.find((p) => p.id === Number(id));
  }

  // Asynchronous non-blocking save to disk
  async _save() {
    try {
      // Stringify and write to file asynchronously to avoid blocking the event loop
      await fs.promises.writeFile(DATA_FILE_PATH, JSON.stringify(this.projects, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save projects to disk:', error);
      throw new Error('Failed to save project data');
    }
  }

  // Add project to memory instantly, then fire-and-forget save to disk
  async addProject(projectData) {
    // Generate a new ID based on the highest existing ID + 1 (O(N) operation)
    const newId = this.projects.length > 0
      ? Math.max(...this.projects.map(p => p.id)) + 1
      : 1;

    const newProject = {
      id: newId,
      ...projectData
    };

    // Update in-memory cache instantly (O(1))
    this.projects.push(newProject);

    // Save asynchronously to disk (non-blocking)
    await this._save();

    return newProject;
  }

  // Update project in memory instantly, then fire-and-forget save to disk
  async updateProject(id, updateData) {
    const projectId = Number(id);
    const index = this.projects.findIndex((p) => p.id === projectId);

    if (index === -1) {
      return null;
    }

    const oldProject = this.projects[index];

    const updatedProject = {
      ...oldProject,
      ...updateData
    };

    // Update in-memory cache instantly (O(1))
    this.projects[index] = updatedProject;

    // Save asynchronously to disk (non-blocking)
    await this._save();

    return { updatedProject, oldProject };
  }

  // Delete project from memory instantly, then fire-and-forget save to disk
  async deleteProject(id) {
    const projectId = Number(id);
    const index = this.projects.findIndex((p) => p.id === projectId);

    if (index === -1) {
      return null;
    }

    const [deletedProject] = this.projects.splice(index, 1);

    // Save asynchronously to disk (non-blocking)
    await this._save();

    return deletedProject;
  }
}

// Export a singleton instance
export const projectService = new ProjectService();
