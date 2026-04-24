import actionTypes from '../constants/actionTypes';

const env = process.env;

function getAuthToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        return '';
    }
    return token.replace(/^Bearer\s+/i, '').trim();
}

function authHeaders(useBearer = false) {
    const token = getAuthToken();
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': useBearer ? `Bearer ${token}` : token
    };
}

function fetchWithAuthFallback(url, options = {}) {
    const baseOptions = {
        ...options,
        mode: 'cors'
    };

    return fetch(url, {
        ...baseOptions,
        headers: {
            ...authHeaders(false),
            ...(options.headers || {})
        }
    }).then((response) => {
        if (response.status === 401 || response.status === 403) {
            return fetch(url, {
                ...baseOptions,
                headers: {
                    ...authHeaders(true),
                    ...(options.headers || {})
                }
            });
        }
        return response;
    });
}

function parseMoviesPayload(res) {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.movies)) return res.movies;
    if (Array.isArray(res?.results)) return res.results;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.movieList)) return res.movieList;
    return [];
}

function moviesFetched(movies) {
    return {
        type: actionTypes.FETCH_MOVIES,
        movies: movies
    }
}

function movieFetched(movie) {
    return {
        type: actionTypes.FETCH_MOVIE,
        selectedMovie: movie
    }
}

function movieSet(movie) {
    return {
        type: actionTypes.SET_MOVIE,
        selectedMovie: movie
    }
}

function reviewSubmitted(review) {
    return {
        type: actionTypes.SUBMIT_REVIEW,
        review
    }
}

function moviesSearched(movies) {
    return {
        type: actionTypes.SEARCH_MOVIES,
        movies: movies
    }
}

export function setMovie(movie) {
    return dispatch => {
        dispatch(movieSet(movie));
    }
}

export function fetchMovie(movieId) {
    return dispatch => {
        return fetchWithAuthFallback(`${env.REACT_APP_API_URL}/movies/${movieId}?reviews=true`, {
            method: 'GET',
        }).then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        }).then((res) => {
            dispatch(movieFetched(res.movie || res));
        }).catch((e) => console.log(e));
    }
}

export function fetchMovies() {
    return dispatch => {
        return fetchWithAuthFallback(`${env.REACT_APP_API_URL}/movies?reviews=true`, {
            method: 'GET',
        }).then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        }).then((res) => {
            dispatch(moviesFetched(parseMoviesPayload(res)));
        }).catch((e) => console.log(e));
    }
}

export function submitReview(movieId, review, rating) {
    return dispatch => {
        const optimisticReview = {
            username: localStorage.getItem('username') || 'You',
            rating,
            review
        };
        dispatch(reviewSubmitted(optimisticReview));

        return fetchWithAuthFallback(`${env.REACT_APP_API_URL}/reviews`, {
            method: 'POST',
            body: JSON.stringify({ movieId, review, rating })
        }).then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        }).then(() => {
            dispatch(fetchMovie(movieId)); // refresh movie to show new review
        }).catch((e) => console.log(e));
    }
}

export function searchMovies(searchData) {
    return dispatch => {
        const title = (searchData.title || '').trim();
        const actorName = (searchData.actorName || '').trim();
        const payload = {
            title,
            actorName,
            movieTitle: title,
            actor: actorName,
            query: `${title} ${actorName}`.trim()
        };

        const postSearch = (url) => fetchWithAuthFallback(url, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        return postSearch(`${env.REACT_APP_API_URL}/search`)
            .then((response) => {
                if (!response.ok) {
                    // Common alternative route used in many assignments.
                    return postSearch(`${env.REACT_APP_API_URL}/movies/search`);
                }
                return response;
            })
            .then((response) => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .then((res) => {
                dispatch(moviesSearched(parseMoviesPayload(res)));
            })
            .catch((e) => {
                console.log(e);
                dispatch(moviesSearched([]));
            });
    }
}