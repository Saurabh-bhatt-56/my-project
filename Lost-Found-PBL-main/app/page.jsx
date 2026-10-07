"use client";

import React, { useState, useEffect } from 'react';
import { Search, Send, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import ItemCard from '@/components/ItemCard';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Axios placeholder for API integration
    const fetchRecentItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch lost and found items concurrently from backend APIs
        const [lostRes, foundRes] = await Promise.all([
          fetch('/api/items/lost'),
          fetch('/api/items/found')
        ]);

        const lostData = await lostRes.json();
        const foundData = await foundRes.json();

        let allItems = [];

        if (lostData.success && lostData.data) {
          allItems = [...allItems, ...lostData.data];
        }
        if (foundData.success && foundData.data) {
          allItems = [...allItems, ...foundData.data];
        }

        // Filter unclaimed active items, sort by date (newest first), and slice top 4
        const sortedItems = allItems
          .filter(item => item.status !== "claimed" && item.status !== "returned")
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 4);

        setItems(sortedItems);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Failed to load recent items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  const steps = [
    {
      icon: <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      title: "1. Report",
      description: "Submit details about the item you lost or found, including pictures and location."
    },
    {
      icon: <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      title: "2. Search & Match",
      description: "Our system helps match lost items with found items in the database automatically."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      title: "3. Reunite",
      description: "Contact the finder/owner securely and arrange to get your belongings back."
    }
  ];

  const filteredItems = items.filter((item) => selectedFilter === 'all' || item.type === selectedFilter);
  const stats = {
    all: items.length,
    lost: items.filter((item) => item.type === 'lost').length,
    found: items.filter((item) => item.type === 'found').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans">
      <Hero />

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              A simple process to help you find what you've lost or return what you've found.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:border-blue-100 dark:hover:border-gray-600">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl mb-6 shadow-inner">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Reported Items Section */}
      <section className="py-20 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Recently Reported Items
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xl">
                Browse through the latest lost and found items in our database.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['all', 'lost', 'found'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedFilter(option)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedFilter === option
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800'
                    }`}
                >
                  {option === 'all' ? 'All Items' : option === 'lost' ? 'Lost' : 'Found'} ({stats[option]})
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading recent items...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-500 mr-3 hidden sm:block" />
                <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-sm bg-white dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-5 py-2.5 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900 transition-colors shadow-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="inline-flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No {selectedFilter === 'all' ? '' : selectedFilter + ' '}items found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Try switching filters or check back later when more items are reported.</p>
            </div>
          )}

          {/* Items Grid */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
              {filteredItems.map((item) => (
                <ItemCard key={item.id || item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-600 dark:bg-blue-900 py-20 relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6 tracking-tight">
            Found something that isn't yours?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Be a hero today. Report a found item and help return it to its rightful owner. Every good deed counts!
          </p>
          <Link href="/report/found-item" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-blue-700 dark:text-blue-900 bg-white hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            <Send className="w-5 h-5 mr-2" />
            Report a Found Item
          </Link>
        </div>
      </section>
    </div>
  );
}
