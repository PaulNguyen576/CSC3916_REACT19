import actionTypes from '../constants/actionTypes';
//import runtimeEnv from '@mars/heroku-js-runtime-env'
const env = process.env;

function userLoggedIn(username) {
    return {
        type: actionTypes.USER_LOGGEDIN,
        username: username
    }
}

function logout() {
    return {
        type: actionTypes.USER_LOGOUT
    }
}

export function submitLogin(data) {
    return dispatch => {
        const username = (data.username || '').trim();
        const password = data.password;

        const signin = (payload) => fetch(`${env.REACT_APP_API_URL}/signin`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        const parseAndLogin = (response) => {
            if (!response.ok) {
                throw Error(`Sign in failed (${response.status})`);
            }
            return response.json();
        };

        return signin({ username, password })
            .catch((err) => {
                // Some backends use "email" instead of "username".
                return signin({ email: username, password }).catch(() => {
                    throw err;
                });
            })
            .then(parseAndLogin)
            .then((res) => {
                const token = res.token || res.accessToken || res.jwt || res.jwtToken;
                if (!token) {
                    throw Error('Sign in response did not include a token.');
                }

                localStorage.setItem('username', username);
                localStorage.setItem('token', token);
                dispatch(userLoggedIn(username));
            })
            .catch((e) => {
                console.log(e);
                alert('Unable to sign in. Please verify your credentials and try again.');
            });
    }
}

export function submitRegister(data) {
    return dispatch => {
        return fetch(`${env.REACT_APP_API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            mode: 'cors'
        }).then((response) => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json()
        }).then((res) => {
            dispatch(submitLogin(data));
        }).catch((e) => console.log(e));
    }
}

export function logoutUser() {
    return dispatch => {
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        dispatch(logout())
    }
}