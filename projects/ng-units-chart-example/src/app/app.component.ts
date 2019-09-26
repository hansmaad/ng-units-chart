import { Component } from '@angular/core';
import { ChartSeries, ChartOptions } from 'ng-units-chart';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {
    options: ChartOptions = {
        showPoint: true,
    };
    series: ChartSeries[] = [
        {
            label: 'Series 1',
            data: [
                { x: 1, y: 1 }, { x: 2, y: 436 }, { x: 3, y: 12 },
            ]
        },
        {
            label: 'Series 2',
            data: [
                { x: 1, y: 112 }, { x: 2, y: 2 }, { x: 3, y: 712 }
            ]
        }
    ];
}
