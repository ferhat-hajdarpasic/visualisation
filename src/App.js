import React, { Component, Text } from 'react';
import { GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import CurrentLocation from './Map';

import GOOGLE_API_KEY from './GOOGLE_API_KEY';

export class MapContainer extends Component {
  state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
    mushrooms: []
  };

  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });

  onClose = props => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  async componentDidMount() {
    try {
      let response = await fetch('http://demo.airtracker.io/api/clusters/1/1');
      let json = await response.json();
      let mushrooms = json.map(m => Object.assign(m, {position:{lat:m.lat, lng:m.lng}}));
      // console.log(`mushroos: ${JSON.stringify(mushrooms)}`);
      this.setState({mushrooms: mushrooms});
    } catch (e) {
      console.log(e);
    }
  }
  render() {
    return (
      <CurrentLocation
        centerAroundCurrentLocation
        google={this.props.google}
        mushrooms={this.state.mushrooms}
      >
        
    { this.state.mushrooms.length ? this.state.mushrooms.map(
          m => 
          <Marker onClick={this.onMarkerClick} name={m.mushroom_id} position={m.position} key={m.mushroom_id} label={`${m.value}`}>
          </Marker>) : [] }
        
        <InfoWindow marker={this.state.activeMarker} visible={this.state.showingInfoWindow} onClose={this.onClose}>
          <div>
            <h4>{this.state.selectedPlace.name}</h4>
            <h3>FRED</h3>
          </div>
        </InfoWindow>
      </CurrentLocation>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: GOOGLE_API_KEY
})(MapContainer);