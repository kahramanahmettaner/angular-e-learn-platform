import { Component, Input } from '@angular/core';
import { IGraphEdge } from '../models/GraphEdge.interface';
import { CommonModule } from '@angular/common';
import { calculateArrowPoints, calculateEdgeStart, calculateEdgeEnd, calculateSelfLoopPath } from '../utils';

@Component({
  selector: 'g[app-edge-graph]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edge-graph.component.html',
  styleUrl: './edge-graph.component.css'
})
export class EdgeGraphComponent {

  // #############################
  // Expose the enums to the template
  public calculateArrowPoints = calculateArrowPoints;
  public calculateEdgeStart = calculateEdgeStart;
  public calculateEdgeEnd = calculateEdgeEnd;
  public calculateSelfLoopPath = calculateSelfLoopPath;


  // #############################
  // Inputs from parent component
  @Input() edge!: IGraphEdge;
  

  // #############################
  // Constructor
  constructor() {
    
  }

}
