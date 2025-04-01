import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CustomLists.css';

const CustomLists = ({ lists }) => {
  const [comicsInLists, setComicsInLists] = useState({});

  useEffect(() => {
    const fetchComicsForLists = async () => {
      const comicsData = {};
      for (const list of lists) {
        try {
          const response = await fetch(`http://localhost:5000/api/list_comics/${list.id}`);
          if (response.ok) {
            const comics = await response.json();
            comicsData[list.id] = comics;
          }
        } catch (error) {
          console.error(`Error fetching comics for list ${list.id}:`, error);
        }
      }
      setComicsInLists(comicsData);
    };

    fetchComicsForLists();
  }, [lists]);

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {lists.map((list) => (
        <div key={list.id} className="col">
          <div className="card h-100 shadow-sm hover-shadow">
            <div className="card-body">
              <h5 className="card-title">{list.title}</h5>
              <p className="card-text text-muted">{list.description}</p>
              
              {comicsInLists[list.id] && comicsInLists[list.id].length > 0 ? (
                <div className="mt-3">
                  <h6 className="mb-3">Comics in this list:</h6>
                  <div className="list-comics">
                    {comicsInLists[list.id].map((comic) => (
                      <div key={comic.id} className="list-comic-item">
                        <div className="d-flex align-items-center mb-2">
                          {comic.cover_url && (
                            <img 
                              src={comic.cover_url} 
                              alt={comic.title}
                              className="list-comic-cover me-2"
                            />
                          )}
                          <div>
                            <h6 className="mb-0">{comic.title}</h6>
                            <Link to={`/writereview/${comic.id}`} className="btn btn-sm btn-outline-primary mt-1">
                              <span className="me-1">✍️</span>Review
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted mt-3">No comics in this list yet</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomLists;
