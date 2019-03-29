import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import moment from "moment";
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, ResponsiveContainer } from "recharts";
import { connect } from "react-redux";

const styles = {
    root: {
        flexGrow: 1,
    },
};

class CenteredTabs extends React.Component {
    state = {
        value: 0,
        selectedTimeSpanFilter: "DAY",
        chartData: { DAY: [], WEEK: [], MONTH: [], YEAR: [] }
    };

    fetchChartData = async (value) => {
        let id = this.props.mushroomId;
        let pollutantId = this.props.pollutantId;
        switch (value) {
            case 0:
                let hourData = await (await fetch(`http://demo.airtracker.io/api/mushrooms/${id}/${pollutantId}/history/hours/24`)).json();
                this.setState({
                    value,
                    selectedTimeSpanFilter: 'DAY',
                    chartData: {
                        DAY: hourData.map(entry => {
                            return {
                                name: moment(entry.time)
                                    .local()
                                    .format("h a"),
                                value: Math.round(entry.value),
                            };
                        }).reverse()
                    }
                });
                break;
            case 1:
                let dayData = await (await fetch(`http://demo.airtracker.io/api/mushrooms/${id}/${pollutantId}/history/days/7`)).json();
                this.setState({
                    value,
                    selectedTimeSpanFilter: 'WEEK',
                    chartData: {
                        WEEK: dayData.map(entry => {
                            return {
                                name: moment(entry.from)
                                    .local()
                                    .format("ddd"),
                                value: Math.round(entry.value),
                            };
                        }),
                    }
                });
                // console.log(`dayData=${JSON.stringify(dayData)}`);
                break;
            case 2:
                let monthData = await (await fetch(`http://demo.airtracker.io/api/mushrooms/${id}/${pollutantId}/history/days/31`)).json();
                this.setState({
                    value,
                    selectedTimeSpanFilter: 'MONTH',
                    chartData: {
                        MONTH: monthData.map(entry => {
                            return {
                                name: moment(entry.from)
                                    .local()
                                    .format("D"),
                                value: Math.round(entry.value),
                            };
                        })
                    }
                });
                // console.log(`monthData=${JSON.stringify(monthData)}`);
                break;
            case 3:
                let yearData = await (await fetch(`http://demo.airtracker.io/api/mushrooms/${id}/${pollutantId}/history/months/12`)).json();
                this.setState({
                    value,
                    selectedTimeSpanFilter: 'YEAR',
                    chartData: {
                        YEAR: yearData.map(entry => {
                            return {
                                name: moment(entry.from)
                                    .local()
                                    .format("MMM"),
                                value: Math.round(entry.value),
                            };
                        })
                    }
                });
                // console.log(`yearData=${JSON.stringify(yearData)}`);
                break;
        }
    };

    componentDidMount = async () => {
        await this.fetchChartData(0);
    }

    handleChange = async (event, value) => {
        await this.fetchChartData(value);
    };

    render() {
        const { classes } = this.props;

        return (
            <Paper className={classes.root}>
                <Tabs value={this.state.value} onChange={this.handleChange} indicatorColor="primary" textColor="primary" centered>
                    <Tab label="DAY" />
                    <Tab label="WEEK" />
                    <Tab label="MONTH" />
                    <Tab label="YEAR" />
                </Tabs>
                <Grid container spacing={0} direction="column" alignItems="center" justify="center" style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart margin={{ top: 5, right: 30, left: 30, bottom: 5 }} data={this.state.chartData[this.state.selectedTimeSpanFilter]} >
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#005691" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#005691" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                dataKey="name"
                                minTickGap={6}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <CartesianGrid vertical={false} stroke="#ccdfeb" />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#005691"
                                isAnimationActive={false}
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorUv)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Grid>

            </Paper>
        );
    }
}

CenteredTabs.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    ...state
  });
  const mapDispatchToProps = dispatch => ({
    startAction: () => dispatch(startAction),
    stopAction: () => dispatch(stopAction)
  });
 
  export default connect(mapStateToProps, mapDispatchToProps)(
    withStyles(styles)(CenteredTabs)
  );