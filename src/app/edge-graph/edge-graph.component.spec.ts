import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdgeGraphComponent } from './edge-graph.component';

describe('EdgeGraphComponent', () => {
  let component: EdgeGraphComponent;
  let fixture: ComponentFixture<EdgeGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdgeGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EdgeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
