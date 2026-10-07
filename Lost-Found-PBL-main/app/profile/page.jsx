"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { userContext } from "@/provider/userProvider";
import {
  User, Mail, Phone, Calendar, ShieldCheck, AlertCircle, Loader2,
  Image as ImageIcon, KeyRound, CheckCircle2, ChevronRight, MapPin, Sparkles,
  Upload, Settings, Award, Eye
} from "lucide-react";
import Link from "next/link";

const INPUT_CLASSES = "w-full p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans outline-none";

export default function UserProfilePage() {
  const router = useRouter();
  const { isAuthenticate, user: contextUser, checkAuth } = useContext(userContext);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "edit" | "password"

  // Edit fields
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarPublicId, setAvatarPublicId] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form feedback
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/user/profile");
      const data = await res.json();

      if (data.success) {
        setProfileData(data.user);
        setName(data.user.name || "");
        setPhoneNumber(data.user.phoneNumber || "");
        setAvatar(data.user.avatar || "");
        setAvatarPublicId(data.user.avatarPublicId || "");
      } else {
        setError(data.message || "Failed to load profile details.");
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticate === false) {
      router.push("/auth/login");
      return;
    }
    if (isAuthenticate === true) {
      fetchProfile();
    }
  }, [isAuthenticate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setActionError("Image must be less than 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setActionError("Please select a valid image file.");
      return;
    }

    try {
      setUploadingImage(true);
      setActionError("");
      setActionSuccess("");

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setAvatar(data.url);
        setAvatarPublicId(data.public_id);
        setActionSuccess("Avatar uploaded! Press 'Save Changes' to apply.");
        setActiveTab("edit");
      } else {
        setActionError(data.message || "Avatar upload failed.");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      setActionError("Failed to upload avatar image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setActionError("Name is required.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setActionSuccess("");

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          avatar,
          avatarPublicId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setActionSuccess("Profile updated successfully!");
        fetchProfile();
        if (checkAuth) checkAuth(); // Sync context user state
      } else {
        setActionError(data.message || "Failed to update profile details.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setActionError("Failed to update profile details. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setActionError("Current password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setActionError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setActionError("Passwords do not match.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setActionSuccess("");

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setActionSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setActionError(data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Password update error:", err);
      setActionError("Failed to update password. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-24 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading profile dashboard...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-24 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-800">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6 animate-bounce" />
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Unable to Load Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error || "Failed to retrieve your account details."}</p>
          <button
            onClick={fetchProfile}
            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-500/30 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const joinDate = profileData.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Not available";

  const getStatusColor = (status) => {
    switch (status) {
      case "claimed":
      case "returned":
        return "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30";
      case "matched":
        return "text-purple-700 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/30";
      default:
        return "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans pb-32">
      <div className="max-w-6xl mx-auto">

        {/* Banner Profile Summary */}
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl p-6 sm:p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-blue-500/20 border-2 border-white dark:border-gray-800">
                {avatar && avatar.length > 1 ? (
                  <img src={avatar} alt={profileData.name} className="w-full h-full object-cover" />
                ) : (
                  avatar || (profileData.name ? profileData.name.trim().charAt(0).toUpperCase() : "U")
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 transition-all cursor-pointer group-hover:scale-105 active:scale-95"
                title="Change Avatar"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2.5 mb-2">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{profileData.name}</h1>
                <span className="inline-flex self-center items-center px-3.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 uppercase tracking-wide">
                  <Award className="w-3.5 h-3.5 mr-1" /> {profileData.role || "User"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-4 text-gray-500 dark:text-gray-400 text-sm">
                <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5 text-blue-500" /> {profileData.email}</span>
                {profileData.phoneNumber && (
                  <span className="flex items-center"><Phone className="w-4 h-4 mr-1.5 text-blue-500" /> {profileData.phoneNumber}</span>
                )}
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5 text-blue-500" /> Joined {joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-3">
            <button
              onClick={() => { setActiveTab("overview"); setActionError(""); setActionSuccess(""); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all text-left cursor-pointer ${activeTab === "overview"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-gray-100 dark:border-gray-800/40"
                }`}
            >
              <span className="flex items-center"><User className="w-5 h-5 mr-3" /> Dashboard Overview</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => { setActiveTab("edit"); setActionError(""); setActionSuccess(""); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all text-left cursor-pointer ${activeTab === "edit"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-gray-100 dark:border-gray-800/40"
                }`}
            >
              <span className="flex items-center"><Settings className="w-5 h-5 mr-3" /> Edit Profile Details</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => { setActiveTab("password"); setActionError(""); setActionSuccess(""); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all text-left cursor-pointer ${activeTab === "password"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-gray-100 dark:border-gray-800/40"
                }`}
            >
              <span className="flex items-center"><KeyRound className="w-5 h-5 mr-3" /> Security Settings</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </div>

          {/* Main Tab Content */}
          <div className="lg:col-span-3">
            {/* Success and Error Alerts */}
            {actionSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-2xl flex items-center font-semibold text-sm animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-600 flex-shrink-0" />
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-400 rounded-2xl flex items-center font-semibold text-sm animate-in fade-in">
                <AlertCircle className="w-5 h-5 mr-3 text-red-600 flex-shrink-0" />
                {actionError}
              </div>
            )}
            {uploadingImage && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-400 rounded-2xl flex items-center font-semibold text-sm animate-in fade-in">
                <Loader2 className="w-5 h-5 mr-3 text-blue-600 animate-spin flex-shrink-0" />
                Uploading profile image...
              </div>
            )}

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stats Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex items-center shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 flex items-center justify-center mr-4 font-black">
                      L
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Lost Reported</p>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{profileData.stats?.lostItemsCount || 0}</h3>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex items-center shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-500 flex items-center justify-center mr-4 font-black">
                      F
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Found Reported</p>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{profileData.stats?.foundItemsCount || 0}</h3>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex items-center shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-500 flex items-center justify-center mr-4 font-black">
                      ✓
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Resolved</p>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{profileData.stats?.resolvedItemsCount || 0}</h3>
                    </div>
                  </div>

                </div>

                {/* Recent Activities */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center">
                    <Sparkles className="w-5 h-5 text-yellow-500 mr-2" /> Recent Reported Activity
                  </h3>

                  {(!profileData.recentReports || profileData.recentReports.length === 0) ? (
                    <div className="text-center py-16">
                      <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No items reported yet</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                        Reported items will show up here. Make your first report now!
                      </p>
                      <div className="mt-6 flex justify-center gap-4">
                        <Link href="/report/lost-item" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-red-500/20">Report Lost</Link>
                        <Link href="/report/found-item" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-blue-500/20">Report Found</Link>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {profileData.recentReports.map((item) => (
                        <div key={item.id} className="py-4 flex items-center justify-between gap-4 group">
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Card Image */}
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0 border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                              {item.images && item.images[0] ? (
                                <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 dark:text-white truncate text-base group-hover:text-blue-600 transition-colors">{item.title}</h4>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {item.location}</span>
                                <span>•</span>
                                <span>{new Date(item.date).toLocaleDateString()}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.type === "lost"
                                  ? "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/20"
                                  : "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20"
                                  }`}>
                                  {item.type}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-xl text-xs font-bold capitalize ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                            <Link
                              href={`/${item.type}-items/${item.id}`}
                              className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-all rounded-xl"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAB: EDIT PROFILE */}
            {activeTab === "edit" && (
              <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
                  <User className="w-5 h-5 text-blue-500 mr-2" /> Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={INPUT_CLASSES}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Contact Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={INPUT_CLASSES}
                      placeholder="e.g. +1234567890"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-500">Email Address (Cannot be modified)</label>
                    <input
                      type="email"
                      value={profileData.email}
                      className={`${INPUT_CLASSES} opacity-60 bg-gray-50 cursor-not-allowed`}
                      disabled
                    />
                  </div>

                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-bold transition-all cursor-pointer shadow-lg shadow-blue-500/25 flex items-center active:scale-95"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* TAB: PASSWORD SECURITY */}
            {activeTab === "password" && (
              <form onSubmit={handleUpdatePassword} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
                  <ShieldCheck className="w-5 h-5 text-blue-500 mr-2" /> Security & Passwords
                </h3>

                <div className="space-y-5">

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center"><KeyRound className="w-4 h-4 mr-1 text-gray-400" /> Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={INPUT_CLASSES}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={INPUT_CLASSES}
                        placeholder="Min 6 characters"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={INPUT_CLASSES}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-bold transition-all cursor-pointer shadow-lg shadow-blue-500/25 flex items-center active:scale-95"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Password
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
