import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-fashion-cream/80 backdrop-blur-md border-b border-fashion-charcoal/10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-fashion-black text-white flex items-center justify-center font-serif italic text-xl">
            S
          </div>
          <h1 className="text-2xl font-serif font-bold text-fashion-black tracking-tight">
            StyleLens
          </h1>
        </div>
        <nav>
          <ul className="flex gap-6 text-sm font-medium text-fashion-charcoal">
            <li className="hover:text-fashion-black cursor-pointer transition-colors">How it Works</li>
            <li className="hover:text-fashion-black cursor-pointer transition-colors">About</li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;