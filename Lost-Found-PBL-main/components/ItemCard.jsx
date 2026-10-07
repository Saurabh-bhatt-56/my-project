import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Image as ImageIcon, ArrowRight } from 'lucide-react';

export default function ItemCard({ item, actionText, onActionClick }) {
  const [imageError, setImageError] = useState(false);
  const itemId = item?.id || item?._id;
  const { title, location, date, images, type } = item || {};
  const linkUrl = itemId ? (type === 'lost' ? `/lost-items/${itemId}` : `/found-items/${itemId}`) : null;

  const handleActionClick = (e) => {
    if (onActionClick) {
      e.preventDefault();
      e.stopPropagation();
      onActionClick(e);
    }
  };

  const cardBody = (
    <>
      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
        {!imageError && images?.[0]?.url ? (
          <img
            src={images[0].url}
            alt={title || 'Item'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}
        {type && (
          <div className="absolute top-3 right-3 shadow-sm rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${type === 'lost' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {type}
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title || 'Unknown Item'}
        </h3>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2 mt-auto">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
          <span className="truncate">{location || 'Unknown Location'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 pt-3 border-t border-gray-50 dark:border-gray-700/50 mt-2 pb-1">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Date'}</span>
        </div>
      </div>
      {linkUrl && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-gray-950/90 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm shadow-black/5">
            View details
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700 overflow-hidden group relative">
      {linkUrl ? (
        <Link href={linkUrl} className="group block flex-1 min-h-0">
          {cardBody}
        </Link>
      ) : (
        <div className="relative flex-1 min-h-0">{cardBody}</div>
      )}
      {actionText && (
        <div className="px-5 pb-5 mt-auto">
          <button
            type="button"
            onClick={handleActionClick}
            className="w-full text-center bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer active:scale-95 focus:outline-none"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}
