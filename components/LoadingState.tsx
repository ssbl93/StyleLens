import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-fashion-beige rounded-full"></div>
        <div className="absolute inset-0 border-4 border-fashion-black border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
          ✨
        </div>
      </div>
      <h3 className="font-serif text-2xl text-fashion-black mb-2">Consulting the Stylist AI...</h3>
      <div className="flex flex-col gap-2 text-center text-sm text-gray-500">
        <p className="animate-pulse delay-75">Analyzing color palette...</p>
        <p className="animate-pulse delay-150">Checking current trends...</p>
        <p className="animate-pulse delay-300">Finding shopping links...</p>
      </div>
    </div>
  );
};

export default LoadingState;