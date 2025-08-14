import React from 'react';

const ProductSkeleton = ({ isDarkMode }) => {
  return (
    <div className={`p-4 rounded-xl border animate-pulse ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}></div>
        <div className="flex-1">
          <div className={`h-4 w-3/4 rounded ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
          <div className="flex items-center justify-between mt-2">
            <div className={`h-3 w-1/4 rounded ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            <div className={`h-3 w-1/4 rounded ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;