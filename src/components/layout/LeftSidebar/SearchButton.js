import React from "react";

const SearchButton = ({ openSearchModal }) => {
  return (
    <div className="mt-4 mb-3">
      <div
        className="flex items-center bg-dex-bg-tertiary rounded p-2 cursor-pointer hover:bg-dex-bg-highlight transition-colors"
        onClick={openSearchModal}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-dex-text-secondary mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-dex-text-secondary">Search</span>
      </div>
    </div>
  );
};

export default SearchButton;
