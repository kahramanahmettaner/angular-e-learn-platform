import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IPosition } from '../models/Position.interface';
import { IGraphEdge } from '../models/GraphEdge.interface';
import { ISize } from '../models/Size.interface';

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
  @Input() workspacePosition!: IPosition;


  // #############################
  // Outputs for parent component
  @Output() removeEdge: EventEmitter<number> = new EventEmitter<number>();
  @Output() changeEdgeDirection: EventEmitter<number> = new EventEmitter<number>();
  

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

    
  // #############################
  // Utility functions

  calculateComponentPosition(): IPosition {
    const relativePos = this.calculateEdgeCenter(this.edge.node1.center, this.edge.node2.center, this.componentSize);
    return {
      x: relativePos.x + this.workspacePosition.x,
      y: relativePos.y + this.workspacePosition.y
    }
  }

  calculateEdgeCenter(start: IPosition, end: IPosition, size: ISize): IPosition{
    const x = (start.x + end.x - size.width) / 2;
    const y = (start.y + end.y - size.height) / 2;
    return { x, y };
  }
}
