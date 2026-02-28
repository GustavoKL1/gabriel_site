import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function NewProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'civil',
    location: '',
    year: '',
    status: 'draft',
    sketchfabUrl: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple validation example
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.year.trim()) newErrors.year = 'Year is required';

    // Check if either an image file or an image URL is provided
    if (!imageFile && !formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Either an Image File or Image URL is required';
    } else if (!imageFile && formData.imageUrl.trim()) {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = 'Please enter a valid URL';
      }
    }

    // Optional sketchfab validation
    if (formData.sketchfabUrl.trim()) {
      try {
        new URL(formData.sketchfabUrl);
      } catch {
        newErrors.sketchfabUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
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
      form.append('description', formData.description);
      form.append('category', formData.category);
      form.append('location', formData.location);
      form.append('year', formData.year);

      if (imageFile) {
        form.append('imageFile', imageFile);
      } else if (formData.imageUrl) {
        form.append('imageUrl', formData.imageUrl);
      }

      if (formData.sketchfabUrl) {
        // Extract sketchfab ID from URL if provided or just pass as sketchfabTitle/sketchfabId depending on backend expectations
        // Assuming sketchfabUrl is the full embed link and we can just pass sketchfabId/sketchfabTitle if needed
        form.append('sketchfabId', formData.sketchfabUrl);
        form.append('sketchfabTitle', formData.title);
      }

      const token = import.meta.env.VITE_ADMIN_TOKEN || 'admin_secret_token'; // Or however auth is handled

      const response = await fetch(`${API_URL}/admin/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Project created successfully!');
        navigate('/admin');
      } else {
        throw new Error(data.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Error creating project');
      setErrors(prev => ({ ...prev, submit: 'Failed to create project' }));
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
              to="/admin"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900" id="page-title">
              Create New Project
            </h2>
          </div>
          <p className="text-slate-500 text-sm ml-10">
            Fill in the details below to add a new project to your portfolio.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8"
        aria-labelledby="page-title"
        noValidate // We use custom validation
      >
        <div className="space-y-8">

          {/* Title Field */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-slate-900">
              Project Title <span className="text-red-500" aria-hidden="true">*</span>
              <span className="sr-only"> (required)</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Modern Residential Complex"
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                errors.title
                  ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : 'title-hint'}
              required
            />
            {errors.title ? (
              <p id="title-error" className="flex items-center gap-1.5 text-sm font-medium text-red-600" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.title}
              </p>
            ) : (
              <p id="title-hint" className="text-sm text-slate-500">
                A clear, descriptive title for the project.
              </p>
            )}
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-semibold text-slate-900">
              Category <span className="text-red-500" aria-hidden="true">*</span>
              <span className="sr-only"> (required)</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. civil"
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                errors.category
                  ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              aria-invalid={!!errors.category}
              required
            />
            {errors.category && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-red-600" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Location Field */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-semibold text-slate-900">
              Location <span className="text-red-500" aria-hidden="true">*</span>
              <span className="sr-only"> (required)</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. São Paulo, SP"
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                errors.location
                  ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              aria-invalid={!!errors.location}
              required
            />
            {errors.location && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-red-600" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.location}
              </p>
            )}
          </div>

          {/* Year Field */}
          <div className="space-y-2">
            <label htmlFor="year" className="block text-sm font-semibold text-slate-900">
              Year <span className="text-red-500" aria-hidden="true">*</span>
              <span className="sr-only"> (required)</span>
            </label>
            <input
              type="text"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g. 2024"
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                errors.year
                  ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              aria-invalid={!!errors.year}
              required
            />
            {errors.year && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-red-600" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.year}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-slate-900">
              Description <span className="text-red-500" aria-hidden="true">*</span>
              <span className="sr-only"> (required)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the project, scope, and results..."
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-y ${
                errors.description
                  ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
              required
            />
            {errors.description && (
              <p id="description-error" className="flex items-center gap-1.5 text-sm font-medium text-red-600" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Image Field */}
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
                    errors.imageUrl && !imageFile
                      ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  aria-invalid={!!errors.imageUrl && !imageFile}
                  disabled={!!imageFile}
                />
              </div>
            </div>
            {errors.imageUrl && !imageFile && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-red-600" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.imageUrl}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Status Field */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-semibold text-slate-900">
                Status <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only"> (required)</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                required
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Visible)</option>
              </select>
            </div>

            {/* Sketchfab Field (Optional) */}
            <div className="space-y-2">
              <label htmlFor="sketchfabUrl" className="block text-sm font-semibold text-slate-900">
                Sketchfab Model URL <span className="text-slate-500 font-normal ml-1">(Optional)</span>
              </label>
              <input
                type="url"
                id="sketchfabUrl"
                name="sketchfabUrl"
                value={formData.sketchfabUrl}
                onChange={handleChange}
                placeholder="https://sketchfab.com/models/..."
                className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  errors.sketchfabUrl
                    ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                aria-invalid={!!errors.sketchfabUrl}
                aria-describedby={errors.sketchfabUrl ? 'sketchfabUrl-error' : 'sketchfabUrl-hint'}
              />
              {errors.sketchfabUrl ? (
                <p id="sketchfabUrl-error" className="flex items-center gap-1.5 text-sm font-medium text-red-600" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.sketchfabUrl}
                </p>
              ) : (
                <p id="sketchfabUrl-hint" className="text-sm text-slate-500">
                  Add an interactive 3D model link to showcase the project.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <Link
            to="/admin"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>Save Project</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
