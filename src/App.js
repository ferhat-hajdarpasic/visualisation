import { withStyles } from '@material-ui/core/styles';
import { GoogleApiWrapper } from 'google-maps-react';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import GOOGLE_API_KEY from './GOOGLE_API_KEY';
import reducers from './reducers';
import MapContainer from './MapContainer';

const store = createStore(reducers)

export class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <MapContainer />
      </Provider>
    );
  }
}

export default App;