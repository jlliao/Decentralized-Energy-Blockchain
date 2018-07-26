import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Headers } from '@angular/http';
import { Chart } from 'chart.js';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import 'rxjs/add/operator/toPromise';

import { Transaction } from '../participant';

//provide associated components
@Component({
	selector: 'app-Dashboard',
	templateUrl: './Dashboard.component.html',
	styleUrls: ['./Dashboard.component.css', './sb-admin.css']
})

export class DashboardComponent implements OnInit {

	private prosumerCoinList = [];
	private consumerCoinList = [];
	private prosumerTokenList = [];
	private consumerTokenList = [];
	private consumerLabelList = [];

	private transactionList = [];

	// private prosumerTokenChart = [];
	// private prosumerCoinChart = [];
	// private consumerTokenChart = [];
	// private consumerCoinChart = [];

	private transactionChart = [];

	private prosumerLastToken;
	private prosumerLastCoin;
	private consumerLastToken;
	private consumerLastCoin;

	private putList = [];
	private putPiObj: Transaction;
	private piList = [];
	// private remoteTimeList = [];

	private prosumerID = "ID100";
	private consumerID = "ID101";

	private errorMessage;
	private successMessage;

	constructor(private dataService: DataService, private auth: AuthService) { }

	ngOnInit() {

		this.auth.authenticate();

	}

	refresh() {

		this.loadAll();

	}

	loadPi() {

		this.dataService.getPi()
			.toPromise()
			.then((pidata) => {
				this.errorMessage = null;

				if (pidata.length > 0) {
					pidata.forEach(transact => {

						if (this.piList.indexOf(transact) == -1) {
							this.piList.push(transact)
						} 

					});
				}
			})
			.then(() => {
				this.transactBC();
			})
			.catch(error => {
				this.errorMessage = error;
			});
		
		
		// // store latest raspberry pi data
		// this.dataService.getRemote()
		// 	.toPromise()
		// 	.then((storage) => {
		// 		this.errorMessage = null;

		// 		if (storage.length > 0) {
		// 			storage.forEach(event => {
		// 				this.remoteTimeList.push(event["timestamp"]);
		// 			});
		// 		}
		// 	});

	}

	loadAll() {

		// for (let piObj of this.piList.filter((v, i, a) => a.indexOf(v) === i)) {
		// 	if (piObj['timestamp'] > Math.max(...this.remoteTimeList) || this.remoteTimeList.length == 0) {
		// 		this.putList.push(piObj);
		// 	}
		// }

		// if (this.putList.length > 0) {
		// 	this.transactBC();
		// }
		this.successMessage = null;

		let tempProsumerCoinList = [];
		let tempProsumerTokenList = [];

		let httpOptions = {
			headers: new Headers({
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.auth.accessToken}`
			}),
			withCredentials: true
		};

		//get all history data of the prosumer
		this.dataService.getHistory(this.prosumerID, httpOptions)
			.toPromise()
			.then((result) => {
				this.errorMessage = null;
				result.forEach(account => {
					tempProsumerTokenList.push(account["value"]["token"]);
					tempProsumerCoinList.push(account["value"]["coins"]);
				});
			}).then(() => {
				this.prosumerTokenList = tempProsumerTokenList.slice(-5);
				this.prosumerCoinList = tempProsumerCoinList.slice(-5);

				let tempConsumerTokenList = [];
				let tempConsumerCoinList = [];
				let tempConsumerLabelList = [];

				let httpOptions = {
					headers: new Headers({
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.auth.accessToken}`
					}),
					withCredentials: true
				};

				//get all history data of the consumer
				this.dataService.getHistory(this.consumerID, httpOptions)
					.toPromise()
					.then((result) => {
						this.errorMessage = null;
						result.forEach(account => {
							tempConsumerTokenList.push(account["value"]["token"]);
							tempConsumerCoinList.push(account["value"]["coins"]);
							tempConsumerLabelList.push(account["timestamp"].slice(7, 15));
						});

						// store only last 11 events
						this.consumerTokenList = tempConsumerTokenList.slice(-11);
						this.consumerCoinList = tempConsumerCoinList.slice(-11);
						this.consumerLabelList = tempConsumerLabelList.slice(-10);

						//get latest coin and token value
						this.prosumerLastToken = this.prosumerTokenList[this.prosumerTokenList.length - 1];
						this.prosumerLastCoin = this.prosumerCoinList[this.prosumerCoinList.length - 1];
						this.consumerLastToken = this.consumerTokenList[this.consumerTokenList.length - 1];
						this.consumerLastCoin = this.consumerCoinList[this.consumerCoinList.length - 1];

						//get transaction value
						this.transactionList = this.diff(this.consumerCoinList);

						//create line chart for transaction
						this.transactionChart = this.createLineChart("LineChart-transaction", this.transactionList, this.consumerLabelList);

						// this.prosumerTokenChart = this.createChart("BarChart-token-prosumer", this.prosumerTokenList);
						// this.prosumerCoinChart = this.createChart("BarChart-coin-prosumer", this.prosumerCoinList);
						// this.consumerTokenChart = this.createChart("BarChart-token-consumer", this.consumerTokenList);
						// this.consumerCoinChart = this.createChart("BarChart-coin-consumer", this.consumerCoinList);
					});

			});



	}

	// //create bar charts
	// createChart(selector: string, datasets: any[], labelsName: any[]): any[] {
	// 	return new Chart(selector, {
	// 		type: 'bar',
	// 		data: {
	// 			labels: labelsName,
	// 			datasets: [{
	// 				label: "Revenue",
	// 				backgroundColor: "rgba(2,117,216,1)",
	// 				borderColor: "rgba(2,117,216,1)",
	// 				data: datasets,
	// 			}],
	// 		},
	// 		options: {
	// 			scales: {
	// 				xAxes: [{
	// 					time: {
	// 						unit: 'time'
	// 					},
	// 					gridLines: {
	// 						display: false
	// 					},
	// 					ticks: {
	// 						maxTicksLimit: 6
	// 					}
	// 				}],
	// 				yAxes: [{
	// 					ticks: {
	// 						min: 0,
	// 						max: 2000,
	// 						maxTicksLimit: 5
	// 					},
	// 					gridLines: {
	// 						display: true
	// 					}
	// 				}],
	// 			},
	// 			legend: {
	// 				display: false
	// 			}
	// 		}
	// 	});

	// }

	//create line charts
	createLineChart(selector: string, datasets: any[], labelsName: any[]): any[] {
		return new Chart(selector, {
			type: 'line',
			data: {
			  labels: labelsName,
			  datasets: [{
				label: "Coins",
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
					min: 0,
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

	//post pi transaction data to SAP Blockchain
	transactBC() {
		let putPiList = []

		for (let piObj of this.piList) {
			let putPiObj = {
				"consumer": piObj['consumer'],
				"producer": piObj['producer'],
				"transaction": piObj['transaction']
			}

			putPiList.push(putPiObj)
		}

		let httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.auth.accessToken}`
			}),
			withCredentials: true
		};

		console.log(JSON.stringify(putPiList));

		this.dataService.transact(putPiList, httpOptions)
			.subscribe(() => this.successMessage = "IoT data is registered in Blockchain",
				(error) => this.errorMessage = error,
				() => {
					//put latest data to myjson server
					this.dataService.putRemote(this.piList)
						.toPromise()
				});

	};

	// calculate difference between consecutive numbers in an array
	diff(ary: any[]) {
		let newA = [];
		for (var i = 1; i < ary.length; i++)  newA.push(Math.abs(ary[i] - ary[i - 1]))
		return newA;
	}

}

