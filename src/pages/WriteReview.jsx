import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';

function Review() {
  const { comicId } = useParams();
  const [comic, setComic] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const { user, setUser } = useContext(UserContext);

  // Fetch comic details
  useEffect(() => {
    const fetchComicDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/comics/${comicId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch comic details');
        }
        const data = await response.json();
        setComic(data);
      } catch (error) {
        console.error('Error fetching comic details:', error);
      }
    };

    fetchComicDetails();
  }, [comicId]);

  // Handle review submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('You need to sign in to submit a review.');
      return;
    }

    const reviewData = {
      comicId,
      userId: user.id,
      review: reviewText,
      rating: parseInt(rating),
    };

    console.log(reviewData);

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        setReviewText('');
        setRating(0);
      } else {
        alert('Error submitting review.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="container mt-5">
      {comic ? (
        <div className="card shadow-lg p-4 mb-5 bg-white rounded">
          <h2 className="text-center mb-4">{comic.title}</h2>
          <form onSubmit={handleSubmit}>
            {/* Rating Input */}
            <div className="mb-3">
              <label className="form-label"><strong>Your Rating:</strong></label>
              <select
                className="form-select"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              >
                <option value="" disabled>Select a rating</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>

            {/* Review Text Area */}
            <div className="mb-3">
              <label className="form-label"><strong>Your Review:</strong></label>
              <textarea
                className="form-control"
                rows="5"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your thoughts about this comic..."
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-100">
              Submit Review
            </button>
          </form>
        </div>
      ) : (
        <p className="text-center">Loading comic details...</p>
      )}
    </div>
  );
}

export default Review;
