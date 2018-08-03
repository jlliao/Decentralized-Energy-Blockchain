import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { UpdateAccount } from '../../services/response';

//provide associated components
@Component({
  selector: 'app-Consumer',
  templateUrl: './Consumer.component.html',
  styleUrls: ['./Consumer.component.css'],
})

//ResidentComponent class
export class ConsumerComponent {

  // define variables
  myForm: FormGroup;

  private consumer: UpdateAccount;
  private consumerID = "ID100";
  private errorMessage;
  private successMessage;

  // initialize form variables
  name = new FormControl("", Validators.required);
  coinsValue = new FormControl("", Validators.required);
  tokenValue = new FormControl("", Validators.required);

  constructor(private dataService: DataService, fb: FormBuilder) {
    // intialize form
    this.myForm = fb.group({
      name: this.name,
      coinsValue: this.coinsValue,
      tokenValue: this.tokenValue
    });
  };

  // add Account - it uses update method behind the scene
  add(): void {
    // create update account object
    this.consumer = {
      "name": this.name.value,
      "coins": this.coinsValue.value,
      "token": this.tokenValue.value
    };

    this.dataService.updateAccount(this.consumerID, this.consumer)
      .subscribe(() => this.successMessage = "Consumer added", 
                 (error) => this.errorMessage = error);
  }
}