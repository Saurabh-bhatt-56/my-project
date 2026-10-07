import React from 'react';
import Link from 'next/link';
import { Search, PlusCircle } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-white dark:bg-black overflow-hidden border-b border-gray-100 dark:border-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white dark:bg-black sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 lg:pt-28">
          <main className="mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Lost Something ?</span>{' '}
                <span className="block text-blue-600 dark:text-blue-500">Find It Here.</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                A simple and secure community platform to report lost belongings and help others reunite with theirs. Because everyone deserves an honest return.
              </p>
              <div className="mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                <div className="rounded-md shadow">
                  <Link href="/report/lost-item" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-blue-500/30 shadow-lg hover:shadow-blue-500/50">
                    <Search className="w-5 h-5 mr-2" />
                    Report Lost Item
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0">
                  <Link href="/report/found-item" className="w-full flex items-center justify-center px-8 py-3 border border-gray-200 dark:border-gray-800 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 md:py-4 md:text-lg md:px-10 transition-colors">
                    <PlusCircle className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
                    Report Found Item
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center p-12">
        <div className="relative w-full max-w-lg aspect-square">
          {/* Abstract SVG Illustration */}
          <svg className="w-full h-full text-blue-100 dark:text-gray-800" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,87.6,-1.4C85.2,13.5,77.8,27,68.9,38.6C60,50.1,49.6,59.8,37.3,66.1C25,72.4,10.7,75.3,-3.8,79.1C-18.4,83,-36.8,87.8,-51.1,81.4C-65.5,75,-75.7,57.3,-81.8,40.1C-87.9,22.8,-89.9,6,-84.9,-8.6C-79.9,-23.2,-67.9,-35.5,-55.1,-46.3C-42.3,-57.1,-28.7,-66.4,-14.1,-71.8C0.5,-77.2,15.2,-78.7,30.6,-83.6C44.7,-76.4,44.7,-76.4,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl shadow-blue-900/5 dark:shadow-none border border-gray-100 dark:border-gray-800 mb-6 transform -rotate-3 transition-transform hover:rotate-0 duration-300">
              <span className="text-5xl block">🔑</span>
              <p className="mt-3 font-medium text-gray-800 dark:text-gray-200">Lost Keys?</p>
            </div>
            <div className="bg-blue-600 p-6 rounded-2xl shadow-xl shadow-blue-600/20 text-white transform rotate-3 transition-transform hover:rotate-0 duration-300 ml-12">
              <span className="text-5xl block">📱</span>
              <p className="mt-3 font-medium text-blue-50">Found Phone!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
