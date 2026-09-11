import './styles.css';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/navBar';
import Home from './pages/home';
import SearchResults from './pages/searchResults';
import NotFound from './pages/notFound';
import MovieDetails from './pages/movieDetails';
import Groups from './pages/groups';
import Favorites from './pages/favorites';
import GroupDetails from './pages/groupDetails';
import Profile from './pages/profile';


function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/groups/:id" element={<GroupDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;