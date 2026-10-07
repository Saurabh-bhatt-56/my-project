"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { userContext } from "@/provider/userProvider";
import {
  FolderOpen, Calendar, MapPin, Check, X, ShieldAlert, Sparkles,
  User, MessageSquare, Image as ImageIcon, CheckCircle, XCircle,
  ArrowUpRight, Phone, Mail, Loader2, Info, ImagePlus
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const { isAuthenticate, user } = useContext(userContext);

  const [activeTab, setActiveTab] = useState("incoming"); // "incoming" or "outgoing"
  const [myClaims, setMyClaims] = useState([]); // Outgoing claims
  const [receivedClaims, setReceivedClaims] = useState([]); // Incoming claims
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selected claim details for the Modal
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState("");

  // Owner proof submission states
  const [ownerProofText, setOwnerProofText] = useState("");
  const [ownerProofImages, setOwnerProofImages] = useState([]);
  const [ownerProofUploading, setOwnerProofUploading] = useState(false);
  const [proofSubmitLoading, setProofSubmitLoading] = useState(false);
  const [proofError, setProofError] = useState("");
  const ownerFileInputRef = useRef(null);

  // Interactive coordinate meetup chat box states
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSelectClaim = (claim) => {
    setSelectedClaim(claim);
    setOwnerProofText("");
    setOwnerProofImages([]);
    setProofError("");
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/claims/dashboard");
      const data = await res.json();
      if (data.success) {
        setMyClaims(data.mySubmittedClaims || []);
        setReceivedClaims(data.receivedClaims || []);
      } else {
        setError(data.message || "Failed to fetch dashboard data.");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
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
      fetchDashboardData();
    }
  }, [isAuthenticate]);

  const fetchMessages = async (claimId) => {
    if (!claimId || !user) return;
    try {
      const res = await fetch(`/api/messages?claimId=${claimId}`);
      const data = await res.json();
      if (data.success) {
        // Map backend messages to chat bubble format
        const loadedMessages = (data.messages || []).map(m => ({
          id: m._id,
          sender: m.senderId === user._id ? "me" : "other",
          text: m.message,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        setChatMessages([
          {
            id: "sys",
            sender: "system",
            text: "🔒 Secure meetup chat enabled. Arrange a time and place to safely return the item. We recommend public meeting locations.",
            time: new Date(selectedClaim?.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          ...loadedMessages
        ]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Dynamically initialize meet-up coordination chat when a claim is approved
  useEffect(() => {
    let intervalId;
    if (selectedClaim && selectedClaim.status === "approved" && user) {
      // Initial fetch
      fetchMessages(selectedClaim._id);

      // Poll every 3 seconds for active discussion
      intervalId = setInterval(() => {
        fetchMessages(selectedClaim._id);
      }, 3000);
    } else {
      setChatMessages([]);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedClaim, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClaim) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    // Optimistically update frontend UI instantly
    const tempId = Date.now().toString();
    setChatMessages(prev => [
      ...prev,
      {
        id: tempId,
        sender: "me",
        text: messageText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId: selectedClaim._id,
          messageText,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to send message.");
        // Rollback optimistic update on failure
        setChatMessages(prev => prev.filter(m => m.id !== tempId));
      } else {
        // Fetch fresh message state from DB
        fetchMessages(selectedClaim._id);
      }
    } catch (err) {
      console.error("Send message error:", err);
      // Rollback optimistic update on error
      setChatMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleClaimAction = async (claimId, status) => {
    if (!confirm(`Are you sure you want to ${status} this claim request?`)) return;

    try {
      setActionLoadingId(claimId);
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (data.success) {
        const approvedItemId = data.claim?.itemId || (selectedClaim && selectedClaim._id === claimId ? selectedClaim.itemId : null);

        // Update local state instantly
        setReceivedClaims(prev =>
          prev.map(c => {
            if (c._id === claimId) {
              return { ...c, status };
            }
            if (status === "approved" && approvedItemId && c.itemId === approvedItemId && c.status === "pending") {
              return { ...c, status: "rejected" };
            }
            return c;
          })
        );

        setMyClaims(prev =>
          prev.map(c => {
            if (c._id === claimId) {
              return { ...c, status };
            }
            if (status === "approved" && approvedItemId && c.itemId === approvedItemId && c.status === "pending") {
              return { ...c, status: "rejected" };
            }
            return c;
          })
        );

        // If modal is open for this claim, update it too
        if (selectedClaim && selectedClaim._id === claimId) {
          setSelectedClaim(prev => ({ ...prev, status }));
        }

        // Fetch fresh synchronised claims from database
        fetchDashboardData();
      } else {
        alert(data.message || `Failed to ${status} claim.`);
      }
    } catch (err) {
      console.error(`Claim action error (${status}):`, err);
      alert("Something went wrong. Please try again.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleOwnerImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setOwnerProofUploading(true);
    setProofError("");

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setProofError(`File "${file.name}" is too large. Max size is 5MB.`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        setProofError(`File "${file.name}" is not a valid image.`);
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
          setOwnerProofImages((prev) => [...prev, { url: data.url, public_id: data.public_id }]);
        } else {
          setProofError(data.message || `Failed to upload "${file.name}"`);
        }
      } catch (err) {
        console.error("Owner Image upload error:", err);
        setProofError(`Something went wrong uploading "${file.name}".`);
      }
    }
    setOwnerProofUploading(false);
    if (ownerFileInputRef.current) ownerFileInputRef.current.value = "";
  };

  const removeOwnerImage = async (indexToRemove) => {
    const imageToDelete = ownerProofImages[indexToRemove];
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
        console.error("Failed to delete image:", err);
      }
    }
    setOwnerProofImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleOwnerProofSubmit = async (e) => {
    e.preventDefault();
    if (selectedClaim?.ownerProof) {
      setProofError("You have already submitted ownership verification details for this match notice.");
      return;
    }
    if (!ownerProofText.trim() || ownerProofText.trim().length < 5) {
      setProofError("Please describe the unique identity/details in at least 5 characters.");
      return;
    }

    try {
      setProofSubmitLoading(true);
      setProofError("");

      const res = await fetch(`/api/claims/${selectedClaim._id}/proof`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerProof: ownerProofText.trim(),
          ownerImages: ownerProofImages,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local selected claim instantly
        setSelectedClaim(prev => ({
          ...prev,
          ownerProof: ownerProofText.trim(),
          ownerImages: ownerProofImages,
        }));
        
        // Update receivedClaims list so dashboard list view updates instantly too
        setReceivedClaims(prev =>
          prev.map(c => c._id === selectedClaim._id 
            ? { ...c, ownerProof: ownerProofText.trim(), ownerImages: ownerProofImages }
            : c
          )
        );
      } else {
        setProofError(data.message || "Failed to submit ownership proof.");
      }
    } catch (err) {
      console.error("Owner proof submit error:", err);
      setProofError("An unexpected error occurred. Please try again.");
    } finally {
      setProofSubmitLoading(false);
    }
  };

  if (loading && !selectedClaim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isLostType = selectedClaim?.itemType === "lost";
  const isOwnerUser = selectedClaim
    ? (isLostType
        ? (selectedClaim.receiverId?._id === user?._id || selectedClaim.receiverId === user?._id || selectedClaim.receiver === user?._id)
        : (selectedClaim.senderId?._id === user?._id || selectedClaim.senderId === user?._id || selectedClaim.sender === user?._id))
    : false;
  const isFinderUser = selectedClaim ? !isOwnerUser : false;
  const canDecide = selectedClaim
    ? (selectedClaim.status === "pending" && 
        (isLostType 
          ? (isFinderUser && !!selectedClaim.ownerProof) 
          : (isFinderUser && activeTab === "incoming")
        ))
    : false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-24 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Hello, <span className="text-blue-600 dark:text-blue-500">{user?.name || "User"}</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your lost & found claim operations, respond to requests, and view the status of your claims.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
              <span className="block text-xl font-bold text-blue-600 dark:text-blue-400">{receivedClaims.length}</span>
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Requests received</span>
            </div>
            <div className="text-center px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
              <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">{myClaims.length}</span>
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Claims submitted</span>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="space-y-6">
          <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6">
            <button
              onClick={() => setActiveTab("incoming")}
              className={`pb-4 text-base font-bold transition-all relative ${activeTab === "incoming"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
            >
              Claims Received
              {receivedClaims.filter(c => c.status === "pending").length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {receivedClaims.filter(c => c.status === "pending").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("outgoing")}
              className={`pb-4 text-base font-bold transition-all relative ${activeTab === "outgoing"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
            >
              My Claims Submitted
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-2xl flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Incoming Claims (Claims received on my items) */}
          {activeTab === "incoming" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {receivedClaims.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center">
                  <FolderOpen className="w-12 h-12 mx-auto text-gray-400 opacity-50 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No claims received yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    When other users submit claim verification requests for items you reported, they will appear here.
                  </p>
                </div>
              ) : (
                receivedClaims.map((claim) => (
                  <div
                    key={claim._id}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    {/* Upper content */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                            {claim.itemType === "lost" ? "Match Notice Received" : "Claim Request Received"}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[250px]">
                            {claim.item?.title || "Deleted Item"}
                          </h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${claim.status === "pending"
                              ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                              : claim.status === "approved"
                                ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                            }`}
                        >
                          {claim.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm uppercase flex items-center justify-center flex-shrink-0">
                          {claim.sender?.name?.[0] || "U"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            {claim.itemType === "lost" ? "Founder" : "Claimant"}
                          </p>
                          <p className="text-sm text-gray-800 dark:text-gray-200 font-bold truncate">
                            {claim.sender?.name || "Anonymous User"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                          {claim.itemType === "lost" ? "Founder's notice message" : "Ownership proof description"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {claim.message}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={() => handleSelectClaim(claim)}
                        className={`flex-grow py-2.5 px-4 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center ${claim.status === "approved"
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {claim.status === "approved" 
                          ? "Chat & Details" 
                          : (claim.itemType === "lost" 
                              ? (!claim.ownerProof ? "Provide Proof & Claim" : "Submitted Proof Details") 
                              : "Review Claim")}
                      </button>

                      {claim.status === "pending" && claim.itemType === "found" && (
                        <>
                          <button
                            disabled={actionLoadingId === claim._id}
                            onClick={() => handleClaimAction(claim._id, "rejected")}
                            className="p-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            title="Reject Claim"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            disabled={actionLoadingId === claim._id}
                            onClick={() => handleClaimAction(claim._id, "approved")}
                            className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            title="Approve Claim"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Outgoing Claims (Claims I submitted) */}
          {activeTab === "outgoing" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myClaims.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center">
                  <FolderOpen className="w-12 h-12 mx-auto text-gray-400 opacity-50 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No claims submitted</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    When you locate a found item and submit claim proof to connect with the finder, they will show up here.
                  </p>
                </div>
              ) : (
                myClaims.map((claim) => (
                  <div
                    key={claim._id}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                            {claim.itemType === "lost" ? "Submitted Match Notice" : "Submitted Claim"}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[250px]">
                            {claim.item?.title || "Deleted Item"}
                          </h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${claim.status === "pending"
                              ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                              : claim.status === "approved"
                                ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                            }`}
                        >
                          {claim.status}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{claim.item?.location || "Unknown location"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{claim.item?.date ? new Date(claim.item.date).toLocaleDateString() : "Unknown date"}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                          {claim.itemType === "lost" ? "Your notice message" : "Your verification details"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {claim.message}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                      <button
                        onClick={() => handleSelectClaim(claim)}
                        className={`flex-grow py-2.5 px-4 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center ${claim.status === "approved"
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {claim.status === "approved" 
                          ? "Chat & View Details" 
                          : (claim.itemType === "lost" 
                              ? (claim.ownerProof ? "Review Owner Proof & Decide" : "Waiting for Owner Proof") 
                              : "View Submission Details")}
                      </button>

                      {claim.status === "pending" && claim.itemType === "lost" && claim.ownerProof && (
                        <>
                          <button
                            disabled={actionLoadingId === claim._id}
                            onClick={() => handleClaimAction(claim._id, "rejected")}
                            className="p-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            title="Reject Owner Proof"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            disabled={actionLoadingId === claim._id}
                            onClick={() => handleClaimAction(claim._id, "approved")}
                            className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            title="Approve & Coordinate"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedClaim(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Claim verification details
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-sm sm:max-w-md">
                  Item: <span className="font-semibold text-blue-600 dark:text-blue-500">{selectedClaim.item?.title || "Deleted Item"}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">

              {/* Status Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-3">
                  {selectedClaim.status === "pending" ? (
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-xl">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : selectedClaim.status === "approved" ? (
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-xl">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-xl">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Claim Status</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white capitalize">
                      {selectedClaim.status}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Requested {new Date(selectedClaim.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Claimant / Owner Contact Details */}
              {activeTab === "incoming" ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Claimant Profile & Contact Info</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg uppercase flex-shrink-0">
                        {selectedClaim.sender?.name?.[0] || "U"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Full Name</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{selectedClaim.sender?.name || "N/A"}</p>
                      </div>
                    </div>

                    <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-center">
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{selectedClaim.sender?.email || "No email"}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedClaim.sender?.phoneNumber || "No phone number"}</span>
                      </div>
                    </div>
                  </div>

                  {selectedClaim.status === "approved" && (
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-900/10 text-xs text-blue-800 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20 rounded-xl flex items-start gap-2.5">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>🎉 <span className="font-semibold">Match Confirmed!</span> Please coordinate with the claimant using the contact details above to return the item securely.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 font-semibold">Finder Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg uppercase flex-shrink-0">
                        {selectedClaim.receiver?.name?.[0] || "U"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Reported By</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{selectedClaim.receiver?.name || "Anonymous Finder"}</p>
                      </div>
                    </div>

                    {selectedClaim.status === "approved" ? (
                      <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-center">
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{selectedClaim.receiver?.email || "No email"}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{selectedClaim.receiver?.phoneNumber || "No phone number"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-gray-400 sm:border-l border-gray-100 dark:border-gray-800 sm:pl-4 leading-relaxed">
                        🔒 Contact information is protected and will be unlocked as soon as the finder approves your claim.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ownership verification answers */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {isLostType ? "Finder's Notice Message" : "Unique characteristics / Proof answers"}
                </h4>
                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-2xl">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {selectedClaim.message}
                  </p>
                </div>
              </div>

              {/* Proof Images grid */}
              {selectedClaim.images && selectedClaim.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Uploaded proof images
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedClaim.images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 flex-shrink-0 cursor-pointer block"
                        title="Click to view full size"
                      >
                        <img
                          src={img.url}
                          alt={`Proof image ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                          <ArrowUpRight className="w-4 h-4" />
                          View Full Size
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Symmetrical Lost Match: Render Owner's Proof section or form */}
              {isLostType && (
                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                  {selectedClaim.ownerProof ? (
                    <>
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          Owner's Ownership Verification Proof
                        </h4>
                        <div className="p-4 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200/20 dark:border-amber-900/20 rounded-2xl">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-medium">
                            {selectedClaim.ownerProof}
                          </p>
                        </div>
                      </div>

                      {selectedClaim.ownerImages && selectedClaim.ownerImages.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            Owner's Uploaded Proof Images
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {selectedClaim.ownerImages.map((img, idx) => (
                              <a
                                key={idx}
                                href={img.url}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 cursor-pointer block"
                                title="Click to view full size"
                              >
                                <img
                                  src={img.url}
                                  alt={`Owner proof image ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                                  <ArrowUpRight className="w-4 h-4" />
                                  View Full Size
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Owner proof NOT submitted yet
                    isOwnerUser ? (
                      // Currently logged-in user is the Owner -> Show form!
                      <form onSubmit={handleOwnerProofSubmit} className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 rounded-2xl">
                          <h5 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Provide Ownership Details
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            A finder has notified you about this item! To claim it, please provide secret unique characteristics or identifying marks (e.g. keychains, scratches, internal contents) and upload proof pictures to verify ownership.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Secret verification details *
                          </label>
                          <textarea
                            value={ownerProofText}
                            onChange={(e) => setOwnerProofText(e.target.value)}
                            placeholder="Describe unique characteristics only you would know (minimum 5 characters)..."
                            rows={3}
                            className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                            Proof Images (Optional)
                          </label>
                          
                          <div className="flex flex-wrap gap-3 items-center">
                            {ownerProofImages.map((img, idx) => (
                              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 flex-shrink-0">
                                <img src={img.url} className="w-full h-full object-cover" alt="Proof thumbnail" />
                                <button
                                  type="button"
                                  onClick={() => removeOwnerImage(idx)}
                                  className="absolute top-0.5 right-0.5 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            {ownerProofImages.length < 3 && (
                              <button
                                type="button"
                                disabled={ownerProofUploading}
                                onClick={() => ownerFileInputRef.current?.click()}
                                className="w-16 h-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-850 hover:border-blue-500 hover:bg-blue-50/10 dark:hover:bg-blue-900/5 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 gap-1"
                              >
                                {ownerProofUploading ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                ) : (
                                  <>
                                    <ImagePlus className="w-4 h-4" />
                                    <span className="text-[8px] font-bold">Add</span>
                                  </>
                                )}
                              </button>
                            )}

                            <input
                              type="file"
                              ref={ownerFileInputRef}
                              onChange={handleOwnerImageUpload}
                              accept="image/*"
                              multiple
                              className="hidden"
                            />
                          </div>
                        </div>

                        {proofError && (
                          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <p>{proofError}</p>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={proofSubmitLoading || ownerProofUploading}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/10"
                        >
                          {proofSubmitLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Submitting Proof...
                            </>
                          ) : (
                            "Submit Proof & Request Claim Approval"
                          )}
                        </button>
                      </form>
                    ) : (
                      // Current user is Finder -> Owner hasn't provided proof yet
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 rounded-2xl text-xs flex items-center gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                        <span>Waiting for the owner to submit unique details/proof images for verification.</span>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Secure Chat Box for Approved claims */}
              {selectedClaim.status === "approved" && (
                <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <MessageSquare className="w-5 h-5" />
                    <h4 className="text-sm font-bold">
                      Secure Meet-up Coordination Chat
                    </h4>
                  </div>

                  <div className="border border-gray-100 dark:border-gray-850 rounded-2xl overflow-hidden flex flex-col bg-gray-50/20 dark:bg-gray-900/50">
                    {/* Chat Messages Area */}
                    <div className="p-4 h-[250px] overflow-y-auto space-y-3 custom-scrollbar flex flex-col">
                      {chatMessages.map((msg) => {
                        if (msg.sender === "system") {
                          return (
                            <div key={msg.id} className="text-center p-2.5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/30 dark:border-blue-900/20 rounded-xl text-[11px] text-blue-800 dark:text-blue-400">
                              {msg.text}
                            </div>
                          );
                        }

                        const isMe = msg.sender === "me";

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"
                              }`}
                          >
                            <div className="text-[10px] text-gray-400 font-semibold mb-1">
                              {isMe ? "You" : (selectedClaim.sender?._id === user?._id || selectedClaim.senderId === user?._id ? (selectedClaim.receiver?.name || "Finder") : (selectedClaim.sender?.name || "Claimant"))}
                            </div>
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${isMe
                                  ? "bg-blue-600 text-white rounded-tr-none"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200/30 dark:border-gray-700/20"
                                }`}
                            >
                              {msg.text}
                            </div>
                            <div className="text-[9px] text-gray-400 mt-1">
                              {msg.time}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2 bg-gray-50/50 dark:bg-gray-950/20">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message to coordinate meetup..."
                        className="flex-grow p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-955 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>

            {/* Decisional Action Buttons */}
            {canDecide && (
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/10">
                <button
                  type="button"
                  disabled={actionLoadingId === selectedClaim._id}
                  onClick={() => handleClaimAction(selectedClaim._id, "rejected")}
                  className="px-6 py-3 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Reject Request
                </button>
                <button
                  type="button"
                  disabled={actionLoadingId === selectedClaim._id}
                  onClick={() => handleClaimAction(selectedClaim._id, "approved")}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {isLostType ? "Approve Owner Proof & Meet" : "Approve Claim"}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
