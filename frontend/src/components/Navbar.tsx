import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-blue-600 border-b-2 border-blue-600'
      : 'text-gray-600 hover:text-blue-600';
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">AI Recipe Generator</h1>
          </div>
          <div className="flex items-center space-x-8">
            <Link to="/" className={`px-3 py-2 text-sm font-medium ${isActive('/')}`}>
              Generate Recipe
            </Link>
            <Link
              to="/my-recipes"
              className={`px-3 py-2 text-sm font-medium ${isActive('/my-recipes')}`}
            >
              My Recipes
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
