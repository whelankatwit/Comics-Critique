import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../UserContext';
import FollowingList from '../components/FollowingList';
import { Container } from 'react-bootstrap';

const Following = () => {
  const { user } = useContext(UserContext);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (user) {
      fetchFollowingReviews();
    }
  }, [user]);

  const fetchFollowingReviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/following/reviews/${user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        console.error('Error fetching following reviews.');
      }
    } catch (error) {
      console.error('Error fetching following reviews:', error);
    }
  };

  if (!user) {
    return <p>Please sign in to view reviews from followed users.</p>;
  }

  return (
    <Container className="mt-4">
      <h2>Reviews from People You Follow</h2>
      <FollowingList reviews={reviews} />
    </Container>
  );
};

export default Following;
