import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NgUnitsChartModule } from './ng-units-chart';
import { NgUnitsModule, pressure, time } from 'ng-units';

import 'chartist';
import 'chartist-logaxis';
import 'chartist-plugin-zoom';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgUnitsModule.forRoot({
      quantities: [time, pressure]
    }),
    NgUnitsChartModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
