import React, { useEffect, useMemo, useState } from 'react';
import { fetchMovie, submitReview } from '../actions/movieActions';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, ListGroupItem, Image, Form, Button } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

function getAverageRating(movie, reviewsOverride = null) {
  if (!movie && !reviewsOverride) {
    return null;
  }

  if (!reviewsOverride) {
    const directAverage = Number(movie.avgRating);
    if (!Number.isNaN(directAverage)) {
      return directAverage;
    }
  }

  const reviews = reviewsOverride ?? (Array.isArray(movie?.movieReviews) ? movie.movieReviews : []);
  if (!reviews.length) {
    // Fall back to backend-provided aggregate when there are no reviews in payload.
    const directAverage = Number(movie?.avgRating);
    if (Number.isNaN(directAverage)) {
      return null;
    }
    return directAverage;
  }

  const numericRatings = reviews
    .map((r) => Number(r.rating))
    .filter((r) => !Number.isNaN(r));

  if (!numericRatings.length) {
    return null;
  }

  return numericRatings.reduce((sum, r) => sum + r, 0) / numericRatings.length;
}

const MovieDetail = () => {
  const dispatch = useDispatch();
  const { movieId } = useParams();
  const selectedMovie = useSelector(state => state.movie.selectedMovie);

  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [optimisticReviews, setOptimisticReviews] = useState([]);

  const serverReviews = useMemo(
    () => (Array.isArray(selectedMovie?.movieReviews) ? selectedMovie.movieReviews : []),
    [selectedMovie]
  );
  const displayedReviews = useMemo(
    () => [...optimisticReviews, ...serverReviews].filter((reviewItem, index, arr) => {
      const reviewKey = `${reviewItem.username || ''}|${reviewItem.rating}|${reviewItem.review || ''}`;
      return arr.findIndex((r) => `${r.username || ''}|${r.rating}|${r.review || ''}` === reviewKey) === index;
    }),
    [optimisticReviews, serverReviews]
  );
  const averageRating = getAverageRating(selectedMovie, displayedReviews);

  useEffect(() => {
    if (!serverReviews.length || !optimisticReviews.length) {
      return;
    }

    const persisted = new Set(
      serverReviews.map((r) => `${r.username || ''}|${r.rating}|${r.review || ''}`)
    );

    setOptimisticReviews((existing) =>
      existing.filter((r) => !persisted.has(`${r.username || ''}|${r.rating}|${r.review || ''}`))
    );
  }, [serverReviews, optimisticReviews.length]);

  useEffect(() => {
    dispatch(fetchMovie(movieId));
  }, [dispatch, movieId]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const cleanReview = review.trim();
    const numericRating = Number(rating);
    const optimisticReview = {
      username: localStorage.getItem('username') || 'You',
      rating: numericRating,
      review: cleanReview
    };

    setOptimisticReviews((current) => [optimisticReview, ...current]);
    dispatch(submitReview(movieId, cleanReview, numericRating));
    setReview('');
    setRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (!selectedMovie) {
    return <div>Loading....</div>;
  }

  return (
    <Card className="bg-dark text-light p-4 rounded">
      <Card.Header><h4>{selectedMovie.title}</h4></Card.Header>

      <Card.Body>
        <Image
          src={selectedMovie.imageUrl || 'https://via.placeholder.com/300'}
          thumbnail
          style={{ maxHeight: '400px', objectFit: 'cover' }}
        />
      </Card.Body>

      <ListGroup>
        <ListGroupItem className="bg-dark text-light">
          <h5>Actors</h5>
          {selectedMovie.actors && selectedMovie.actors.map((actor, i) => (
            <p key={i}>
              <b>{actor.actorName}</b> as {actor.characterName}
            </p>
          ))}
        </ListGroupItem>

        <ListGroupItem className="bg-dark text-light">
          <h5><BsStarFill color="gold" /> Average Rating: {averageRating !== null ? averageRating.toFixed(1) : 'No ratings yet'}</h5>
        </ListGroupItem>
      </ListGroup>

      {/* Reviews Grid */}
      <Card.Body className="bg-secondary text-light rounded mt-2">
        <h5>Reviews</h5>
        {displayedReviews.length > 0 ? (
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>Username</th>
                <th>Rating</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {displayedReviews.map((r, i) => (
                <tr key={i}>
                  <td>{r.username}</td>
                  <td><BsStarFill color="gold" /> {r.rating}</td>
                  <td>{r.review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reviews yet. Be the first!</p>
        )}
      </Card.Body>

      {/* Submit Review Form */}
      <Card.Body className="bg-dark text-light rounded mt-2">
        <h5>Submit a Review</h5>
        {submitted && <p className="text-success">Review submitted successfully!</p>}
        <Form onSubmit={handleSubmitReview}>
          <Form.Group className="mb-3">
            <Form.Label>Rating (0-5)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Review</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review here..."
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">Submit Review</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default MovieDetail;