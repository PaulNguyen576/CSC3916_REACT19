import React, { useEffect, useState } from 'react';
import { fetchMovie, submitReview } from '../actions/movieActions';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, ListGroupItem, Image, Form, Button } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

const MovieDetail = () => {
  const dispatch = useDispatch();
  const { movieId } = useParams();
  const selectedMovie = useSelector(state => state.movie.selectedMovie);

  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(fetchMovie(movieId));
  }, [dispatch, movieId]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    dispatch(submitReview(movieId, review, Number(rating)));
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
          <h5><BsStarFill color="gold" /> Average Rating: {selectedMovie.avgRating ? selectedMovie.avgRating.toFixed(1) : 'No ratings yet'}</h5>
        </ListGroupItem>
      </ListGroup>

      {/* Reviews Grid */}
      <Card.Body className="bg-secondary text-light rounded mt-2">
        <h5>Reviews</h5>
        {selectedMovie.movieReviews && selectedMovie.movieReviews.length > 0 ? (
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>Username</th>
                <th>Rating</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {selectedMovie.movieReviews.map((r, i) => (
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