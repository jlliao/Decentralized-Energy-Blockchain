// plot.ts

import { Chart } from 'chart.js';
import { GoogleCharts } from 'google-charts'

export class PlotService {
	constructor() { }

	// create bar charts
	barChart(selector: string, datasets: any[], labelsName: any[]): any[] {
		return new Chart(selector, {
			type: 'bar',
			data: {
				labels: labelsName,
				datasets: [{
					label: "unit",
					backgroundColor: "rgba(2,117,216,1)",
					borderColor: "rgba(2,117,216,1)",
					data: datasets,
				}],
			},
			options: {
				scales: {
					xAxes: [{
						time: {
							unit: 'time'
						},
						gridLines: {
							display: false
						},
						ticks: {
							maxTicksLimit: 6
						}
					}],
					yAxes: [{
						ticks: {
							min: Math.round(Math.min(...datasets) - 10),
							max: Math.round(Math.max(...datasets) + 10),
							maxTicksLimit: 5
						},
						gridLines: {
							display: true
						}
					}],
				},
				legend: {
					display: false
				}
			}
		});
	}

	// create line charts
	lineChart(selector: string, datasets: any[], labelsName: any[]): any[] {
		return new Chart(selector, {
			type: 'line',
			data: {
				labels: labelsName,
				datasets: [{
					label: "unit",
					lineTension: 0.3,
					backgroundColor: "rgba(2,117,216,0.2)",
					borderColor: "rgba(2,117,216,1)",
					pointRadius: 5,
					pointBackgroundColor: "rgba(2,117,216,1)",
					pointBorderColor: "rgba(255,255,255,0.8)",
					pointHoverRadius: 5,
					pointHoverBackgroundColor: "rgba(2,117,216,1)",
					pointHitRadius: 20,
					pointBorderWidth: 2,
					data: datasets,
				}],
			},
			options: {
				scales: {
					xAxes: [{
						time: {
							unit: 'time'
						},
						gridLines: {
							display: false
						},
						ticks: {
							maxTicksLimit: 7
						}
					}],
					yAxes: [{
						ticks: {
							min: Math.round(Math.min(...datasets) - 100),
							max: Math.round(1.2 * Math.max(...datasets)),
							maxTicksLimit: 5
						},
						gridLines: {
							color: "rgba(0, 0, 0, .125)",
						}
					}],
				},
				legend: {
					display: false
				}
			}
		});
	}

	// waterfallChart(selector: string) {
	// 	GoogleCharts.load(this.drawChart);
	// 	this.drawChart(selector);
	// }

	// drawChart(selector: string) {
	// 	const data = GoogleCharts.api.visualization.arrayToDataTable([
	// 		['Mon', 28, 28, 38, 38],
	// 		['Tue', 38, 38, 55, 55],
	// 		['Wed', 55, 55, 77, 77],
	// 		['Thu', 77, 77, 66, 66],
	// 		['Fri', 66, 66, 22, 22]
	// 		// Treat the first row as data.
	// 	], true);

	// 	var options = {
	// 		legend: 'none',
	// 		bar: { groupWidth: '100%' }, // Remove space between bars.
	// 		candlestick: {
	// 			fallingColor: { strokeWidth: 0, fill: '#a52714' }, // red
	// 			risingColor: { strokeWidth: 0, fill: '#0f9d58' }   // green
	// 		}
	// 	};

	// 	var chart = GoogleCharts.api.visualization.CandlestickChart(selector);
	// 	chart.draw(data, options);
	// }


}