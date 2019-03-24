import React, { Component, Text } from 'react';
import { GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import CurrentLocation from './Map';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';
import DoneIcon from '@material-ui/icons/Done';

import POLLUTANTS from './pollutants'
import AMBIEANT from '././ambient'
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
    open: false

  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
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

  async pollutantSelected(pollutant) {
    try {
      let mushrooms = await this.fetchMushrooms(pollutant.metricId);
      //Just temporary because we are playing with lng and lat of mushrooms on the server
      let positions = {};
      this.state.mushrooms.forEach(mushroom => {
        positions[mushroom.mushroom_id]=mushroom.position;
      });
      for(let i=0; i < mushrooms.length; i++) {
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
      console.log(`mushrooms: ${JSON.stringify(mushrooms)}`);
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
    const { open } = this.state;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={classNames(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar disableGutters={!open}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" noWrap>
              Persistent drawer
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
          <Divider />
          <List>
            {POLLUTANTS.map((pollutant, index) => (
              <ListItem button key={index} onClick={() => this.pollutantSelected(pollutant)}>
                <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                <ListItemText primary={pollutant.name} />
              </ListItem>
            ))}
          </List>
          <li>
            <Typography variant="h6" className={classes.title}>
              Ambient
            </Typography>
          </li>

          <List>
            {AMBIEANT.map((pollutant, index) => (
              <ListItem button key={index} onClick={() => this.pollutantSelected(pollutant)}>
                <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                <ListItemText primary={pollutant.name} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <main
          className={classNames(classes.content, {
            [classes.contentShift]: open,
          })}
        >
          <div className={classes.drawerHeader} />
          <CurrentLocation
            centerAroundCurrentLocation
            google={this.props.google}
            mushrooms={this.state.mushrooms}
          >

            {this.state.mushrooms.length ? this.state.mushrooms.map(
              m =>
                <Marker onClick={this.onMarkerClick} name={m.mushroom_id} position={m.position} key={m.mushroom_id} label={`${m.value}`}>
                </Marker>) : []}

            <InfoWindow marker={this.state.activeMarker} visible={this.state.showingInfoWindow} onClose={this.onClose}>
              <Paper>
                <Typography
                  variant='headline'
                  component='h4'
                >
                  {this.state.selectedPlace.name}
                </Typography>
                <Typography
                  component='p'
                >
                  98G Albe Dr Newark, DE 19702 <br />
                  {this.state.selectedPlace.label}
                </Typography>
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

export default GoogleApiWrapper({
  apiKey: GOOGLE_API_KEY
})(withStyles(styles, { withTheme: true })(MapContainer));