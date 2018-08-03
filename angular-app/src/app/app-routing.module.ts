import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';

import { ProsumerComponent } from './pages/Prosumer/Prosumer.component';
import { ConsumerComponent } from './pages/Consumer/Consumer.component';

import { TransactionComponent } from './pages/Transaction/Transaction.component';

import { DashboardComponent } from './pages/Dashboard/Dashboard.component';


const routes: Routes = [

    { path: '', component: HomeComponent },
    { path: 'About', component: AboutComponent },

    { path: 'Prosumer', component: ProsumerComponent},

    { path: 'Consumer', component: ConsumerComponent},

    { path: 'Transaction', component: TransactionComponent },

    { path: 'Dashboard', component: DashboardComponent },

		{path: '**', redirectTo:''}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
