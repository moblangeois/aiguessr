import { categories } from '../data/questions';

export function Legend({ selectedCategories = [], onToggleCategory = null }) {
  const categoryList = Object.entries(categories);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
        Categories
      </h3>
      <div className="space-y-1">
        {categoryList.map(([key, cat]) => {
          const isSelected = selectedCategories.includes(key);
          const isInteractive = onToggleCategory !== null;

          return (
            <button
              key={key}
              onClick={() => isInteractive && onToggleCategory(key)}
              disabled={!isInteractive}
              className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded transition-colors ${
                isInteractive
                  ? 'hover:bg-gray-700 cursor-pointer'
                  : 'cursor-default'
              } ${isSelected ? 'opacity-100' : 'opacity-50'}`}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm text-gray-300">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Legend;
