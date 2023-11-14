const getInitialState = () => {
    const token = localStorage.getItem('token') || 'null'
    // const org = localStorage.getItem('org') || 'null'
    return {
        token,
        isAuthenticated: token  === 'null' ? false : true,
        loading: false,
        error: null,
    };
};

const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'LOGIN_REQUEST':
            return {
                ...state,
                loading: true,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                token: action.payload.token,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                loading: false,
                token: null,
                error: null,
            };
        default:
            return state;
    }
}

export { getInitialState, reducer }