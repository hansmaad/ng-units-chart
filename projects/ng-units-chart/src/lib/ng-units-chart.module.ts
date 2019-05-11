import { NgModule } from '@angular/core';
import { NgUnitsChartComponent } from './units-chart/units-chart.component';
import { NgUnitsModule } from 'ng-units';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [NgUnitsChartComponent],
  imports: [
    CommonModule,
    NgUnitsModule.forChild()
  ],
  exports: [NgUnitsChartComponent]
})
export class NgUnitsChartModule { }
