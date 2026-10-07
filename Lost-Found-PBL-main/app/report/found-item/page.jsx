"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Upload, AlertCircle, CheckCircle, Search, MapPin, Calendar, ShieldAlert,
  ChevronLeft, Loader2, X, Sparkles, UserCheck, EyeOff
} from 'lucide-react';

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

// Mock potential lost items matched from the database
const MOCK_MATCHING_LOST_ITEMS = [
  {
    id: 'm1',
    title: 'Black Leather Wallet',
    location: 'Central Library, 2nd Floor',
    date: '2026-03-15',
    ownerFirstName: 'Alex',
    matchScore: 92
  },
  {
    id: 'm2',
    title: 'Dark Wallet with Student ID',
    location: 'Near Student Union',
    date: '2026-03-16',
    ownerFirstName: 'Sarah',
    matchScore: 85
  }
];

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

export default function ReportFoundItemPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [matches, setMatches] = useState([]);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    color: "",
    description: "",
    dateFound: "",
    locationFound: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  const [claimingItemId, setClaimingItemId] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.title.trim()) newErrors.title = "Title is required";
    else if (formData.title.trim().length < 5) newErrors.title = "Min 5 characters";
    else if (formData.title.trim().length > 50) newErrors.title = "Max 50 characters (Keep it concise)";

    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.color.trim()) newErrors.color = "Color is required";

    // Strict description validation to avoid revealing verification secrets
    if (!formData.description.trim()) newErrors.description = "A short description is required";
    else if (formData.description.trim().length < 10) newErrors.description = "Min 10 characters";
    else if (formData.description.trim().length > 150) newErrors.description = "Max 150 characters (Do NOT reveal sensitive/hidden details)";

    if (!formData.dateFound) newErrors.dateFound = "Date is required";
    else if (formData.dateFound > today) newErrors.dateFound = "Cannot be in the future";

    if (!formData.locationFound.trim()) newErrors.locationFound = "Location is required";
    else if (formData.locationFound.trim().length < 5) newErrors.locationFound = "Be more specific";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setDuplicateWarning("");

    if (hasSubmitted) {
      setApiError("Already submitted this report.");
      return;
    }

    if (!imageFile) {
      setErrors(prev => ({ ...prev, image: "Image is required" }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);

      const imageUploadData = new FormData();
      imageUploadData.append("image", imageFile);
      const uploadRes = await fetch("/api/upload/image", {
        method: "POST",
        body: imageUploadData
      })

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        setApiError(uploadData.message);
        setLoading(false);
        return;
      }

      const uploadedImages = [
        {
          url: uploadData.url,
          public_id: uploadData.public_id
        }
      ];

      const finalFormData = {
        ...formData,
        images: uploadedImages
      };

      setFormData(finalFormData);

      const foundItemsRes = await fetch("/api/items/found", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ foundItem: finalFormData })
      })

      const foundItemsData = await foundItemsRes.json();

      if (!foundItemsData.success) {
        setApiError(foundItemsData.message);
        setLoading(false);
        return;
      }

      setMatches(foundItemsData.foundItems);

      setSuccess(true);
      setHasSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setApiError("Something went wrong. Please try again.");
    } finally {
      if (!success) setLoading(false);
    }
  };

  const handleClaimInitiation = async (itemId) => {
    setClaimingItemId(itemId);
    setClaimLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setClaimLoading(false);
    console.log(itemId)
    alert("Connection request sent! The owner must now answer their hidden verification questions correctly to claim this item from you.");
  };

  // Success State showing Matches
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-green-50 dark:bg-green-900/20 px-8 py-10 text-center border-b border-green-100 dark:border-green-900/50">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Item Added to System</h2>
              <p className="text-green-800 dark:text-green-300 max-w-xl mx-auto">
                Thank you for your honesty! The item has been safely recorded. We automatically searched our database and found some people looking for a similar item.
              </p>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold flex items-center text-gray-900 dark:text-white mb-6">
                <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
                Potential Matches ({matches.length})
              </h3>

              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div key={match.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:shadow-md">
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">{match.title}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {match.matchScore}% Match
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-y-2 gap-x-4">
                          <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {match.location}</span>
                          <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Lost on {new Date(match.date).toLocaleDateString()}</span>
                          <span className="flex items-center"><UserCheck className="w-4 h-4 mr-1" /> Owner: {match.ownerFirstName}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaimInitiation(match.id)}
                        disabled={claimLoading && claimingItemId === match.id}
                        className="sm:w-auto w-full flex-shrink-0 inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-400"
                      >
                        {claimLoading && claimingItemId === match.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                        ) : (
                          'Inform Owner'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No strong matches found in the current database. We will notify you when a match appears.</p>
                </div>
              )}

              <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                <Link href="/" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-500">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form UI
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans pb-32">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 mb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
          <div className="flex items-start sm:items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-4 shadow-inner">
              <Search className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Report Found Item
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                You found something! Let's help get it back to its owner securely and safely.
              </p>
            </div>
          </div>
        </div>

        {apiError && <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-medium flex items-center shadow-sm"><AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />{apiError}</div>}
        {duplicateWarning && <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-xl font-medium flex flex-col shadow-sm"><div className="flex items-center"><AlertCircle className="w-5 h-5 mr-3 text-yellow-500 flex-shrink-0" />{duplicateWarning}</div><button onClick={() => setDuplicateWarning("")} className="mt-2 ml-8 text-sm font-bold underline text-left w-fit">I understand, submit anyway.</button></div>}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-2xl shadow-sm">
            <div className="flex items-start">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-500 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-1">Important: Prevent Fake Claims</h3>
                <p className="text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
                  Please keep descriptions <strong>vague</strong>. Do NOT mention specific unique marks, hidden scratches, MAC addresses, or precise contents amounts. True owners must be able to verify these details privately to successfully claim the item from you.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-6">

                <FormGroup id="title" label="General Item Title" error={errors.title} required helperText="Provide a generic name (e.g., 'Black Leather Wallet', not 'Tommy Hilfiger Wallet').">
                  <input type="text" id="title" name="title" className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={formData.title} onChange={handleInputChange} placeholder="E.g., Leather Wallet" />
                </FormGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup id="category" label="Category" error={errors.category} required>
                    <select id="category" name="category" className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={formData.category} onChange={handleInputChange}>
                      <option value="" disabled>Select category</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup id="color" label="Dominant Color" error={errors.color} required>
                    <input type="text" id="color" name="color" className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={formData.color} onChange={handleInputChange} placeholder="E.g., Black" />
                  </FormGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup id="dateFound" label="Date Found" error={errors.dateFound} required>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input type="date" id="dateFound" name="dateFound" max={new Date().toISOString().split('T')[0]} className="w-full pl-10 pr-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={formData.dateFound} onChange={handleInputChange} />
                    </div>
                  </FormGroup>
                  <FormGroup id="locationFound" label="Location Found" error={errors.locationFound} required helperText="Where approximately did you find it?">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input type="text" id="locationFound" name="locationFound" className="w-full pl-10 pr-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={formData.locationFound} onChange={handleInputChange} placeholder="E.g., Central Park bench" />
                    </div>
                  </FormGroup>
                </div>

                <FormGroup id="description" label="Short Public Description" error={errors.description} required helperText="Strictly capped at 150 characters to prevent oversharing. Keep it general.">
                  <div className="relative">
                    <div className="absolute top-3.5 left-3 pointer-events-none">
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea rows={3} id="description" name="description" className="w-full pl-10 pr-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y" value={formData.description} onChange={handleInputChange} placeholder="Found a black wallet near the library entrance. Does not appear to belong to a student." />
                  </div>
                  <div className={`text-right mt-1.5 text-xs font-semibold ${formData.description.length > 150 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formData.description.length}/150 characters
                  </div>
                </FormGroup>

                {/* Image Upload */}
                <FormGroup id="image" label="Upload Image" error={errors.image} helperText="Ensure the photo doesn't accidentally reveal highly sensitive information (like ID numbers). Max 5MB.">
                  {!imagePreview ? (
                    <div
                      className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
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
                    <div className="mt-2 relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 inline-block">
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

            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-5 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button type="button" onClick={() => window.history.back()} disabled={loading} className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mr-4 disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className={`inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-xl shadow-lg text-base font-bold text-white transition-all ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}>
                {loading ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Processing...</> : <><Search className="w-5 h-5 mr-2" /> Submit Found Item</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}