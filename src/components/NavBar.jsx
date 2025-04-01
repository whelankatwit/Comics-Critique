import React, { useContext, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';

function NavBar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    setUser(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/comics?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-danger text-white">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          CC
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav nav-underline me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/comics">
                Comics
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reviews">
                Reviews
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/lists">
                Lists
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/following">
                Following
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-4">
            <form className="d-flex me-3" role="search" onSubmit={handleSearch}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search comics..."
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-light" type="submit">
                Search
              </button>
            </form>
            {user ? (
              <div className="d-flex align-items-center">
                <span className="me-2">Hello, {user.username}!</span>
                <button className="btn btn-light" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            ) : (
              <Link className="btn btn-light" to="/signin">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;