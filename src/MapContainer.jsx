import { GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CurrentLocation from './CurrentLocation';
import PersistentDrawerLeft from './PersistentDrawerLeft';
import PrimarySearchAppBar from './PrimarySearchAppBar';
import GOOGLE_API_KEY from './GOOGLE_API_KEY';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  pollutants: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexWrap: 'none',
    padding: theme.spacing.unit / 2,
  },
  chip: {
    margin: theme.spacing.unit / 2,
  }
});

export class MapContainer extends Component {
  state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
    mushrooms: [],
    lastSamples: [{}],
    bottomDrawerOpened: false,

  };

  toggleBottomDrawer = (open) => {
    console.log(`TOGGLE ${this.state.bottomDrawerOpened}`);
    this.setState({ bottomDrawerOpened: open });
  };

  onMarkerClick = async (props, marker, e) => {
    const device_id = props.name;
    this.props.selectMushroom(device_id);
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });

    try {
      let response = await fetch(`http://demo.airtracker.io/api/mushrooms/${device_id}/lastsamples`);
      let lastSamples = await response.json();
      // console.log(`Device id=${device_id}, json=${JSON.stringify(lastSamples)}`);
      this.setState({ lastSamples: lastSamples });
    } catch (e) {
      console.log(e);
    }
  }

  onClose = props => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  async componentWillReceiveProps(newProps, oldProps) {
    if (newProps.pollutant != oldProps.pollutant) {
      await this.pollutantSelected(newProps.pollutant);
    }
  }

  async pollutantSelected(metricId) {
    try {
      let mushrooms = await this.fetchMushrooms(metricId);
      //Just temporary because we are playing with lng and lat of mushrooms on the server
      let positions = {};
      this.state.mushrooms.forEach(mushroom => {
        positions[mushroom.mushroom_id] = mushroom.position;
      });
      for (let i = 0; i < mushrooms.length; i++) {
        let mushroom = mushrooms[i];
        mushroom.position.lat = positions[mushroom.mushroom_id].lat;
        mushroom.position.lng = positions[mushroom.mushroom_id].lng;
        mushroom.lat = positions[mushroom.mushroom_id].lat;
        mushroom.lng = positions[mushroom.mushroom_id].lng;
      };
      this.setState({ mushrooms: mushrooms });
    } catch (e) {
      console.log(e);
    }
  }

  async componentDidMount() {
    try {
      let mushrooms = await this.fetchMushrooms(1);
      this.setState({ mushrooms: mushrooms });
      // console.log(`mushrooms: ${JSON.stringify(mushrooms)}`);
    } catch (e) {
      console.log(e);
    }
  }

  async fetchMushrooms(metricId) {
    let response = await fetch(`http://demo.airtracker.io/api/clusters/1/${metricId}`);
    let json = await response.json();
    let mushrooms = json.map(m => Object.assign(m, { position: { lat: m.lat, lng: m.lng } }));
    return mushrooms;
  }

  render() {
    const { classes, theme } = this.props;

    return (
      <div>
        <CssBaseline />
        <PrimarySearchAppBar position="fixed"
          className={classNames(classes.appBar, {
            [classes.appBarShift]: this.props.leftnavigatorOpen,
          })} />
        <PersistentDrawerLeft />
        <main>
          <CurrentLocation centerAroundCurrentLocation google={this.props.google} mushrooms={this.state.mushrooms}>
            {
              this.state.mushrooms.length ? this.state.mushrooms.map(
                m =>
                  <Marker onClick={this.onMarkerClick} name={m.mushroom_id} position={m.position} key={m.mushroom_id} label={`${m.value}`}>
                  
                  </Marker>) : []
            }
            <InfoWindow marker={this.state.activeMarker} visible={this.state.showingInfoWindow} onClose={this.onClose}>
              <Paper>
                <div className={classes.title}>
                  <Typography variant="h6" id="tableTitle">
                  {`Most recent measurements for ${this.props.selectedMushroomId}` }
                  </Typography>
                </div>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Time</TableCell>
                      <TableCell align="right">Pollutant (g)</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.lastSamples.map((sample, index) => (
                      <TableRow key={index}>
                        <TableCell align="right">{sample.time}</TableCell>
                        <TableCell align="right">{sample.metric}</TableCell>
                        <TableCell align="right">{sample.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

              </Paper>
            </InfoWindow>
          </CurrentLocation>
        </main>
      </div>
    );
  }
}

MapContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  ...state
});
const mapDispatchToProps = dispatch => ({
  openLeftNav: () => dispatch({ type: 'SET_LEFT_NAV', open: true }),
  selectMushroom: (mushroomId) => dispatch({ type: 'SET_MUSHROOM', mushroomId: mushroomId })
});

export default GoogleApiWrapper({
  apiKey: GOOGLE_API_KEY
})(withStyles(styles, { withTheme: true })(connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles, { withTheme: true })(MapContainer)
)));