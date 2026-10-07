"use client";

import React, { useState, useEffect } from 'react';
import ItemCard from '@/components/ItemCard';
import ClaimModal from '@/components/ClaimModal';
import { Search, ChevronDown, PackageOpen, Plus, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ["All", "Electronics", "Wallets & IDs", "Keys", "Accessories", "Jewelry & Watches", "Other"];

export default function FoundItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeClaimItem, setActiveClaimItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const res = await fetch('/api/items/found');
      const data = await res.json();
      setItems(data.data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-24">
      {/* Header Section */}
      <div className="bg-emerald-50 dark:bg-gray-900 border-b border-emerald-100 dark:border-gray-800 pt-20 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            Found Items <span className="text-emerald-600 dark:text-emerald-500">Directory</span>
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Browse items that have been safely recovered. To protect true owners, highly specific details are intentionally omitted from public view.
          </p>

          <div className="flex justify-center mb-10 animate-in fade-in zoom-in-95 duration-700 delay-150">
            <Link href="/report-item" className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-md shadow-emerald-500/30 active:scale-95">
              <Plus className="w-5 h-5 mr-2" />
              Report Found Item
            </Link>
          </div>

          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-2xl sm:rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-3 transition-all animate-in fade-in zoom-in-95 duration-700 delay-100">
            <div className="relative flex-grow w-full text-gray-400 focus-within:text-emerald-500 transition-colors">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by item name or location..."
                className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

            <div className="relative w-full sm:w-auto flex-shrink-0">
              <select
                className="w-full sm:w-auto appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 py-3 pl-4 pr-10 rounded-xl sm:rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl sm:rounded-full transition-all flex-shrink-0 shadow-sm shadow-emerald-500/30 active:scale-95">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            {searchQuery || selectedCategory !== "All" ? 'Search Results' : 'Recently Found'}
            <span className="ml-3 text-sm font-medium px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
          </h2>
        </div>

        {loading ? (
          /* Skeleton Loading Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse h-[400px]">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full" />
                <div className="p-5 flex flex-col gap-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-auto" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-11 mt-2 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {filteredItems.map((item, key) => (
              <Link href={`/found-items/${item.id}`} key={key} className="block group animate-in fade-in zoom-in-95 duration-500 h-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-xl">
                <ItemCard
                  item={{ ...item, type: 'found' }}
                  actionText="Claim / Connect"
                  onActionClick={() => setActiveClaimItem(item)}
                />
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center animate-in fade-in zoom-in-95 border-2">
            <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
              <PackageOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No found items match</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
              We couldn't find any items matching your current filters. Try adjusting your search or browsing all categories.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors inline-flex items-center"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Clear Filters
            </button>
          </div>
        )}

        {/* Claim Modal */}
        <ClaimModal
          isOpen={!!activeClaimItem}
          onClose={() => setActiveClaimItem(null)}
          item={activeClaimItem}
          itemType="found"
        />
      </div>
    </div>
  );
}