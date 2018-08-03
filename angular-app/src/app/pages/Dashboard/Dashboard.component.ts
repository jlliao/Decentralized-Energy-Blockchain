import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CookieService } from 'ngx-cookie-service';
import { PlotService } from '../../components/plot'

import { Transaction } from '../../services/response';

//provide associated components
@Component({
  selector: 'app-Dashboard',
  templateUrl: './Dashboard.component.html',
  styleUrls: ['./Dashboard.component.css', './sb-admin.css'], // sb-admin is a third-party resource
  providers: [ PlotService ]
})

export class DashboardComponent implements OnInit {

  // define variables for prosumer
  private prosumerCoin: number;
  private prosumerEnergyProduced: number;
  private prosumerEnergySold: number;
  private prosumerEnergyStored: number;
  private prosumerBarChart: any[];
  private prosumerLineChart: any[];

  // define variables for consumer
  private consumerCoin: number;
  private consumerEnergy: number;
  private consumerLineChart: any[];

  // define variables for pi
  private previous = null;
  private current = null;

	private prosumerID = "ID101";
	private consumerID = "ID100";

	private errorMessage;
	private successMessage;

	constructor(private dataService: DataService, private plotService: PlotService, private cookieService: CookieService) { }

	ngOnInit() {

    this.loadPi();
    this.loadAll();

	}

	refresh() {

		this.loadAll();

	}

  // get data from pi and post pi data to scp
	loadPi() {
    // run requests every 5 seconds
    setInterval(() => {
      // get pi data
      this.dataService.getPi()
        .subscribe((pidata: Transaction[]) => {
          this.errorMessage = null;
          // save current pi data to cookie
          this.cookieService.set('current', JSON.stringify(pidata));
          this.previous = this.cookieService.get('previous');
          // get current data from cookie
          this.current = this.cookieService.get('current');
          //check if the pi data is already posted to scp
          if (this.previous !== this.current) {
            console.log('Refresh Dashboard');
            console.log("Current data:", JSON.stringify(this.current));
            console.log("Previous data:", JSON.stringify(this.previous));
            this.dataService.transact(pidata)
              .subscribe(() => {
                this.successMessage = "IoT data is registered in Blockchain";
              }, (error) => {
                this.errorMessage = error;
              }, () => {
                location.reload();
              })
          }
          // save the pi data to 'previous' cookie token
          this.cookieService.set('previous', JSON.stringify(pidata));
        })
    }, 5000)
	}

	loadAll() {

		this.successMessage = null;

		let prosumerTokenList = [];
    let prosumerTimeList = [];
    
    let consumerTokenList = [];
    let consumerTimeList = [];

    // this.plotService.waterfallChart('Waterfall-prosumer'); 

    // get all history data of the prosumer
    this.dataService.getHistory(this.prosumerID)
      .subscribe((data) => {
        data.forEach((account) => {
          prosumerTokenList.push(account['value']['token']);
          prosumerTimeList.push(account['timestamp'].slice(7, 15)); // get only hour, min sec
        })
        this.prosumerCoin = data[data.length - 1]['value']['coins']; // get last coin value
        this.prosumerEnergyStored = data[data.length - 1]['value']['token']; // get last token value
      }, (error) => {
        this.errorMessage = error
      }, () => {
        this.prosumerEnergySold = this.sumNeg(this.diff(prosumerTokenList)); // total energy sold
        this.prosumerEnergyProduced = this.prosumerEnergySold + this.prosumerEnergyStored; // total energy produced

        let label = prosumerTimeList.slice(-10);
        let transaction = this.diff(prosumerTokenList).slice(-10);
        let energyLeft = prosumerTokenList.slice(-10);
        // create bar chart for transaction
        this.plotService.barChart('BarChart-transaction', transaction, label);
        // create line chart for energy stored
        this.plotService.lineChart('LineChart-energyStored-prosumer', energyLeft, label);
      })
    
    // get all history data of the consumer
    this.dataService.getHistory(this.consumerID)
      .subscribe((data) => {
        data.forEach((account) => {
          consumerTokenList.push(account['value']['token']);
          consumerTimeList.push(account['timestamp'].slice(7, 15));
        })
        this.consumerCoin = data[data.length - 1]['value']['coins']; // get last coin value
        this.consumerEnergy = data[data.length - 1]['value']['token']; // get last token value
      }, (error) => {
        this.errorMessage = error
      }, () => {
        let label = consumerTimeList.slice(-10);
        let energyBought = consumerTokenList.slice(-10)
        // create line chart for total energy purchased
        this.plotService.lineChart('LineChart-energy-consumer', energyBought, label)
      })
    
  }

	// calculate difference between consecutive numbers in an array
	diff(ary: any[]) {
		let newA = [];
		for (var i = 1; i < ary.length; i++)  newA.push(ary[i] - ary[i - 1])
		return newA;
  }
  
  // calculate absolute sum of negative number in an array
	sumNeg(ary: any[]) {
		let sum = 0;
		for (var i = 0; i < ary.length; i++) {
			if (ary[i] < 0) {
				sum -= ary[i];
			}
		}
		return sum
  }

}

