import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { UpdateAccount } from '../../services/response';

//provide associated components
@Component({
  selector: 'app-Prosumer',
  templateUrl: './Prosumer.component.html',
  styleUrls: ['./Prosumer.component.css'],
})

// ProsumerComponent class
export class ProsumerComponent {

  // define variables
  myForm: FormGroup;

  private prosumer: UpdateAccount;
  private prosumerID = "ID101";
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
    this.prosumer = {
      "name": this.name.value,
      "coins": this.coinsValue.value,
      "token": this.tokenValue.value
    };

    this.dataService.updateAccount(this.prosumerID, this.prosumer)
      .subscribe(() => this.successMessage = "Prosumer added", 
                 (error) => this.errorMessage = error);
  }
}
