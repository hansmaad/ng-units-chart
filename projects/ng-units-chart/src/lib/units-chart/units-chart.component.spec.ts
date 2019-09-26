import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartSeries, NgUnitsChartComponent } from './units-chart.component';
import { NgUnitsModule, time, pressure } from 'ng-units';

import 'chartist';
import 'chartist-logaxis';
import 'chartist-plugin-zoom';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';


@Component({
    template: `<ng-units-chart [series]="series"></ng-units-chart>`
})
class TestComponent {
    series: ChartSeries[];
}

describe('NgUnitsChartComponent', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgUnitsModule.forRoot({
                quantities: [time, pressure]
              })],
            declarations: [NgUnitsChartComponent, TestComponent]
        }).compileComponents();
    }));

    async function create(series: ChartSeries[]) {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        component.series = series;
        fixture.detectChanges();
        await fixture.whenStable();
        await fixture.whenRenderingDone();
    }

    it('should create', async () => {
        await create([]);
        expect(component).toBeTruthy();
    });

    it('should create chart with no series', async () => {
        await create([]);
        expect(getChart()).not.toBeFalsy();
    });

    it('should create chart with series', async () => {
        await createWith2Series();
        expect(getChart()).not.toBeFalsy();
        expect(getSeries().length).toBe(2);
    });

    it('should create legend items for series', async () => {
        await createWith2Series();
        const legend = getLegendItems();
        expect(legend.length).toBe(2);
        expect(legend[0].nativeElement.textContent).toContain('Axx');
        expect(legend[1].nativeElement.textContent).toContain('Bxx');
    });

    it('should draw series in different colors', async () => {
        await createWith2Series();
        const strokes = getSeriesStrokes();
        expect(strokes[0]).not.toEqual(strokes[1]);
    });

    it('should use same colors for legend items', async () => {
        await createWith2Series();
        expect(getSeriesStrokes()).toEqual(getLegendColors());
    });

    it('click on legend item should hide chart', async () => {
        await createWith2Series();
        const legend = getLegendItems();
        await clickButton(fixture, legend[0].query(By.css('a')));
        expect(getSeries().length).toBe(1);
        expect(legend[0].classes['ng-units-chart-hidden']).toBeTruthy();
        expect(legend[1].classes['ng-units-chart-hidden']).toBeFalsy();
        expect(getLegendColors()[1]).toEqual(getSeriesStrokes()[0]);
    });

    it('click on all legend items hide all', async () => {
        await createWith2Series();
        const legend = getLegendItems();
        await clickButton(fixture, legend[0].query(By.css('a')));
        await clickButton(fixture, legend[1].query(By.css('a')));
        expect(getSeries().length).toBe(0);
        expect(legend[0].classes['ng-units-chart-hidden']).toBeTruthy();
        expect(legend[1].classes['ng-units-chart-hidden']).toBeTruthy();
    });

    it('click on legend item 2nd time should show again', async () => {
        await createWith2Series();
        const legend = getLegendItems();
        await clickButton(fixture, legend[0].query(By.css('a')));
        await clickButton(fixture, legend[0].query(By.css('a')));
        expect(getSeries().length).toBe(2);
        expect(legend[0].classes['ng-units-chart-hidden']).toBeFalsy();
        expect(legend[1].classes['ng-units-chart-hidden']).toBeFalsy();
        expect(getSeriesStrokes()).toEqual(getLegendColors());
    });

    function getChart() {
        return fixture.nativeElement.querySelector('svg.ct-chart-line'); // debugElement is buggy with svg
    }

    function getSeries(): SVGGElement[] {
        return [].slice.call(fixture.nativeElement.querySelectorAll('.ct-series'));
    }

    function getSeriesStrokes(): string[] {
        return getSeries().map(s => s.querySelector('path').style.stroke);
    }

    function getLegendItems() {
        return fixture.debugElement.queryAll(By.css('.ng-units-chart-legend li'));
    }

    function getLegendColors() {
        return getLegendItems().map(i => i.query(By.css('.ng-units-chart-btn')).nativeElement.style['background-color']);
    }

    async function createWith2Series() {
        await create([
            { label: 'Axx', data: [{ x: 1, y: 1 }, { x: 1, y: 1 }] },
            { label: 'Bxx', data: [{ x: 2, y: 2 }, { x: 2, y: 2 }] }
        ]);
    }
});

async function clickButton<T, TElement extends Element>(fixture: ComponentFixture<T>,
    selector: string|DebugElement,
    predicate?: (e: TElement) => boolean): Promise<DebugElement> {

    const btn = getElement(fixture, selector, predicate);
    btn.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();
    return btn;
}

function getElement<T, TElement>(fixture: ComponentFixture<T>, selector: string|DebugElement, predicate?: (e: TElement) => boolean) {
    if (typeof selector === 'string') {
       return fixture.debugElement.queryAll(By.css(selector))
        .find(d => !predicate || predicate(d.nativeElement));
    }
    return selector as DebugElement;
}
