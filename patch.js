const fs = require('fs');
const file = 'app/src/pages/admin/projects/NewProject.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`  const validateForm = () => {
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
    // Clear error when user types
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
    }`,
`  const validateForm = () => {
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
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
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
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      // Focus the first error field for accessibility
      const firstErrorField = document.getElementById(Object.keys(validationErrors)[0]);
      firstErrorField?.focus();
      return;
    }`
);

fs.writeFileSync(file, content, 'utf8');
