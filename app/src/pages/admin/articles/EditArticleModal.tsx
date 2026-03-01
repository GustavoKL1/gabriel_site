import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import type { Article } from '../../../types/article';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface EditArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  onSuccess: () => void;
}

export default function EditArticleModal({ isOpen, onClose, article, onSuccess }: EditArticleModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: '',
    date: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (article && isOpen) {
      setFormData({
        title: article.title,
        content: article.content,
        author: article.author,
        category: article.category,
        date: article.date.split('T')[0],
        imageUrl: article.imageUrl
      });
      setImageFile(null);
      setErrors({});
    }
  }, [article, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!validateForm() || !article) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('content', formData.content.trim());
      submitData.append('author', formData.author.trim());
      submitData.append('category', formData.category.trim());

      // Formatting date back to ISO string
      const fullDate = formData.date ? new Date(formData.date).toISOString() : new Date().toISOString();
      submitData.append('date', fullDate);

      if (imageFile) {
        submitData.append('imageFile', imageFile);
      } else if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }

      const token = import.meta.env.VITE_ADMIN_TOKEN || 'admin_secret_token';
      const response = await fetch(`${API_URL}/admin/articles/${article.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Article updated successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to update article');
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
          <DialogTitle>Edit Article</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="edit-author" className="block text-sm font-semibold text-slate-900">Author</label>
              <input
                type="text"
                id="edit-author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm border-slate-300"
                required
              />
              {errors.author && <p className="text-sm text-red-600">{errors.author}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-category" className="block text-sm font-semibold text-slate-900">Category</label>
              <input
                type="text"
                id="edit-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm border-slate-300"
                required
              />
              {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-date" className="block text-sm font-semibold text-slate-900">Date</label>
            <input
              type="date"
              id="edit-date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm border-slate-300"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-content" className="block text-sm font-semibold text-slate-900">Content</label>
            <textarea
              id="edit-content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              className="w-full rounded-md border px-3 py-2 text-sm border-slate-300 font-mono"
              required
            />
            {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
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
            {article?.imageUrl && !imageFile && (
              <p className="text-xs text-slate-500 mt-2">Current Image: <a href={article.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a></p>
            )}
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
