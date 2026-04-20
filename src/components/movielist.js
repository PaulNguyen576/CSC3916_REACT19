import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies, setMovie, searchMovies } from "../actions/movieActions";
import { Link } from 'react-router-dom';
import { Image, Nav, Carousel, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';

function MovieList() {
    const dispatch = useDispatch();
    const movies = useSelector(state => state.movie.movies);
    const searchResults = useSelector(state => state.movie.searchResults);

    const [searchTitle, setSearchTitle] = useState('');
    const [searchActor, setSearchActor] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const memoizedMovies = useMemo(() => movies, [movies]);

    useEffect(() => {
        dispatch(fetchMovies());
    }, [dispatch]);

    const handleSelect = (selectedIndex) => {
        dispatch(setMovie(memoizedMovies[selectedIndex]));
    };

    const handleClick = (movie) => {
        dispatch(setMovie(movie));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const searchData = {};
        if (searchTitle) searchData.title = searchTitle;
        if (searchActor) searchData.actorName = searchActor;
        dispatch(searchMovies(searchData));
        setHasSearched(true);
    };

    const handleClearSearch = () => {
        setSearchTitle('');
        setSearchActor('');
        setHasSearched(false);
    };

    if (!memoizedMovies) {
        return <div>Loading....</div>;
    }

    return (
        <div>
            {/* Top Rated Movies Carousel */}
            <h4 className="text-light mb-3">🎬 Top Rated Movies</h4>
            <Carousel onSelect={handleSelect} className="bg-dark text-light p-4 rounded mb-4">
                {memoizedMovies.map((movie) => (
                    <Carousel.Item key={movie._id}>
                        <Nav.Link
                            as={Link}
                            to={`/movie/${movie._id}`}
                            onClick={() => handleClick(movie)}
                        >
                            <Image
                                className="image"
                                src={movie.imageUrl || 'https://via.placeholder.com/300'}
                                thumbnail
                                style={{ maxHeight: '400px', objectFit: 'cover' }}
                            />
                        </Nav.Link>
                        <Carousel.Caption>
                            <h3>{movie.title}</h3>
                            <BsStarFill color="gold" /> {movie.avgRating ? movie.avgRating.toFixed(1) : 'N/A'} &nbsp;&nbsp; {movie.releaseDate}
                        </Carousel.Caption>
                    </Carousel.Item>
                ))}
            </Carousel>

            {/* Search Section */}
            <h4 className="text-light mb-3">🔍 Search Movies</h4>
            <Card className="bg-dark text-light p-3 rounded mb-4">
                <Form onSubmit={handleSearch}>
                    <Row>
                        <Col md={5}>
                            <Form.Group className="mb-2">
                                <Form.Label>Movie Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by title..."
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={5}>
                            <Form.Group className="mb-2">
                                <Form.Label>Actor Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by actor..."
                                    value={searchActor}
                                    onChange={(e) => setSearchActor(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex align-items-end">
                            <Button variant="primary" type="submit" className="me-2">Search</Button>
                            <Button variant="secondary" onClick={handleClearSearch}>Clear</Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Search Results */}
            {hasSearched && (
                <div>
                    <h5 className="text-light mb-3">Search Results ({searchResults.length})</h5>
                    {searchResults.length === 0 ? (
                        <p className="text-light">No movies found.</p>
                    ) : (
                        <Row>
                            {searchResults.map((movie) => (
                                <Col md={4} key={movie._id} className="mb-3">
                                    <Card className="bg-secondary text-light h-100">
                                        <Card.Img
                                            variant="top"
                                            src={movie.imageUrl || 'https://via.placeholder.com/300'}
                                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                                        />
                                        <Card.Body>
                                            <Card.Title>{movie.title}</Card.Title>
                                            <Card.Text>
                                                <BsStarFill color="gold" /> {movie.avgRating ? movie.avgRating.toFixed(1) : 'N/A'} &nbsp; {movie.releaseDate}
                                            </Card.Text>
                                            <Nav.Link
                                                as={Link}
                                                to={`/movie/${movie._id}`}
                                                onClick={() => handleClick(movie)}
                                            >
                                                <Button variant="primary" size="sm">View Details</Button>
                                            </Nav.Link>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            )}
        </div>
    );
}

export default MovieList;