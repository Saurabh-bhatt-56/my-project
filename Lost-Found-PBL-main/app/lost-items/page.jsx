"use client";

import React, { useState, useEffect } from 'react';
import ItemCard from '@/components/ItemCard';
import { Search, SlidersHorizontal, ChevronDown, PackageOpen } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ["All", "Electronics", "Wallets & IDs", "Keys", "Bags & Luggage", "Jewelry & Watches", "Pets", "Other"];

export default function LostItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      const res = await fetch("/api/items/lost");
      const data = await res.json();
      console.log(data)
      setItems(data.data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) || item.location?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-24">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pt-20 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            Lost Items <span className="text-blue-600 dark:text-blue-500">Directory</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Browse through securely reported lost items. If you've found something that matches an item here, please review it and inform the owner.
          </p>

          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-2xl sm:rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-3 transition-all animate-in fade-in zoom-in-95 duration-700 delay-100">
            <div className="relative flex-grow w-full text-gray-400 focus-within:text-blue-500 transition-colors">
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
                className="w-full sm:w-auto appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 py-3 pl-4 pr-10 rounded-xl sm:rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl sm:rounded-full transition-all flex-shrink-0 shadow-sm shadow-blue-500/30 active:scale-95">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            {searchQuery || selectedCategory !== "All" ? 'Search Results' : 'Recently Lost'}
            <span className="ml-3 text-sm font-medium px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
          </h2>
        </div>

        {loading ? (
          /* Skeleton Loading */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse h-[360px]">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full" />
                <div className="p-5 flex flex-col gap-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-auto" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {
              filteredItems.map((item, key) => {
                return (
                  <Link href={`/lost-items/${item.id}`} key={key} className="block group animate-in fade-in zoom-in-95 duration-500">
                    <ItemCard item={{ ...item, type: 'lost' }} />
                  </Link>
                )
              })
            }
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center animate-in fade-in zoom-in-95 border-2">
            <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
              <PackageOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No lost items found</h3>
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
      </div>
    </div>
  );
}