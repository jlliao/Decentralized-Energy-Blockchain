import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import 'rxjs/add/operator/toPromise';
import { Transaction } from '../participant';

//provide associated components
@Component({
	selector: 'app-TransactionRR',
	templateUrl: './TransactionRR.component.html',
	styleUrls: ['./TransactionRR.component.css']
})

//TransactionRRComponent class
export class TransactionRRComponent implements OnInit {

  //define variables
  myForm: FormGroup;
  private errorMessage;
  private transactionFrom;
  
  private transaction: Transaction;
  private transactionList = [];
  private consumerID = "ID101";
  private producerID = "ID100";
  private transactionValue;

  //initialize form variables
	tokenValue = new FormControl("", Validators.required);
  
  constructor(private dataService: DataService, private auth: AuthService, fb: FormBuilder) {
    //intialize form  
	  this.myForm = fb.group({		  
		  tokenValue: this.tokenValue
    });
    
  };

  //on page initialize, refresh form
  ngOnInit(): void {
    this.auth.authenticate;
    this.transactionFrom  = true;
  }

  //execute transaction
  execute(): void {
          
    //create transaction object
    this.transaction = {
      "consumer": this.consumerID,
      "producer": this.producerID,
      "transaction": this.tokenValue.value      
    };

    let httpOptions = {
      headers: new HttpHeaders ({
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.auth.accessToken}`
      }),
      withCredentials: true
    };

    this.transactionList.push(this.transaction);

    this.dataService.transact(this.transactionList, httpOptions)
    .subscribe(() => this.transactionFrom = false, 
               (error) => this.errorMessage = error,
               () => this.transactionValue = this.tokenValue.value);
  }
}
