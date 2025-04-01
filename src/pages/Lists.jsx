// src/pages/List.jsx
import React, { useEffect, useState, useContext } from 'react';
import UserContext from '../UserContext';
import CustomLists from '../components/CustomLists';
import './Lists.css';
import { Link } from 'react-router-dom';

const Lists = () => {
  const { user } = useContext(UserContext);
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserLists();
    }
  }, [user]);

  const fetchUserLists = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/lists/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setLists(data);
      } else {
        console.error('Error fetching lists');
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewList((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          title: newList.title,
          description: newList.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLists((prevLists) => [data, ...prevLists]);
        setNewList({ title: '', description: '' });
        setShowForm(false);
      } else {
        console.error('Error creating list');
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  if (loading) {
    return (
      <div className="lists-container">
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading your lists...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lists-container">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="display-4 mb-2">Your Lists</h1>
            <p className="text-muted mb-0">Organize and manage your comic collections</p>
          </div>
          {lists.length > 0 && (
            <button 
              className="btn btn-primary d-flex align-items-center"
              onClick={() => setShowForm(!showForm)}
            >
              <span className="me-2">📝</span>
              {showForm ? 'Cancel' : 'Create New List'}
            </button>
          )}
        </div>

        {showForm && (
          <div className="form-card mb-5">
            <div className="card-body">
              <h3 className="card-title mb-4">Create New List</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={newList.title}
                    onChange={handleInputChange}
                    placeholder="Enter list title"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={newList.description}
                    onChange={handleInputChange}
                    placeholder="Enter list description"
                    rows="3"
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    <span className="me-2">✨</span>Create List
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {lists.length === 0 ? (
          <div className="empty-state">
            <span className="display-1">📚</span>
            <h3>No Lists Yet</h3>
            <p className="text-muted">Start by creating your first comic collection!</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <span className="me-2">📝</span>Create Your First List
            </button>
          </div>
        ) : (
          <CustomLists lists={lists} />
        )}
      </div>
    </div>
  );
};

export default Lists;
