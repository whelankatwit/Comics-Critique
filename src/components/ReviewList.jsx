import { useState, useEffect, useContext } from 'react';
import UserContext from '../UserContext';
import './ReviewList.css';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const { user, setUser } = useContext(UserContext);
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const response = await fetch('http://localhost:5000/api/reviews');
    const data = await response.json();
    setReviews(data);
    if (user) {
      await fetchFollowingStatus(data);
    }
  };

  // Fetch like count for each review
  const fetchLikeCount = async (reviewId) => {
    const response = await fetch(`http://localhost:5000/api/likes/${reviewId}`);
    const data = await response.json();
    return data.likeCount || 0;
  };

  // Handle like click
  const handleLike = async (reviewId) => {
    if (!user) {
      alert('You need to sign in to like a review.');
      return;
    }

    const likeData = { reviewId, userId: user.id };

    try {
      const response = await fetch('http://localhost:5000/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(likeData),
      });

      if (response.ok) {
        // Update the like count after adding the like
        fetchReviews(); // Refresh the list to get updated like count
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error liking review.');
      }
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  // Fetch following
  const fetchFollowingStatus = async (reviewsData) => {
    const statusMap = {};
    for (let review of reviewsData) {
      if (review.user_id !== user.id) {
        console.log(user.id);
        console.log(review.user_id);
        try {
          const response = await fetch(
            `http://localhost:5000/api/is-following?followerId=${user.id}&followingId=${review.user_id}`
          );
          const data = await response.json();
          statusMap[review.user_id] = data.isFollowing;
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      }
    }

    setFollowingStatus(statusMap);
  };

  const handleFollow = async (followingId) => {
    const url = followingStatus[followingId]
      ? 'http://localhost:5000/api/unfollow'
      : 'http://localhost:5000/api/follow';

    const response = await fetch(url, {
      method: followingStatus[followingId] ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ followerId: user.id, followingId }),
    });

    if (response.ok) {
      // Toggle follow status after successful follow/unfollow
      setFollowingStatus({
        ...followingStatus,
        [followingId]: !followingStatus[followingId],
      });
    }
  };

  return (
    <div className="reviews-container">
      <h2 className="mb-4">Recent Reviews</h2>
      <div className="list-group">
        {reviews.map((review) => (
          <div key={review.id} className="list-group-item">
            <div className="row align-items-start">
              <div className="col-md-9">
                <div className="review-content">
                  <h5 className="review-title">{review.title}</h5>
                  <div className="review-author">
                    <span>By: {review.username}</span>
                    {user && review.user_id !== user.id && (
                      <button
                        className={`btn btn-sm follow-button ${
                          followingStatus[review.user_id] ? 'btn-danger' : 'btn-primary'
                        } ms-3`}
                        onClick={() => handleFollow(review.user_id)}
                      >
                        {followingStatus[review.user_id] ? 'Unfollow' : 'Follow'}
                      </button>
                    )}
                  </div>
                  <p className="review-text">{review.review_text}</p>
                  <div className="review-rating">
                    Rating: {review.rating}/5
                  </div>
                  <div className="review-actions">
                    <button
                      onClick={() => handleLike(review.id)}
                      className={`btn like-button ${
                        review.liked ? 'btn-outline-danger' : 'btn-outline-primary'
                      }`}
                    >
                      {review.liked ? '👎 Unlike' : '👍 Like'}
                    </button>
                    <span className="like-count">{review.like_count || 0} Likes</span>
                  </div>
                </div>
              </div>
              <div className="col-md-3 text-end">
                <img
                  src={review.cover_url}
                  alt={review.title}
                  className="review-comic-cover"
                  style={{ maxWidth: '120px' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
