import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { articleService } from '../services/articleService.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { logSecurityEvent } from '../utils/logger.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the target directory for images exists.
const UPLOADS_DIR = path.join(__dirname, '../../../public/images/articles');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
  },
});

// All routes in this router require admin authentication
router.use(adminAuth);

router.get('/', (req, res) => {
  const articles = articleService.getArticles();
  res.json({ success: true, count: articles.length, data: articles });
});

router.post('/', upload.single('imageFile'), async (req, res) => {
  try {
    const { title, content, author, category, date, imageUrl } = req.body;

    // Validate required fields fast
    if (!title || !content || !author || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let image = '';

    if (req.file) {
      image = `/images/articles/${req.file.filename}`;
    } else if (imageUrl) {
      image = imageUrl;
    } else {
      return res.status(400).json({ success: false, message: 'Missing image file or imageUrl' });
    }

    const articleData = {
      title,
      content,
      author,
      category,
      date: date || new Date().toISOString(),
      imageUrl: image
    };

    const newArticle = await articleService.addArticle(articleData);

    res.status(201).json({ success: true, message: 'Article created successfully', data: newArticle });

  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating article' });
  }
});

router.put('/:id', upload.single('imageFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author, category, date, imageUrl } = req.body;

    let image = undefined;

    if (req.file) {
      image = `/images/articles/${req.file.filename}`;
    } else if (imageUrl) {
      image = imageUrl;
    }

    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(author && { author }),
      ...(category && { category }),
      ...(date && { date }),
      ...(image && { imageUrl: image })
    };

    const result = await articleService.updateArticle(id, updateData);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const { updatedArticle, oldArticle } = result;

    if (image && oldArticle.imageUrl && oldArticle.imageUrl.startsWith('/images/articles/') && oldArticle.imageUrl !== image) {
      const filename = path.basename(oldArticle.imageUrl);
      const filepath = path.join(UPLOADS_DIR, filename);

      fs.promises.unlink(filepath).catch((err) => {
        console.warn(`Failed to delete old image file ${filepath}:`, err.message);
      });
    }

    logSecurityEvent('admin_article_updated', { ip: req.ip, articleId: id, title: updatedArticle.title });

    res.json({ success: true, message: 'Article updated successfully', data: updatedArticle });

  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating article' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedArticle = await articleService.deleteArticle(id);

    if (!deletedArticle) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (deletedArticle.imageUrl && deletedArticle.imageUrl.startsWith('/images/articles/')) {
      const filename = path.basename(deletedArticle.imageUrl);
      const filepath = path.join(UPLOADS_DIR, filename);

      fs.promises.unlink(filepath).catch((err) => {
        console.warn(`Failed to delete image file ${filepath}:`, err.message);
      });
    }

    logSecurityEvent('admin_article_deleted', { ip: req.ip, articleId: id, title: deletedArticle.title });

    res.json({ success: true, message: 'Article deleted successfully' });

  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ success: false, message: 'Error deleting article' });
  }
});

export default router;
