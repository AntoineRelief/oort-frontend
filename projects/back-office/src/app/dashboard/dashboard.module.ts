import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { WhoLayoutModule } from '@who-ems/builder';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    WhoLayoutModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
