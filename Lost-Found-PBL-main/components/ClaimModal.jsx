"use client";

import React, { useState, useRef } from "react";
import { X, Loader2, AlertCircle, CheckCircle2, ShieldAlert, ImagePlus } from "lucide-react";

export default function ClaimModal({ isOpen, onClose, item, itemType }) {
  const [uniqueDetails, setUniqueDetails] = useState("");
  const [images, setImages] = useState([]); // Array of { url, public_id }
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !item) return null;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError("");

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Max size is 5MB.`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        setError(`File "${file.name}" is not a valid image.`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          setImages((prev) => [...prev, { url: data.url, public_id: data.public_id }]);
        } else {
          setError(data.message || `Failed to upload "${file.name}"`);
        }
      } catch (err) {
        console.error("Image upload error:", err);
        setError(`Something went wrong uploading "${file.name}".`);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = async (indexToRemove) => {
    const imageToDelete = images[indexToRemove];
    if (imageToDelete && imageToDelete.public_id) {
      try {
        await fetch("/api/upload/image", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_id: imageToDelete.public_id }),
        });
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
      }
    }
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const deleteAllUploadedImages = async (imagesToDelete) => {
    if (!imagesToDelete || imagesToDelete.length === 0) return;
    setImages([]);
    for (const img of imagesToDelete) {
      if (img.public_id) {
        try {
          await fetch("/api/upload/image", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ public_id: img.public_id }),
          });
        } catch (err) {
          console.error("Failed to delete image on submission failure:", err);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!uniqueDetails.trim() || uniqueDetails.trim().length < 5) {
      setError("Please describe the unique identity/details in at least 5 characters.");
      return;
    }

    const uploadedImagesSnapshot = [...images];

    try {
      setLoading(true);

      const res = await fetch("/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: item._id || item.id,
          uniqueDetails: uniqueDetails.trim(),
          proofImages: uploadedImagesSnapshot,
          itemType: itemType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to submit claim request.");
        await deleteAllUploadedImages(uploadedImagesSnapshot);
      }
    } catch (err) {
      console.error("Submit claim error:", err);
      setError("An unexpected error occurred. Please try again.");
      await deleteAllUploadedImages(uploadedImagesSnapshot);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (!success) {
      deleteAllUploadedImages(images);
    }
    setUniqueDetails("");
    setImages([]);
    setError("");
    setSuccess(false);
    onClose();
  };

  const isLost = itemType === "lost";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300">

      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={loading ? undefined : handleModalClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">

        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/20">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {success ? (isLost ? "Match Request Sent" : "Claim Submitted") : (isLost ? "I Have This Item" : "Submit Claim Request")}
            </h2>
            {!success && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-md">
                {isLost ? "Reporting found match for: " : "Claiming: "} <span className="font-semibold text-emerald-600 dark:text-emerald-500">{item.title}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleModalClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
          {success ? (
            <div className="text-center py-10 px-4 space-y-6 animate-in fade-in duration-500">
              <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLost ? "Match Details Sent!" : "Verification Pending!"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  {isLost
                    ? "Your contact info, messages, and optional found item images have been sent to the owner. They will review your details to coordinate returning the item."
                    : "Your claim details and optional proof images have been sent to the finder of this item. They will review your answers to verify ownership."
                  }
                </p>
              </div>
              <div className="pt-4 max-w-sm mx-auto">
                <button
                  onClick={handleModalClose}
                  className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  Great, Thank you!
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Instructions */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  {isLost ? (
                    <span><span className="font-bold">Provide specific details of the item you found:</span> Let the owner know where and when you found it, describe its state, and upload photos (optional) of the item to help them recognize it.</span>
                  ) : (
                    <span><span className="font-bold">Provide specific details:</span> Finder has hidden some characteristics to verify the true owner. Please mention unique marks, brand logo locations, scratches, serial numbers, password patterns, screen wallpapers, or specific bag contents.</span>
                  )}
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-2xl flex items-start gap-3 text-sm animate-in shake">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Question: Unique Identity */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
                  {isLost
                    ? "Where, when, and in what condition did you find the item? *"
                    : "What is the unique identity / proof of ownership for this item? *"
                  }
                </label>
                <textarea
                  rows={4}
                  required
                  value={uniqueDetails}
                  onChange={(e) => setUniqueDetails(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400 resize-none custom-scrollbar text-sm leading-relaxed"
                  placeholder={isLost
                    ? "E.g., I found this blue backpack near the library benches yesterday afternoon. It contains a biology notebook and looks slightly worn on the straps."
                    : "E.g., It has a dark green sticker of a coffee mug on the left side, a scratch on the bottom right corner, and contains 3 keys on a red key ring."
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isLost
                    ? "Provide descriptive found details to help the owner confirm it matches their lost item."
                    : "Provide as much specific information as possible to help the finder authenticate you."
                  }
                </p>
              </div>

              {/* Upload Proof Images (Optional) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
                    {isLost ? "Upload Found Item Images" : "Upload Proof / Images"}{" "}
                    <span className="text-xs text-gray-400 font-normal">(Optional, multiple allowed)</span>
                  </label>
                  <span className="text-xs text-gray-400 font-medium">
                    {images.length} uploaded
                  </span>
                </div>

                {/* Upload Button Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 border-gray-300 dark:border-gray-700 transition-colors cursor-pointer text-center ${uploading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    ) : (
                      <ImagePlus className="w-8 h-8 text-gray-400 hover:text-emerald-500 transition-colors" />
                    )}
                    <span className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {uploading ? "Uploading..." : (isLost ? "Click to upload item photos" : "Click to upload proof")}
                    </span>
                    <span className="mt-1 text-[10px] text-gray-400">
                      PNG, JPG, WEBP up to 5MB
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>

                  {/* Upload Info / Guidance */}
                  <div className="flex items-center justify-center p-4 bg-gray-50/30 dark:bg-gray-800/10 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      {isLost ? (
                        <span>💡 <span className="font-semibold">What is good photo proof?</span> Clear pictures of the item from multiple angles showing any characteristic marks, stickers, or brand logo details so the owner can verify it instantly.</span>
                      ) : (
                        <span>💡 <span className="font-semibold">What is good proof?</span> Old photos of yourself with this item, a digital purchase receipt, a serial number certificate, or an ID document showing your name matched with the item owner.</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Uploaded Images Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100">
                        <img
                          src={img.url}
                          alt={`Proof ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 rounded-full text-white transition-all scale-90 group-hover:scale-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Section */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:bg-emerald-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? (isLost ? "Sending Request..." : "Submitting Claim...") : (isLost ? "Send Match Request" : "Submit Claim")}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
