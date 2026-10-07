"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Upload, AlertCircle, CheckCircle, ChevronLeft, X, LayoutDashboard, ShieldCheck } from 'lucide-react';

// Categories for dropdown selection
const CATEGORIES = [
  "Electronics",
  "Wallets & IDs",
  "Keys",
  "Bags & Luggage",
  "Documents & Folders",
  "Jewelry & Watches",
  "Pets",
  "Clothing & Accessories",
  "Other"
];

const INPUT_CLASSES = "w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

function FormGroup({ label, id, error, required, children, helperText }) {
  return (
    <div className="mb-5 relative">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div>{children}</div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center animate-in fade-in">
          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 max-w-2xl">{helperText}</p>
      )}
    </div>
  );
}

export default function ReportLostItemPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    color: "",
    description: "",
    dateLost: "",
    locationLost: "",
    brand: ""
  });

  // Image Upload States 
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validates and processes the selected image file
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image must be less than 5MB" }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: "Please upload a valid image file" }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, image: "" }));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    const titleTrimmed = formData.title.trim();
    if (!titleTrimmed) {
      newErrors.title = "Title is required";
    } else if (titleTrimmed.length < 5) {
      newErrors.title = "Min 5 characters";
    } else if (titleTrimmed.length > 100) {
      newErrors.title = "Max 100 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.color.trim()) {
      newErrors.color = "Color is required";
    }

    const descTrimmed = formData.description.trim();
    if (!descTrimmed) {
      newErrors.description = "Description is required";
    } else if (descTrimmed.length < 30) {
      newErrors.description = "Min 30 characters";
    } else if (descTrimmed.length > 1000) {
      newErrors.description = "Max 1000 characters";
    }

    if (!formData.dateLost) {
      newErrors.dateLost = "Date is required";
    } else if (formData.dateLost > today) {
      newErrors.dateLost = "Cannot be in the future";
    }

    const locationTrimmed = formData.locationLost.trim();
    if (!locationTrimmed) {
      newErrors.locationLost = "Location is required";
    } else if (locationTrimmed.length < 5) {
      newErrors.locationLost = "Be more specific";
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setDuplicateWarning("");

    if (hasSubmitted) {
      setApiError("Already submitted.");
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }


    try {
      setLoading(true);

      if (!imageFile) {
        setErrors(prev => ({ ...prev, image: "Please upload an image" }));
        window.scrollTo({ top: 500, behavior: 'smooth' });
        return;
      }

      let uploadedImages = [];

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", imageFile);
        const uploadResponse = await fetch('/api/upload/image', {
          method: 'POST',
          body: uploadFormData
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
          uploadedImages = [
            {
              url: uploadResult.url,
              public_id: uploadResult.public_id
            }
          ];
          setFormData(prev => ({
            ...prev,
            images: uploadedImages
          }));
        } else {
          setApiError(uploadResult.message || "Image upload failed. Please try again.");
          setLoading(false);
          return;
        }
      }

      const response = await fetch('/api/items/lost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData: {
            ...formData,
            images: uploadedImages
          }
        })
      });

      const result = await response.json();
      console.log(result);


      if (result.success) {
        setSuccess(true);
        setHasSubmitted(true);
      } else {
        setApiError(result.message || 'Something went wrong. Please try again.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submit error:', err);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Success Render State ---
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 text-center sm:p-12">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">Report Submitted</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Your lost item report has been securely added to our database.</p>
          <div className="flex flex-col space-y-3">
            <Link href="/" className="w-full flex justify-center py-3 px-4 bg-blue-600 text-white rounded-xl font-bold">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Form Render State ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans pb-32">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 mb-4 hover:text-blue-600">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <AlertCircle className="w-8 h-8 mr-3 text-red-500" /> Report Lost Item
          </h1>
        </div>

        {/* Global Errors & Warnings */}
        {apiError && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md font-medium">{apiError}</div>}
        {duplicateWarning && <div className="mb-6 p-4 bg-yellow-50 text-yellow-700 rounded-md font-medium">{duplicateWarning}</div>}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>

          {/* Public Details */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-b border-gray-100 dark:border-gray-800 flex items-center font-bold text-lg dark:text-white">
              <LayoutDashboard className="w-5 h-5 mr-2 text-blue-600" /> Public Details
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="md:col-span-2">
                  <FormGroup id="title" label="Item Title" error={errors.title} required>
                    <input type="text" id="title" name="title" className={INPUT_CLASSES} value={formData.title} onChange={handleInputChange} />
                  </FormGroup>
                </div>

                <FormGroup id="category" label="Category" error={errors.category} required>
                  <select id="category" name="category" className={INPUT_CLASSES} value={formData.category} onChange={handleInputChange}>
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </FormGroup>

                <FormGroup id="color" label="Color" error={errors.color} required>
                  <input type="text" id="color" name="color" className={INPUT_CLASSES} value={formData.color} onChange={handleInputChange} />
                </FormGroup>

                <FormGroup id="dateLost" label="Date Lost" error={errors.dateLost} required>
                  <input type="date" id="dateLost" name="dateLost" max={new Date().toISOString().split('T')[0]} className={INPUT_CLASSES} value={formData.dateLost} onChange={handleInputChange} />
                </FormGroup>

                <FormGroup id="locationLost" label="Location Lost" error={errors.locationLost} required>
                  <input type="text" id="locationLost" name="locationLost" className={INPUT_CLASSES} value={formData.locationLost} onChange={handleInputChange} />
                </FormGroup>

                <div className="md:col-span-2">
                  <FormGroup id="description" label="Description" error={errors.description} required helperText="Do not include sensitive info here.">
                    <textarea rows={4} id="description" name="description" className={INPUT_CLASSES} value={formData.description} onChange={handleInputChange} />
                  </FormGroup>
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <FormGroup id="image" label="Upload Image" error={errors.image} helperText="Upload a clear picture of the item if you have one. Max 5MB.">
                    {!imagePreview ? (
                      <div
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="space-y-2 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                              <input
                                id="file-upload" name="file-upload" type="file" className="sr-only"
                                accept="image/jpeg, image/png, image/webp"
                                ref={fileInputRef} onChange={handleImageUpload}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 inline-block">
                        <img src={imagePreview} alt="Preview" className="max-h-64 object-contain bg-gray-50 dark:bg-gray-800" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-sm z-10"
                          title="Remove image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </FormGroup>
                </div>

              </div>
            </div>
          </div>



          <button type="submit" disabled={loading} className="w-full py-4 text-center bg-blue-600 text-white font-bold rounded-xl disabled:bg-blue-400">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>

        </form>
      </div>
    </div>
  );
}