import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewProject() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    status: 'draft',
    sketchfabUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple validation example
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    // Check if the image url is a valid URL and not empty
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    } else {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Announce to screen readers that validation failed (in a real app, might use an aria-live region)
      const errorCount = Object.keys(errors).length;
      if (errorCount > 0) {
          // Focus the first error field
          const firstErrorField = document.getElementById(Object.keys(errors)[0]);
          firstErrorField?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      // In a real app we'd redirect or show a success message via sonner/toast here
    }, 1000);
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

          {/* Image URL Field */}
          <div className="space-y-2">
            <label htmlFor="imageUrl" className="block text-sm font-semibold text-slate-900">
              Cover Image URL <span className="text-red-500" aria-hidden="true">*</span>
              <span className="sr-only"> (required)</span>
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                errors.imageUrl
                  ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              aria-invalid={!!errors.imageUrl}
              aria-describedby={errors.imageUrl ? 'imageUrl-error' : 'imageUrl-hint'}
              required
            />
            {errors.imageUrl ? (
              <p id="imageUrl-error" className="flex items-center gap-1.5 text-sm font-medium text-red-600" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.imageUrl}
              </p>
            ) : (
              <p id="imageUrl-hint" className="text-sm text-slate-500">
                Provide a direct link to a high-quality cover image.
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
