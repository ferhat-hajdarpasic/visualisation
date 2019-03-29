const initialState = {
    leftnavigatorOpen: false, pollutant: 1
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_LEFT_NAV':
            console.log("SET_LEFT_NAV=" + JSON.stringify(action.provider));
            return { ...state, leftnavigatorOpen: action.open };
        case 'SET_POLLUTANT':
            console.log("REDUX: SET_POLLUTANT=" + JSON.stringify(action.pollutant));
            return { ...state, pollutant: action.pollutant };
        default:
            return state;
    }
}