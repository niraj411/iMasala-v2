import React from 'react';

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  const allCategories = [
    { id: 'all', name: 'All Items', slug: 'all' },
    ...categories.filter(cat => cat.count > 0)
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {allCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.slug
              ? 'bg-primary-500 text-white'
              : 'bg-masala-100 text-masala-700 hover:bg-masala-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}