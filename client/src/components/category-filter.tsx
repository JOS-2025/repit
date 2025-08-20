interface CategoryFilterProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const categories = [
  { key: 'fruits', name: 'Fruits', icon: 'fas fa-apple-alt', color: 'text-red-500', count: 0 },
  { key: 'vegetables', name: 'Vegetables', icon: 'fas fa-carrot', color: 'text-orange-500', count: 0 },
  { key: 'grains', name: 'Grains', icon: 'fas fa-seedling', color: 'text-earth-brown', count: 0 },
  { key: 'dairy', name: 'Dairy', icon: 'fas fa-cheese', color: 'text-yellow-500', count: 0 },
  { key: 'herbs', name: 'Herbs', icon: 'fas fa-leaf', color: 'text-farm-green', count: 0 },
  { key: 'others', name: 'Others', icon: 'fas fa-egg', color: 'text-earth-light', count: 0 },
];

export default function CategoryFilter({ selectedCategory = "", onCategoryChange }: CategoryFilterProps) {
  const handleCategoryClick = (categoryKey: string) => {
    const newCategory = selectedCategory === categoryKey ? "" : categoryKey;
    onCategoryChange?.(newCategory);
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <div
              key={category.key}
              className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer text-center ${
                selectedCategory === category.key 
                  ? 'ring-2 ring-farm-green border-farm-green' 
                  : ''
              }`}
              onClick={() => handleCategoryClick(category.key)}
              data-testid={`category-${category.key}`}
            >
              <i className={`${category.icon} text-3xl ${category.color} mb-4`}></i>
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Available</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
