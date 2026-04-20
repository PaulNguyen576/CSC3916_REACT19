import actionTypes from '../constants/actionTypes';

const env = process.env;

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

function reviewSubmitted() {
    return {
        type: actionTypes.SUBMIT_REVIEW
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
        return fetch(`${env.REACT_APP_API_URL}/movies/${movieId}?reviews=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            mode: 'cors'
        }).then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        }).then((res) => {
            dispatch(movieFetched(res.movie));  // ← res.movie not res
        }).catch((e) => console.log(e));
    }
}

export function fetchMovies() {
    return dispatch => {
        return fetch(`${env.REACT_APP_API_URL}/movies?reviews=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            mode: 'cors'
        }).then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        }).then((res) => {
            dispatch(moviesFetched(res.movies));  // ← res.movies not res
        }).catch((e) => console.log(e));
    }
}

export function submitReview(movieId, review, rating) {
    return dispatch => {
        return fetch(`${env.REACT_APP_API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            mode: 'cors',
            body: JSON.stringify({ movieId, review, rating })
        }).then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        }).then(() => {
            dispatch(reviewSubmitted());
            dispatch(fetchMovie(movieId)); // refresh movie to show new review
        }).catch((e) => console.log(e));
    }
}

export function searchMovies(searchData) {
    return dispatch => {
        return fetch(`${env.REACT_APP_API_URL}/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            mode: 'cors',
            body: JSON.stringify(searchData)
        }).then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        }).then((res) => {
            dispatch(moviesSearched(res.movies));
        }).catch((e) => console.log(e));
    }
}