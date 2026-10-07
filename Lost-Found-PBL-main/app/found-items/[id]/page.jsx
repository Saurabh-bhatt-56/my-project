"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, CheckCircle2, PackageOpen, Info } from 'lucide-react';
import ClaimModal from '@/components/ClaimModal';

function EachFoundItemPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const res = await fetch(`/api/items/found/${params.id}`);
      const data = await res.json();
      setItem(data.data);
      setLoading(false);
    };
    if (params?.id) {
      fetchItem();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-800">
          <PackageOpen className="w-16 h-16 mx-auto text-gray-400 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Item Not Found</h2>
          <p className="text-gray-500 mb-8">The found item you are looking for doesn't exist or has been removed.</p>
          <button onClick={() => router.back()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-colors w-full">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-24 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="group flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors mb-8 focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Found Items
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-1/2 lg:w-5/12 bg-gray-100 dark:bg-gray-800 relative min-h-[300px] md:min-h-full flex-shrink-0">
              {item.images.length > 0 ? (
                <img
                  src={item.images[0].url}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <PackageOpen className="w-16 h-16 mb-4 opacity-50" />
                  <span className="font-medium">No Image Provided</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-sm">
                  Found Item
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="md:w-1/2 lg:w-7/12 p-8 md:p-10 lg:p-12 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                  {item.category}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                {item.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date Found</p>
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {new Date(item.dateFound).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Location Found</p>
                    <p className="font-medium text-gray-900 dark:text-gray-200">{item.locationFound}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Dominant Color</p>
                    <div className="flex items-center gap-2">
                      {item.color && (
                        <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: item.color.toLowerCase().replace(" ", "") }}></span>
                      )}
                      <p className="font-medium text-gray-900 dark:text-gray-200">{item.color || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <p className="font-medium text-gray-900 dark:text-gray-200">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</p>
                  </div>
                </div>

              </div>

              <div className="mb-10 flex-grow">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                    Is this your item?
                  </p>
                  <button
                    onClick={() => setIsClaimModalOpen(true)}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-lg shadow-emerald-500/30 active:scale-95 text-center flex justify-center items-center group cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Claim / Connect
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Claim Modal */}
        <ClaimModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          item={item}
          itemType="found"
        />
      </div>
    </div>
  );
}

export default EachFoundItemPage;