import constants from '../constants/actionTypes'

let initialState = {
    movies: [],
    selectedMovie: null,
    searchResults: []
}

const movieReducer = (state = initialState, action) => {
    let updated = Object.assign({}, state);

    switch(action.type) {
        case constants.FETCH_MOVIES:
            updated['movies'] = action.movies;
            updated['selectedMovie'] = action.movies[0];
            return updated;
        case constants.SET_MOVIE:
            updated['selectedMovie'] = action.selectedMovie;
            return updated;
        case constants.FETCH_MOVIE:
            updated['selectedMovie'] = action.selectedMovie;
            return updated;
        case constants.SUBMIT_REVIEW:
            if (!updated.selectedMovie || !action.review) {
                return updated;
            }

            const existingReviews = Array.isArray(updated.selectedMovie.movieReviews)
                ? updated.selectedMovie.movieReviews
                : [];
            const movieReviews = [action.review, ...existingReviews];
            const numericRatings = movieReviews
                .map((r) => Number(r.rating))
                .filter((r) => !Number.isNaN(r));

            const avgRating = numericRatings.length
                ? numericRatings.reduce((sum, r) => sum + r, 0) / numericRatings.length
                : updated.selectedMovie.avgRating;

            updated['selectedMovie'] = {
                ...updated.selectedMovie,
                movieReviews,
                avgRating
            };

            return updated;
        case constants.SEARCH_MOVIES:
            updated['searchResults'] = action.movies;
            return updated;
        default:
            return state;
    }
}

export default movieReducer;