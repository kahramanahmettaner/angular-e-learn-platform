import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeBinarySearchTreeComponent } from './node-binary-search-tree.component';

describe('NodeBinarySearchTreeComponent', () => {
  let component: NodeBinarySearchTreeComponent;
  let fixture: ComponentFixture<NodeBinarySearchTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeBinarySearchTreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NodeBinarySearchTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
