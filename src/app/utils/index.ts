import { IBstNode } from "../models/BstNode.interface";
import { IGraphEdge } from "../models/GraphEdge.interface";
import { IGraphNode } from "../models/GraphNode.interface";
import { IPosition } from "../models/Position.interface";
import { ISize } from "../models/Size.interface";

export function calculateShapeCenter(position: IPosition, size: ISize): IPosition {
    const center: IPosition = {
      x: position.x + (size.width / 2),
      y: position.y + (size.height / 2)
    };
    return center;
}


export function calculateLineCenter(from: IPosition, to: IPosition, size: ISize): IPosition{
    const x = (from.x + to.x - size.width) / 2;
    const y = (from.y + to.y - size.height) / 2;
    return { x, y };
}

export function calculateEdgeStart(from: IBstNode | IGraphNode, to: IBstNode | IGraphNode): IPosition {
    // Calculate the distance between the center of two nodes
    const diffX = to.center.x - from.center.x;
    const diffY = to.center.y - from.center.y;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    // Handle edge case where the distance is zero to avoid division by zero
    if (distance === 0) { 
      return from.center; 
    }

    // Calculate the distance to the boundary so that the edge start is visible
    let distanceToBoundary;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        distanceToBoundary = from.size.width / 2;
    } else {
        distanceToBoundary = from.size.height / 2;
    }

    // Add 20 units to the boundary distance to extend the edge outside the node
    const extendedDistance = distanceToBoundary + 10;
    
    // Return the position for the start of the edge
    const x = from.center.x + (diffX * extendedDistance) / distance;
    const y = from.center.y + (diffY * extendedDistance) / distance;
    return { x, y };
}

export function calculateEdgeEnd(from: IBstNode | IGraphNode, to: IBstNode | IGraphNode) {
    // Calculate the distance between the center of two nodes
    const diffX = from.center.x - to.center.x;
    const diffY = from.center.y - to.center.y;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    // Handle edge case where the distance is zero to avoid division by zero
    if (distance === 0) { 
      return to.center; 
    }
    
    // Calculate the distance to the boundary so that the arrow head is visible
    let distanceToBoundary;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        distanceToBoundary = to.size.width / 2;
    } else {
        distanceToBoundary = to.size.height / 2;
    }

    // Add 20 units to the boundary distance to extend the edge outside the node
    const extendedDistance = distanceToBoundary + 10;
    
    // Return the position for the end of the edge
    const x = to.center.x + (diffX * extendedDistance) / distance;
    const y = to.center.y + (diffY * extendedDistance) / distance;
    return { x, y };
}

export function calculateArrowPoints(from: IBstNode | IGraphNode, to: IBstNode | IGraphNode) {
    // Specify where the arrowhead starts and ends
    let start: IPosition;  
    let end: IPosition;  
    if (from === to) { // connects the node with itself
      const xOffset = 30;
      const yOffset = -10;
      start = { x: from.position.x + xOffset, y: from.position.y - 100 }; // -100 is not important it is just to specify the direction
      end = { x: from.position.x + xOffset, y: from.position.y + yOffset };
    } else {
      start = from.center; // to specify the direction of the startpoint
      end = calculateEdgeEnd(from, to);  
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

export function calculateSelfLoopPath(edge: IGraphEdge): string {
    
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



export function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      resolve(fileContent);
    };
  
    reader.readAsText(file);
  });
}

export function downloadJSON(content: any, fileName: string = 'data') {
  const json = JSON.stringify(content, null, 2);
  
  const blob = new Blob([json], { type: 'application/json' });
  
  // download
  const link = document.createElement('a');
  link.download = `${fileName}.json`;
  link.href = window.URL.createObjectURL(blob);
  link.click();
  
  // Clean up
  window.URL.revokeObjectURL(link.href);
}