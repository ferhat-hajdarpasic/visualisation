import React, { Component } from "react";
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from "recharts";
import CloseIcon from "./CloseIcon";
import "./chart-card.css";
import moment from "moment";
import ContainedButtons from './ContainedButtons';

const TIME_SPAN_FILTER = ["DAY", "WEEK", "MNTH", "YEAR"];

class Card extends Component {
	state = {
		selectedTimeSpanFilter: "DAY",
		chartData: { DAY: [], WEEK: [], MNTH: [], YEAR: [] }
	};

	async componentDidMount() {
		let id = this.props.mushroomId;
		let pollutantId = this.props.pollutantId;
		let hourData = await (await fetch(`http://demo.airtracker.io/api/mushrooms/${id}/${pollutantId}/history/hours/24`)).json();
		let dayData = await (await fetch(`http://demo.airtracker.io/api/mushrooms/${id}/${pollutantId}/history/days/7`)).json();
		let monthData = await (await fetch(`http://demo.airtracker.io/api/mushrooms/${id}/${pollutantId}/history/days/31`)).json();
		let yearData = await (await fetch(`http://demo.airtracker.io/api/mushrooms/${id}/${pollutantId}/history/months/12`)).json();

		console.log(`hourData: ${JSON.stringify(hourData)}`);
		this.setState({
			chartData: {
				DAY: hourData.map(entry => {
					return {
						name: moment(entry.time)
							.local()
							.format("h a"),
						value: Math.round(entry.value),
					};
				}).reverse(),
				WEEK: dayData.map(entry => {
					return {
						name: moment(entry.from)
							.local()
							.format("ddd"),
						value: Math.round(entry.value),
					};
				}),
				MNTH: monthData.map(entry => {
					return {
						name: moment(entry.from)
							.local()
							.format("D"),
						value: Math.round(entry.value),
					};
				}),
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
	}

	render() {
		return (
			<div>
				<div>
					<div className="chart-card-header">
						<div className="chart-card-info">
							<h4>{this.props.mushroomId}</h4>
							<span>{this.props.pollutanId}</span>
						</div>

						<div className="chart-card-controls">
							<ContainedButtons selectFilter={(filter) => {
								console.log(filter);
								// this.setState({ selectedTimeSpanFilter: filter });
							}
							} />
						</div>
					</div>
				</div>
				<div className="chart-wrapper">
					<AreaChart
						width={420}
						height={190}
						data={this.state.chartData[this.state.selectedTimeSpanFilter]}
						margin={{ top: 10, right: 15, left: -30, bottom: 0 }}>
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
				</div>
				<div className="chart-card-footer">
					Want even more? <a href="_blank">Upgrade your account</a>
				</div>
			</div>
		);
	}
}

export default Card;