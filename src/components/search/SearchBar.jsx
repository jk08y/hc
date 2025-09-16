// src/components/search/SearchBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchBar = ({ 
  placeholder = 'Search HeyChat', 
  initialValue = '',
  onSearch,
  className = ''
}) => {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    if (onSearch) {
      onSearch(query);
    } else {
      // Default behavior: navigate to explore page with query
      navigate(`/explore?q=${encodeURIComponent(query)}`);
    }
  };
  
  const handleClear = () => {
    setQuery('');
  };
  
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-gray-100 dark:bg-dark-light border-none rounded-full py-2 px-9 sm:py-2.5 sm:pl-10 sm:pr-16 focus:ring-2 focus:ring-primary text-sm sm:text-base text-gray-900 dark:text-white"
        aria-label="Search"
      />
      
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
        <FaSearch className="w-4 h-4 sm:w-5 sm:h-5" />
      </span>
      
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-10 sm:right-14 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Clear search"
        >
          <FaTimes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}
      
      <button
        type="submit"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary text-xs sm:text-sm font-medium sm:px-2"
        aria-label="Submit search"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;