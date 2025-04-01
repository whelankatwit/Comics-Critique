import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Banner from './components/Banner';
import PopularComics from './components/PopularComics';
import Home from './pages/Home';
import Comics from './pages/Comics';
import Reviews from './pages/Reviews';
import Lists from './pages/Lists';
import Following from './pages/Following';
import SignIn from './pages/SignIn';
import WriteReview from './pages/WriteReview'
import axios from 'axios';
import { UserProvider } from './UserContext';

function App() {
  const [user, setUser] = useState(null);

  // Check if user exists in localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <UserProvider>
    <Router>
      <div>
        <NavBar />
        <div className="bg-primary-subtle">
          <Banner />

          {/* Routes for navigation */}
          <div className="container mt-5">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/comics" element={<Comics />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/lists" element={<Lists />} />
              <Route path="/following" element={<Following />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/writereview/:comicId" element={<WriteReview />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
    </UserProvider>
    
  )
}

export default App;
