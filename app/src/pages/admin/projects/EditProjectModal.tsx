import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import type { Project } from '../../../types/project';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: () => void;
}

export default function EditProjectModal({ isOpen, onClose, project, onSuccess }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'civil',
    location: '',
    year: '',
    description: '',
    imageUrl: '',
    sketchfabUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        title: project.title,
        category: project.category,
        location: project.location,
        year: project.year,
        description: project.description,
        imageUrl: project.image,
        sketchfabUrl: project.sketchfabId ? `https://sketchfab.com/models/${project.sketchfabId}` : ''
      });
      setImageFile(null);
      setErrors({});
    }
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.year.trim()) newErrors.year = 'Year is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (formData.sketchfabUrl) {
      try {
        new URL(formData.sketchfabUrl);
      } catch {
        newErrors.sketchfabUrl = 'Must be a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const extractSketchfabId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:models\/|3d-models\/)(?:[a-zA-Z0-9-]+-)?([a-zA-Z0-9]{32})/);
    return match ? match[1] : null;
  };

  const extractSketchfabTitle = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:models\/|3d-models\/)([a-zA-Z0-9-]+)-[a-zA-Z0-9]{32}/);
    return match ? match[1].replace(/-/g, ' ') : null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
      if (errors.imageUrl) setErrors(prev => ({ ...prev, imageUrl: '' }));
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !project) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('category', formData.category);
      submitData.append('location', formData.location.trim());
      submitData.append('year', formData.year.trim());
      submitData.append('description', formData.description.trim());

      if (imageFile) {
        submitData.append('imageFile', imageFile);
      } else if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }

      if (formData.sketchfabUrl) {
        const sketchfabId = extractSketchfabId(formData.sketchfabUrl);
        const sketchfabTitle = extractSketchfabTitle(formData.sketchfabUrl);
        if (sketchfabId) {
          submitData.append('sketchfabId', sketchfabId);
          if (sketchfabTitle) submitData.append('sketchfabTitle', sketchfabTitle);
        }
      } else {
        submitData.append('sketchfabId', '');
        submitData.append('sketchfabTitle', '');
      }

      const token = import.meta.env.VITE_ADMIN_TOKEN || 'admin_secret_token';
      const response = await fetch(`${API_URL}/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Project updated successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="block text-sm font-semibold text-slate-900">Title</label>
              <input
                type="text"
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm border-slate-300"
                required
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-category" className="block text-sm font-semibold text-slate-900">Category</label>
              <select
                id="edit-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm border-slate-300 bg-white"
                required
              >
                <option value="civil">Civil Engineering</option>
                <option value="architectural">Architectural</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="edit-location" className="block text-sm font-semibold text-slate-900">Location</label>
              <input
                type="text"
                id="edit-location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm border-slate-300"
                required
              />
              {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-year" className="block text-sm font-semibold text-slate-900">Year</label>
              <input
                type="text"
                id="edit-year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm border-slate-300"
                required
              />
              {errors.year && <p className="text-sm text-red-600">{errors.year}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-description" className="block text-sm font-semibold text-slate-900">Description</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border px-3 py-2 text-sm border-slate-300"
              required
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Cover Image</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-imageFile" className="block text-xs text-slate-500 mb-1">Upload New File</label>
                <input
                  type="file"
                  id="edit-imageFile"
                  name="imageFile"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label htmlFor="edit-imageUrl" className="block text-xs text-slate-500 mb-1">Or Provide Image URL</label>
                <input
                  type="url"
                  id="edit-imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full rounded-md border px-3 py-2 text-sm border-slate-300"
                  disabled={!!imageFile}
                />
              </div>
            </div>
            {project?.image && !imageFile && (
              <p className="text-xs text-slate-500 mt-2">Current Image: <a href={project.image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a></p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-sketchfabUrl" className="block text-sm font-semibold text-slate-900">Sketchfab Model URL</label>
            <input
              type="url"
              id="edit-sketchfabUrl"
              name="sketchfabUrl"
              value={formData.sketchfabUrl}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm border-slate-300"
            />
            {errors.sketchfabUrl && <p className="text-sm text-red-600">{errors.sketchfabUrl}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
