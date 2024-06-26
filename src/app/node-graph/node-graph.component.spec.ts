import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeGraphComponent } from './node-graph.component';

describe('NodeGraphComponent', () => {
  let component: NodeGraphComponent;
  let fixture: ComponentFixture<NodeGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NodeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
