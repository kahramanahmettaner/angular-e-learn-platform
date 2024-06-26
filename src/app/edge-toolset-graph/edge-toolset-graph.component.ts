import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IPosition } from '../models/Position.interface';
import { IGraphEdge } from '../models/GraphEdge.interface';
import { ISize } from '../models/Size.interface';
import { calculateLineCenter } from '../utils';

@Component({
  selector: 'app-edge-toolset-graph',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edge-toolset-graph.component.html',
  styleUrl: './edge-toolset-graph.component.css'
})
export class EdgeToolsetGraphComponent implements OnInit {
  
  // #############################
  // References for HTML Elements
  @ViewChild('edgeToolset') component!: ElementRef<HTMLInputElement>;
  @ViewChild('edgeWeightValueInput') edgeWeightValueInput!: ElementRef<HTMLInputElement>;


  // #############################
  // Inputs from parent component
  @Input() edge!: IGraphEdge;
  @Input() index!: number;


  // #############################
  // Outputs for parent component
  @Output() removeEdge: EventEmitter<number> = new EventEmitter<number>();
  @Output() changeEdgeDirection: EventEmitter<number> = new EventEmitter<number>();
  @Output() changeEdgeWeight: EventEmitter<{ edgeIndex: number, newWeight: number }> = new EventEmitter<{ edgeIndex: number, newWeight: number }>();
  

  // #############################
  // Class properties
  weightZIndex: number;
  displayEdgeToolbar: boolean;
  editEdgeWeight: boolean;
  componentSize!: ISize;
  

  // #############################
  // Constructor
  constructor() {
    this.weightZIndex = 1;
    this.displayEdgeToolbar = false;
    this.editEdgeWeight = false;
  }
  
  
  // #############################
  // Lifecycle hook methods
  ngOnInit(): void {
    // weight is enabled:
    if (this.edge.weight.enabled) {
      this.componentSize = {
        width: 50,
        height: 30
      }
    } else { // weight is disabled
      this.componentSize = {
        width: 25,
        height: 25
      }
    }
  }

  // #############################
  // Functions for interactions with UI
  onRemoveEdge(event: MouseEvent) {
    this.removeEdge.emit(this.index);
  }

  onChangeDirection(event: MouseEvent) {
    try {
      this.changeEdgeDirection.emit(this.index);
    } catch (err) { console.error(err); }
  }

  onFieldHover(event: any) {
    this.weightZIndex = 10;
    this.displayEdgeToolbar = true;
  }

  onFieldLeave(event: any) {
    this.weightZIndex = 1;
    this.displayEdgeToolbar = false;
  }

  onEditNodeValueClick() {
    if (this.edge.weight.enabled) {
      this.editEdgeWeight = true;

      // Ensure that the input element is mounted 
      setTimeout(() => {
        this.edgeWeightValueInput.nativeElement.focus();
      }, 0);
    }
  }

  onInputValueChange(event: any) {
    let intValue = Number(event.target.value);

    intValue = isNaN(intValue) ? 0 : intValue;

    this.changeEdgeWeight.emit({
      edgeIndex: this.index,
      newWeight: intValue
    })
  }

    
  // #############################
  // Utility functions

  calculateComponentPosition(): IPosition {
    let position: IPosition;
    if (this.edge.node1 === this.edge.node2) { // edges which connect a node with itself
      return { 
        x: this.edge.node1.position.x - 20 - (this.componentSize.width / 2), 
        y: this.edge.node1.position.y - 20 - (this.componentSize.height / 2)
      }; 
    } else { // edges which connect two different nodes
      return calculateLineCenter(this.edge.node1.center, this.edge.node2.center, this.componentSize);
    }
  }

}
