import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function NewArticle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';

    if (!imageFile && !formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Either an Image File or Image URL is required';
    } else if (!imageFile && formData.imageUrl.trim()) {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
      if (errors.imageUrl) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.imageUrl;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      const errorCount = Object.keys(errors).length;
      if (errorCount > 0) {
          const firstErrorField = document.getElementById(Object.keys(errors)[0]);
          firstErrorField?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('content', formData.content);
      form.append('author', formData.author);
      form.append('category', formData.category);
      form.append('date', formData.date);

      if (imageFile) {
        form.append('imageFile', imageFile);
      } else if (formData.imageUrl) {
        form.append('imageUrl', formData.imageUrl);
      }

      const token = import.meta.env.VITE_ADMIN_TOKEN || 'admin_secret_token';

      const response = await fetch(`${API_URL}/admin/articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Article created successfully!');
        navigate('/admin/articles');
      } else {
        throw new Error(data.message || 'Failed to create article');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Error creating article');
      setErrors(prev => ({ ...prev, submit: 'Failed to create article' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <header className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/admin/articles"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              aria-label="Back to articles"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900" id="page-title">
              Create New Article
            </h2>
          </div>
          <p className="text-slate-500 text-sm ml-10">
            Publish a new article on the blog.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8"
        aria-labelledby="page-title"
        noValidate
      >
        <div className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-slate-900">
              Title <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-slate-300 hover:border-slate-400'
              }`}
            />
            {errors.title && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-red-600"><AlertCircle className="w-4 h-4" />{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-semibold text-slate-900">
                Category <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-slate-300 hover:border-slate-400'
                }`}
              />
              {errors.category && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-red-600"><AlertCircle className="w-4 h-4" />{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="author" className="block text-sm font-semibold text-slate-900">
                Author <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  errors.author ? 'border-red-500' : 'border-slate-300 hover:border-slate-400'
                }`}
              />
              {errors.author && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-red-600"><AlertCircle className="w-4 h-4" />{errors.author}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-semibold text-slate-900">
                Date <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border-slate-300 hover:border-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-semibold text-slate-900">
              Content <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-y ${
                errors.content ? 'border-red-500' : 'border-slate-300 hover:border-slate-400'
              }`}
            />
            {errors.content && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-red-600"><AlertCircle className="w-4 h-4" />{errors.content}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Cover Image <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="imageFile" className="block text-xs text-slate-500 mb-1">Upload File</label>
                <input
                  type="file"
                  id="imageFile"
                  name="imageFile"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label htmlFor="imageUrl" className="block text-xs text-slate-500 mb-1">Or Provide Image URL</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    errors.imageUrl && !imageFile ? 'border-red-500' : 'border-slate-300 hover:border-slate-400'
                  }`}
                  disabled={!!imageFile}
                />
              </div>
            </div>
            {errors.imageUrl && !imageFile && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-red-600"><AlertCircle className="w-4 h-4" />{errors.imageUrl}</p>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <Link
            to="/admin/articles"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : <><Save className="w-4 h-4" /> Save Article</>}
          </button>
        </div>
      </form>
    </div>
  );
}
