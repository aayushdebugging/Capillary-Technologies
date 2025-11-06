import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { MyRecipes } from './pages/MyRecipes';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
