import { Component, OnInit, OnDestroy, OnChanges, Input, ViewChild, ElementRef, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { SystemOfUnits, QuantityFormatters } from 'ng-units';
import * as Chartist from 'chartist';


export interface ChartOptions extends Chartist.ILineChartOptions {

}

// export type ChartData = Array<Array<{x: number, y: number}>>;

export interface ChartSeries {
    label: string;
    data: Array<{ x: number, y: number }>;
    hidden?: boolean;
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
    @Input() axisTitleY: boolean | string = false;
    @Input() axisTitleX: boolean | string = false;
    @Input() quantityX: string;
    @Input() quantityY: string;
    @Input() scaleX = 'linear';
    @Input() scaleY = 'log10';
    @Input() options?: ChartOptions;
    @Input() classes: ChartClasses = {};

    @ViewChild('chart', { static: true }) chartRef: ElementRef;
    @ViewChild('axesHost', { static: true }) axesHost: ElementRef;

    resetZoom: () => void;
    chart: Chartist.IChartistLineChart;
    subscriptions: Subscription[] = [];


    constructor(private systemOfUnits: SystemOfUnits) { }

    ngOnInit() {
        const qx = this.systemOfUnits.get(this.quantityX);
        const qy = this.systemOfUnits.get(this.quantityY);
        const draw = () => this.draw();
        this.subscriptions = [
            this.systemOfUnits.subscribe(qx, draw),
            this.systemOfUnits.subscribe(qy, draw),
        ];
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.draw();
    }

    draw() {
        if (!this.series) {
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
            lineSmooth: false,
            fullWidth: true,
            showPoint: false,
            showGridBackground: true,
            classNames: {
                gridMinor: 'ct-grid-minor'
            },
            chartPadding: {
                right: 3,  // protect last grid line from disappear in some cases
                left: this.axisTitleY === false ? 0 : 40,
                bottom: this.axisTitleX === false ? 0 : 40,
            },
            plugins: [
                Chartist.plugins.zoom({
                    onZoom: (chart, resetFn) => this.resetZoom = () => {
                        resetFn();
                        this.resetZoom = null;
                    }
                })],
            axisY: Object.assign({
                scale: this.scaleY,
                offset: 60,
                showMinorGrid: true,
                labelOffset: {
                    y: 7,
                }
            }, defaultAxis),
            axisX: Object.assign({
                scale: this.scaleX,
                showMinorGrid: true,
            }, defaultAxis)
        };

        options = Object.assign(options, this.options);

        this.chart = new Chartist.Line(this.chartRef.nativeElement, {
            series: this.map(this.series)
        }, options as Chartist.ILineChartOptions);

        this.chart
            .on('created', (data) => this.positionAxisTitles(data))
            .on('draw', (data) => this.onDraw(data));
    }

    toggle(s: ChartSeries) {
        s.hidden = !s.hidden;
        this.update();
    }

    private update() {
        this.chart.update({
            series: this.map(this.series)
        });
    }

    private map(data: ChartSeries[]): any[] {
        if (!data) {
            return [];
        }
        const qx = this.systemOfUnits.get(this.quantityX);
        const qy = this.systemOfUnits.get(this.quantityY);
        return data.filter(s => !s.hidden).map(s => s.data.map(xy => {
            return {
                x: qx ? qx.fromBase(xy.x) : xy.x,
                y: qy ? qy.fromBase(xy.y) : xy.y,
            };
        }));
    }

    private onDraw(data) {
        this.setColor(data);
    }

    private setColor(data) {
        const types = ['line', 'point', 'bar', 'slice'];
        if (types.indexOf(data.type) >= 0) {
            const i = this.visibleIndex(data.seriesIndex);
            const style = data.element.attr('style');
            data.element.attr({ 'style': style + ';stroke:' + this.getColor(i) });
        }
    }

    private visibleIndex(renderedIndex: number): number {
        let count = renderedIndex;
        const series = this.series;
        for (let i = 0, length = series.length; i < length; ++i) {
            if (!series[i].hidden && --count < 0) {
                return i;
            }
        }
        return renderedIndex;
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

        const axisYLength = data.axisY.axisLength;
        const dataOptions = data.options;
        const chartPadding = dataOptions.chartPadding;

        const topY = chartPadding.top + axisYLength;
        const leftY = Y_AXIS_OFFSET_X;

        const topX = chartPadding.top + axisYLength + X_AXIS_OFFSET_Y;
        const leftX = dataOptions.axisY.offset + chartPadding.left;

        titleX.style.top = topX + 'px';
        titleX.style.left = leftX + 'px';
        titleX.style.width = data.axisX.axisLength + 'px';

        titleY.style.left = leftY + 'px';
        titleY.style.top = topY + 'px';
        titleY.style.width = axisYLength + 'px';
    }

    legendClass(index) {
        return this.series[index].hidden ? 'ng-units-chart-hidden' : '';
    }

    legendStyle(index) {
        return { 'background-color': index >= 0 ? this.getColor(index) : '#ccc' };
    }
}
