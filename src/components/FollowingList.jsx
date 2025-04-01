import React from 'react';
import { Card } from 'react-bootstrap';

const FollowingList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p>No reviews from followed users yet.</p>;
  }

  return (
    <div className="mt-4">
      {reviews.map((review) => (
        <Card key={review.id} className="mb-3">
          <Card.Body>
            <Card.Title>
              {review.title} by {review.username}
            </Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              Rated {review.rating}/5
            </Card.Subtitle>
            <Card.Text>{review.review_text}</Card.Text>
            {review.cover_image && (
              <img
                src={`http://localhost:5000/images/${review.cover_image}`}
                alt={review.title}
                style={{
                  width: '100px',
                  height: '150px',
                  float: 'right',
                  marginTop: '-60px',
                }}
              />
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default FollowingList;
