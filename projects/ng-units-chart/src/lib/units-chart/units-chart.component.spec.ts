import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgUnitsChartComponent } from './units-chart.component';

describe('NgUnitsChartComponent', () => {
  let component: NgUnitsChartComponent;
  let fixture: ComponentFixture<NgUnitsChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgUnitsChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgUnitsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
