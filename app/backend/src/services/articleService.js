import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The path to the frontend data file
const DATA_FILE_PATH = path.join(__dirname, '../../../src/data/articles.json');

class ArticleService {
  constructor() {
    this.articles = [];
    this.initialized = false;
  }

  // Load the articles into memory once on startup
  async init() {
    if (this.initialized) return;
    try {
      // Create file with empty array if it doesn't exist
      if (!fs.existsSync(DATA_FILE_PATH)) {
        await fs.promises.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
        await fs.promises.writeFile(DATA_FILE_PATH, '[]', 'utf-8');
      }

      const data = await fs.promises.readFile(DATA_FILE_PATH, 'utf-8');
      this.articles = JSON.parse(data);
      this.initialized = true;
      console.log('⚡ Bolt: Articles loaded into memory for fast access.');
    } catch (error) {
      console.error('Failed to load articles.json:', error);
      this.articles = [];
      this.initialized = true;
    }
  }

  // Fast O(1) return from memory
  getArticles() {
    return this.articles;
  }

  // Get article by ID - fast O(N) lookup
  getArticleById(id) {
    return this.articles.find((a) => a.id === Number(id));
  }

  // Asynchronous non-blocking save to disk
  async _save() {
    try {
      await fs.promises.writeFile(DATA_FILE_PATH, JSON.stringify(this.articles, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save articles to disk:', error);
      throw new Error('Failed to save article data');
    }
  }

  // Add article to memory instantly, then fire-and-forget save to disk
  async addArticle(articleData) {
    const newId = this.articles.length > 0
      ? Math.max(...this.articles.map(a => a.id)) + 1
      : 1;

    const newArticle = {
      id: newId,
      ...articleData,
      date: articleData.date || new Date().toISOString()
    };

    this.articles.push(newArticle);
    await this._save();
    return newArticle;
  }

  // Update article in memory instantly, then fire-and-forget save to disk
  async updateArticle(id, updateData) {
    const articleId = Number(id);
    const index = this.articles.findIndex((a) => a.id === articleId);

    if (index === -1) {
      return null;
    }

    const oldArticle = this.articles[index];

    const updatedArticle = {
      ...oldArticle,
      ...updateData
    };

    // Update in-memory cache instantly (O(1))
    this.articles[index] = updatedArticle;

    // Save asynchronously to disk (non-blocking)
    await this._save();

    return { updatedArticle, oldArticle };
  }

  // Delete article from memory instantly, then fire-and-forget save to disk
  async deleteArticle(id) {
    const articleId = Number(id);
    const index = this.articles.findIndex((a) => a.id === articleId);

    if (index === -1) {
      return null;
    }

    const [deletedArticle] = this.articles.splice(index, 1);
    await this._save();
    return deletedArticle;
  }
}

// Export a singleton instance
export const articleService = new ArticleService();
