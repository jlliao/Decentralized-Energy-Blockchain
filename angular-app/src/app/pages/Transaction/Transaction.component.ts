import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Account, Transaction } from '../../services/response';

// provide associated components
@Component({
	selector: 'app-Transaction',
	templateUrl: './Transaction.component.html',
	styleUrls: ['./Transaction.component.css']
})

// TransactionComponent class
export class TransactionComponent implements OnInit {

  // define variables
  myForm: FormGroup;
  private errorMessage;
  private transactionFrom; //change when transaction is done

  private prosumerName = "Prosumer Not Found";
  private consumerName = "Consumer Not Found";
  
  private transaction: Transaction;
  private transactionList = [];
  private consumerID = "ID100";
  private producerID = "ID101";
  private transactionValue; // display transaction value when transaction is done

  // initialize form variables
	tokenValue = new FormControl("", Validators.required);
  
  constructor(private dataService: DataService, fb: FormBuilder) {
    // intialize form  
	  this.myForm = fb.group({		  
		  tokenValue: this.tokenValue
    });
    
  };

  // on page initialize, refresh form
  ngOnInit() {
    this.transactionFrom  = true;
    this.getProsumerAndConsumer();
  }

  // get prosumer and consumer names
  getProsumerAndConsumer() {
    this.dataService.getAccount(this.producerID)
      .subscribe((data: Account) => this.prosumerName = data.name);
    
    this.dataService.getAccount(this.consumerID)
      .subscribe((data: Account) => this.consumerName = data.name);
  }

  // execute transaction
  execute() {
          
    // create transaction object
    this.transaction = {
      "timestamp": String(Date.now()),
      "consumer": this.consumerID,
      "producer": this.producerID,
      "transaction": this.tokenValue.value      
    };

    this.transactionList.push(this.transaction);

    this.dataService.transact(this.transactionList)
    .subscribe(() => this.transactionFrom = false, 
               (error) => this.errorMessage = error,
               () => this.transactionValue = this.tokenValue.value);
  }
}
