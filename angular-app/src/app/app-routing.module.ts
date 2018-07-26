import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';

import { ResidentComponent } from './Resident/Resident.component';
import { ResidentCarComponent } from './ResidentCar/ResidentCar.component';

import { TransactionRRComponent } from './TransactionRR/TransactionRR.component';

import { DashboardComponent } from './Dashboard/Dashboard.component';


const routes: Routes = [

    { path: '', component: HomeComponent },
    { path: 'About', component: AboutComponent },

    { path: 'Resident', component: ResidentComponent},

    { path: 'ResidentCar', component: ResidentCarComponent},

    { path: 'TransactionRR', component: TransactionRRComponent },

    { path: 'Dashboard', component: DashboardComponent },

		{path: '**', redirectTo:''}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
