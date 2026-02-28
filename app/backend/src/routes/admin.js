import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { projectService } from '../services/projectService.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { logSecurityEvent } from '../utils/logger.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the target directory for images exists.
const UPLOADS_DIR = path.join(__dirname, '../../../public/images');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Memory storage is used to prevent blocking disk I/O when processing the request.
// However, writing the file to disk via fs.promises.writeFile is usually fast enough for single files.
// To use multer effectively with disk storage without blocking the event loop:
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Generate a unique, clean filename
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

/**
 * ⚡ Bolt Optimization:
 * Get all projects from memory cache. O(1) return time.
 */
router.get('/', (req, res) => {
  const projects = projectService.getProjects();
  res.json({ success: true, count: projects.length, data: projects });
});

/**
 * ⚡ Bolt Optimization:
 * Create project. In-memory update + fire-and-forget file write.
 */
router.post('/', upload.single('imageFile'), async (req, res) => {
  try {
    const { title, category, location, year, description, sketchfabId, sketchfabTitle, imageUrl } = req.body;

    // Validate required fields fast
    if (!title || !category || !location || !year || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let image = '';

    if (req.file) {
      // The file was uploaded to the public/images directory via multer
      image = `/images/${req.file.filename}`;
    } else if (imageUrl) {
      // Use provided image URL if no file uploaded
      image = imageUrl;
    } else {
      return res.status(400).json({ success: false, message: 'Missing image file or imageUrl' });
    }

    const projectData = {
      title,
      category,
      location,
      year,
      image,
      description,
      sketchfabId,
      sketchfabTitle
    };

    // Add to memory and async save to disk
    const newProject = await projectService.addProject(projectData);

    res.status(201).json({ success: true, message: 'Project created successfully', data: newProject });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating project' });
  }
});

/**
 * ⚡ Bolt Optimization:
 * Delete project. Fast array mutation and non-blocking file deletion.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProject = await projectService.deleteProject(id);

    if (!deletedProject) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // ⚡ Bolt: Asynchronously remove the associated image file from disk (non-blocking)
    if (deletedProject.image && deletedProject.image.startsWith('/images/')) {
      const filename = path.basename(deletedProject.image);
      const filepath = path.join(UPLOADS_DIR, filename);

      // Fire-and-forget unlink to not block the request response
      fs.promises.unlink(filepath).catch((err) => {
        // Log quietly, maybe the file doesn't exist
        console.warn(`Failed to delete image file ${filepath}:`, err.message);
      });
    }

    logSecurityEvent('admin_project_deleted', { ip: req.ip, projectId: id, title: deletedProject.title });

    res.json({ success: true, message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Error deleting project' });
  }
});

export default router;
