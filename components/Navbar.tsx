import React, { useState } from 'react';
import { FilterType } from '../types';
import { DEFAULT_SPORTS } from '../constants';

interface NavbarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeCategory, onCategoryChange, onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const categories: { id: string; name: string; isSpecial?: boolean }[] = [
    { id: FilterType.LIVE, name: 'Live Now', isSpecial: true },
    { id: FilterType.TODAY, name: 'Today', isSpecial: true },
    { id: FilterType.ALL, name: 'All Events', isSpecial: true },
    ...DEFAULT_SPORTS
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-app-bg/80 backdrop-blur-md border-b border-app-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => onCategoryChange(FilterType.LIVE)}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 hidden sm:block">
              StreamZone
            </span>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-full leading-5 bg-zinc-900/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all duration-200"
                placeholder="Search matches, teams..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
             <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search (Visible when menu open or just always visible on small screens? Let's do distinct row) */}
        <div className="md:hidden pb-4">
             <input
                type="text"
                className="block w-full px-4 py-2 border border-zinc-800 rounded-lg bg-zinc-900/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
        </div>
      </div>

      {/* Categories Scrollbar */}
      <div className="border-t border-zinc-800/50 bg-app-bg/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
               const isActive = activeCategory === cat.id;
               return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`
                    whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-black shadow-lg shadow-white/10' 
                      : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                    }
                    ${cat.isSpecial && !isActive ? 'text-blue-400 border-blue-900/30 bg-blue-900/10 hover:bg-blue-900/20' : ''}
                  `}
                >
                  {cat.name}
                </button>
               );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};