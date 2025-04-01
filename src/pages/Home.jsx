import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [topComics, setTopComics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopComics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/top-comics');
        if (response.ok) {
          const data = await response.json();
          setTopComics(data);
        } else {
          console.error('Error fetching top comics');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopComics();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Welcome to Comics Critique</h1>
        <p className="lead text-muted">Discover the highest rated comics in our collection</p>
      </div>
      
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {topComics.map((comic, index) => (
          <div key={comic.id} className="col">
            <div className="card h-100 shadow-sm hover-shadow">
              {comic.cover_url && (
                <img 
                  src={comic.cover_url} 
                  alt={comic.title} 
                  className="card-img-top comic-cover"
                />
              )}
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title mb-0">{comic.title}</h5>
                  <span className="badge bg-warning text-dark">
                    #{index + 1}
                  </span>
                </div>
                <div className="comic-details">
                  <p className="card-text">
                    <small className="text-muted">
                      <span className="me-2">👤</span>
                      Author: {comic.author || 'Unknown'}
                    </small>
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      <span className="me-2">🎨</span>
                      Artist: {comic.artist || 'Unknown'}
                    </small>
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      <span className="me-2">📅</span>
                      Release Year: {comic.release_year}
                    </small>
                  </p>
                </div>
                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <div className="rating-badge">
                    <span className="badge bg-success">
                      ⭐ {parseFloat(comic.average_rating).toFixed(1)}
                    </span>
                    <small className="text-muted ms-2">
                      {comic.review_count} review{comic.review_count !== 1 ? 's' : ''}
                    </small>
                  </div>
                  <Link to={`/writereview/${comic.id}`}>
                    <button className="btn btn-primary">
                      <span className="me-2">✍️</span>Review
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-5">
        <Link to="/comics" className="btn btn-outline-primary btn-lg">
          View All Comics
        </Link>
      </div>
    </div>
  );
};

export default Home;
