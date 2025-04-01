import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ComicsList.css';
import AddComicToList from '../components/AddComicToList';
import UserContext from '../UserContext';

function ComicsList() {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const url = searchQuery
          ? `http://localhost:5000/api/comics/search?query=${encodeURIComponent(searchQuery)}`
          : 'http://localhost:5000/api/comics';
        
        const response = await fetch(url);
        const data = await response.json();
        setComics(data);
      } catch (error) {
        console.error('Error fetching comics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, [searchQuery]);

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-left mb-0">Comics Collection</h2>
        {searchQuery && (
          <div className="text-muted">
            Showing results for "{searchQuery}"
          </div>
        )}
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {comics.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-muted">No comics found matching your search.</p>
          </div>
        ) : (
          comics.map((comic) => (
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
                  <h5 className="card-title">{comic.title}</h5>
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
                    {comic.synopsis && (
                      <div className="synopsis mt-3">
                        <p className="card-text">
                          <small className="text-muted">
                            <span className="me-2">📖</span>
                            Synopsis:
                          </small>
                        </p>
                        <p className="card-text synopsis-text">
                          {comic.synopsis}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    {user ? (
                      <div className="d-flex gap-2">
                        <Link to={`/writereview/${comic.id}`}>
                          <button className="btn btn-primary">
                            <span className="me-2">✍️</span>Write Review
                          </button>
                        </Link>
                        <AddComicToList comicId={comic.id} userId={user.id} />
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        <span className="me-2">ℹ️</span>
                        Sign in to write reviews and create custom lists
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ComicsList;