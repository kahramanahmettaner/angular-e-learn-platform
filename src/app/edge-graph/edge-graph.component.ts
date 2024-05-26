import { Component, Input } from '@angular/core';
import { IGraphEdge } from '../models/GraphEdge.interface';
import { IPosition } from '../models/Position.interface';
import { CommonModule } from '@angular/common';
import { IGraphNode } from '../models/GraphNode.interface';

@Component({
  selector: 'g[app-edge-graph]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edge-graph.component.html',
  styleUrl: './edge-graph.component.css'
})
export class EdgeGraphComponent {

  // #############################
  // Inputs from parent component
  @Input() edge!: IGraphEdge;
  

  // #############################
  // Constructor
  constructor() {
    
  }

  // #############################
  // Utility functions
  
  calculateEdgeStart(edge: IGraphEdge): IPosition {
    // Calculate the distance between the center of two nodes
    const diffX = edge.node2.center.x - edge.node1.center.x;
    const diffY = edge.node2.center.y - edge.node1.center.y;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    // Handle edge case where the distance is zero to avoid division by zero
    if (distance === 0) { 
      return edge.node1.center; 
    }

    // Calculate the distance to the boundary so that the edge start is visible
    let distanceToBoundary;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        distanceToBoundary = edge.node1.size.width / 2;
    } else {
        distanceToBoundary = edge.node1.size.height / 2;
    }

    // Add 20 units to the boundary distance to extend the edge outside the node
    const extendedDistance = distanceToBoundary + 10;
    
    // Return the position for the start of the edge
    const x = edge.node1.center.x + (diffX * extendedDistance) / distance;
    const y = edge.node1.center.y + (diffY * extendedDistance) / distance;
    return { x, y };
  }

  calculateEdgeEnd(edge: IGraphEdge) {
    // Calculate the distance between the center of two nodes
    const diffX = edge.node1.center.x - edge.node2.center.x;
    const diffY = edge.node1.center.y - edge.node2.center.y;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    // Handle edge case where the distance is zero to avoid division by zero
    if (distance === 0) { 
      return edge.node2.center; 
    }
    
    // Calculate the distance to the boundary so that the arrow head is visible
    let distanceToBoundary;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        distanceToBoundary = edge.node2.size.width / 2;
    } else {
        distanceToBoundary = edge.node2.size.height / 2;
    }

    // Add 20 units to the boundary distance to extend the edge outside the node
    const extendedDistance = distanceToBoundary + 10;
    
    // Return the position for the end of the edge
    const x = edge.node2.center.x + (diffX * extendedDistance) / distance;
    const y = edge.node2.center.y + (diffY * extendedDistance) / distance;
    return { x, y };
  }

  calculateArrowPoints(edge: IGraphEdge) {
    // Specify where the arrowhead starts and ends
    let start: IPosition;  
    let end: IPosition;  
    if (edge.node1 === edge.node2) { // connects the node with itself
      const xOffset = 30;
      const yOffset = -10;
      start = { x: edge.node1.position.x + xOffset, y: edge.node1.position.y - 100 }; // -100 is not important it is just to specify the direction
      end = { x: edge.node1.position.x + xOffset, y: edge.node1.position.y + yOffset };
    } else {
      start = edge.node1.center; // to specify the direction of the startpoint
      end = this.calculateEdgeEnd(edge);  
    }
    
    // Size of the arrowhead
    const arrowSize = 15; 

    // Angle of the edgeline
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Points for the triangle (arrowhead)
    const p1 = { x: end.x, y: end.y };
    const p2 = {
      x: end.x - arrowSize * Math.cos(angle - Math.PI / 6),
      y: end.y - arrowSize * Math.sin(angle - Math.PI / 6)
    };
    const p3 = {
      x: end.x - arrowSize * Math.cos(angle + Math.PI / 6),
      y: end.y - arrowSize * Math.sin(angle + Math.PI / 6)
    };

    // Return the points
    return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
  }

  calculateSelfLoopPath(edge: IGraphEdge): string {
    
    // Start position of the edge
    const x = edge.node1.position.x;
    const y = edge.node2.position.y;
    
    // Loop Properties
    const radius = 20;
    const controlPointOffset = 0.55 * radius;

    // Construct the SVG path for a self-loop
    return `
      M ${x - 10} ${y + 30}
      C ${x - 100} ${y + 30},
        ${x + 30} ${y - 100},
        ${x + 30} ${y - 10}
    `;
  }

}
