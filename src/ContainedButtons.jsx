import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

function ContainedButtons(props) {
  const { classes } = props;
  return (
    <div>
      <Button variant="contained" className={classes.button} onClick={() => props.selectFilter('DAY')}>
        Day
      </Button>
      <Button variant="contained" className={classes.button} onClick={() => props.selectFilter('WEEK')}>
        Week
      </Button>
      <Button variant="contained" className={classes.button} onClick={() => props.selectFilter('MONTH')}>
        Month
      </Button>
      <Button variant="contained" className={classes.button} onClick={() => props.selectFilter('YEAR')}>
        Year
      </Button>
    </div>
  );
}

ContainedButtons.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContainedButtons);