import { Component, OnInit, OnDestroy, OnChanges, Input, ViewChild, ElementRef, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { SystemOfUnits, QuantityFormatters } from 'ng-units';
import * as Chartist from 'chartist';


export interface ChartOptions extends Chartist.ILineChartOptions {

}

export type ChartData = Array<Array<{x: number, y: number}>>;

export interface ChartSeries {
    label: string;
    data: Array<{x: number, y: number}>;
}

export interface ChartClasses {
    btn?: string;
    select?: string;
}

const colors = [
    '#ECAA38',
    '#0F5B78',
    '#5CA793',
    '#D94E1F',
    '#C02E1D',
    '#A2B86C',
    '#3A98C8',
    '#C5157E',
    '#FF5858',
    '#b4e146',
    '#ffd800',
    '#757AD1',
];

@Component({
  selector: 'ng-units-chart',
  templateUrl: './units-chart.component.html',
  styleUrls: ['./units-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NgUnitsChartComponent implements OnInit, OnDestroy, OnChanges {

  @Input() series: ChartSeries[];
  @Input() axisTitleY: boolean|string = false;
  @Input() axisTitleX: boolean|string = false;
  @Input() quantityX: string;
  @Input() quantityY: string;
  @Input() options?: ChartOptions;
  @Input() classes: ChartClasses = {}

  @ViewChild('chart', { static: true }) chartRef: ElementRef;
  @ViewChild('axesHost', { static: true }) axesHost: ElementRef;

  resetZoom: () => void;
  chart: Chartist.IChartistLineChart;
  subscriptions: Subscription[] = [];


  constructor(private systemOfUnits: SystemOfUnits) { }

  ngOnInit() {
      const qx = this.systemOfUnits.get(this.quantityX);
      const qy = this.systemOfUnits.get(this.quantityY);
      this.subscriptions = [
          this.systemOfUnits.subscribe(qx, () => this.draw()),
          this.systemOfUnits.subscribe(qy, () => this.draw()),
      ];
  }

  ngOnDestroy() {
      this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
      this.draw();
  }

  draw() {
      console.log('Redraw');
      if (!this.series) {
          console.log('No data, skip');
          return;
      }
      const formatter = QuantityFormatters['default'];
      const defaultAxis = {
          labelInterpolationFnc: formatter,
          type: Chartist.AutoScaleAxis,
          onlyInteger: false,
          scaleMinSpace: 50,
      };

      let options = {
          height: '100%',
          lineSmooth: true,
          fullWidth: true,
          showPoint: false,
          showGridBackground: true,
          chartPadding: {
              right: 2,  // protect last grid line from disappear in some cases
              left: this.axisTitleY === false ? 0 : 40,
              bottom: this.axisTitleX === false ? 0 : 40,
          },
          plugins: [
              Chartist.plugins.zoom({
                  onZoom : (chart, resetFn) => this.resetZoom = () => {
                      resetFn();
                      this.resetZoom = null;
                  }
              })],
          axisY: Object.assign({
              scale: 'log10',
              offset: 60,
              labelOffset: {
                  y: 7,
              }
          }, defaultAxis),
          axisX: Object.assign({
              type: Chartist.AutoScaleAxis,
          }, defaultAxis)
      };

      options = Object.assign(options, this.options);


      this.chart = new Chartist.Line(this.chartRef.nativeElement, {
          series: this.map(this.series)
      }, options);

      this.chart.on('created', (data) => this.positionAxisTitles(data))
          .on('draw', (data) => this.onDraw(data));
  }

  map(data: ChartSeries[]): any[] {
      if (!data) {
          return [];
      }
      const qx = this.systemOfUnits.get(this.quantityX);
      const qy = this.systemOfUnits.get(this.quantityY);
      return data.map(s => s.data.map(xy => {
          return {
              x: qx ? qx.fromBase(xy.x) : xy.x,
              y: qy ? qy.fromBase(xy.y) : xy.y,
          };
      }));
  }

  onDraw(data) {
      this.setColor(data);
  }

  setColor(data, index?: number) {
      const types = ['line', 'point', 'bar', 'slice'];
      if (types.indexOf(data.type) >= 0) {
          // const i = index === undefined ? visibleIndex(this.visibilities, data.seriesIndex) : index;
          const i = index === undefined ? data.seriesIndex : index;
          const style = data.element.attr('style');
          data.element.attr({ 'style': style + ';stroke:' + this.getColor(i) });
      }
  }

  getColor(index) {
      return colors[index] || '#ccc';
  }

  protected positionAxisTitles(data) {

      const axes = this.axesHost.nativeElement;
      const titleX = axes.querySelector('.ng-units-chart-axis-x') as HTMLHtmlElement;
      const titleY = axes.querySelector('.ng-units-chart-axis-y') as HTMLHtmlElement;

      if (!titleX || !titleY) {
          return;
      }

      const Y_AXIS_OFFSET_X = 15;
      const X_AXIS_OFFSET_Y = 35;

      let axisYLength = data.axisY.axisLength;
      let dataOptions = data.options;
      let chartPadding = dataOptions.chartPadding;

      let topY = chartPadding.top + axisYLength;
      let leftY = Y_AXIS_OFFSET_X;

      let topX = chartPadding.top + axisYLength + X_AXIS_OFFSET_Y;
      let leftX = dataOptions.axisY.offset + chartPadding.left;

      titleX.style.top = topX + 'px';
      titleX.style.left = leftX + 'px';
      titleX.style.width = data.axisX.axisLength + 'px';

      titleY.style.left = leftY + 'px';
      titleY.style.top = topY + 'px';
      titleY.style.width = axisYLength + 'px';
  }

  legendClass(index) {
      return '';
      // return this.visibilities[index] === false ? 'chart-hidden' : '';
  }

  legendStyle(index) {
      return { 'background-color': index >= 0 ? this.getColor(index) : '#ccc' };
  }
}

function visibleIndex(visibilities: boolean[], renderedIndex: number): number {
  let count = renderedIndex;
  for (let i = 0, length = visibilities.length; i < length; ++i) {
      if (visibilities[i] !== false && --count < 0) {
          return i;
      }
  }
  return renderedIndex;
}
