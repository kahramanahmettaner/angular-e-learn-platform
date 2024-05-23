import { Injectable } from '@angular/core';
import { IGraphNode } from '../models/GraphNode.interface';
import { IGraphEdge } from '../models/GraphEdge.interface';
import { IPosition } from '../models/Position.interface';
import { ISize } from '../models/Size.interface';
import { INewGraphEdge } from '../models/NewGraphEdge.interface';
import { IGraphConfiguration } from '../models/GraphConfiguration.interface';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  private graphConfiguration!: IGraphConfiguration;
  private nodes: IGraphNode[];
  private edges: IGraphEdge[];
  private idCounter: number;
  private newEdge: INewGraphEdge;


  constructor() { 
    this.nodes = [];
    this.edges = [];
    this.idCounter = 0;
    this.newEdge = { started: false, node1: null, node2: null, weight: 0 };
    
    // Configure graph with default graph values
    this.configureGraph({
      nodes: {
        weight: true,
        visited: true
      },
      edges: {
        directed: false,  
        weight: false,  
      }
    })
  }

  configureGraph(graphConfiguration: IGraphConfiguration) {
    this.graphConfiguration = graphConfiguration;
  }

  getGraphConfiguration() {
    return this.graphConfiguration;
  }

  addNode(newNodeAttributes: Partial<IGraphNode>): IGraphNode {

    // Destructure the attributes and assign default values if they are undefined
    let { 
      value = '',
      visited = null, 
      weight = null,
      position = { x: 0, y: 0},
      size = { width: 100, height: 100 },  // TODO:
    } = newNodeAttributes;

    // Adjust the properties according to the graphConfiguration
    if (this.graphConfiguration.nodes.weight) {
      weight = { enabled: true, value: weight?.value || 0 }
    } else {
      weight = { enabled: false, value: -1 }
    }
    
    if (this.graphConfiguration.nodes.visited) {
      visited = { enabled: true, value: visited?.value || false }
    } else {
      visited = { enabled: false, value: false }
    }

    // Generate new node
    const newNode: IGraphNode = {
      nodeId: this.idCounter,
      value: value,
      visited: visited,
      weight: weight,
      position: position,
      size: size,
      center: this.calculateCenter(position, size)
    }

    // TODO: Can different nodes have same value?

    // Add node to the list of nodes
    this.nodes.push(newNode);

    // Increment id counter for the next nodes
    this.idCounter += 1;

    // Return newNode, because it is required to addEdge 
    // TODO: Can this be done in a different way?
    return newNode;
  }

  addEdge(node1: IGraphNode, node2: IGraphNode, weightValue: number | null = null): void {

    // For directed graphs:
    // Check if an edge already exist which originates from the same node and points to the same node as the new edge
    // TODO: Is this allowed, or must it be prevented?
    this.edges.forEach(existingEdge => {
      if (existingEdge.node1 === node1 && existingEdge.node2 === node2) {
        throw new Error('These two nodes already are connected with an edge in the same direction.')
      }
    });
    
    // For undirected graphs:
    // TODO: Check if an edge already exist which originates from the same node and points to the same node as the new edge
    // TODO: Is this allowed, or must it be prevented?


    // Adjust the properties according to the graphConfiguration  
    let weight: { enabled: boolean, value: number };
    if (this.graphConfiguration.edges.weight) {
      weight = { enabled: true, value: weightValue || 0 };
    } else {
      weight = { enabled: false, value: -1 };
    }

    // Generate new edge
    const newEdge: IGraphEdge = {
      node1, node2, weight, directed: this.graphConfiguration.edges.directed
    }

    // Add edge to the list of edges
    this.edges.push(newEdge);
  }

  getNodes(): IGraphNode[] {
    return this.nodes;
  }

  getEdges(): IGraphEdge[] {
    return this.edges;
  }

  removeNode(node: IGraphNode): void {

    // Check if the node is in the list of nodes, and
    // Find the index of the node if it is in the list
    const indexOfNode = this.nodes.indexOf(node);
    if (indexOfNode === -1) {
      throw new Error('Node not found.');
    }

    // Store the index for the edges which contain node that will be removed
    const indexOfEdgesContainingNode = [];

    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i].node1 === node || this.edges[i].node2 === node) {
        indexOfEdgesContainingNode.push(i);
      }
    }

    // Sort the array in descending order so that the first removed edges do not effect the index of the next ones when removing 
    indexOfEdgesContainingNode.sort((a, b) => b - a);

    // Remove the edges from the list of edges
    indexOfEdgesContainingNode.forEach(i => {
      this.edges.splice(i, 1)
    });

    // Remove the node from the list of nodes
    this.nodes.splice(indexOfNode, 1);
  }

  removeEdge(edge: IGraphEdge): void {
    
    // Check if the edge is in the list of edges, and
    // Find the index of the edge if it is in the list
    const indexOfEdge = this.edges.indexOf(edge);
    if (indexOfEdge === -1) {
      throw new Error('Edge not found');
    }

    // Remove the edge from the list of edges
    this.edges.splice(indexOfEdge, 1);
  }

  changeEdgeDirection(edge: IGraphEdge) {

    // Check if the edges are directed according to graphConfiguration 
    if (!this.graphConfiguration.edges.directed) {
      throw new Error('The edge is not directed.')
    }

    // Check if there is already an edge which starts at edge.node2 and ends at edge.node1
    this.edges.forEach(existingEdge => {
      if (existingEdge.node1 === edge.node2 && existingEdge.node2 === edge.node1) {
        throw new Error('There is already an edge which connects these nodes in the opposite direction.');
      }
    });
    
    // Get the nodes from the edge
    const newNode2 = edge.node1;
    const newNode1 = edge.node2;
    
    // Swap the nodes
    edge.node2 = newNode2;
    edge.node1 = newNode1;
  }

  updateNewEdge( newValues: Partial<INewGraphEdge> ) {
    const { started = null, node1 = null, node2 = null, weight = null } = newValues;
    if (started !== null) { this.newEdge.started = started; }
    if (node1 !== null) { this.newEdge.node1 = node1; }
    if (node2 !== null) { this.newEdge.node2 = node2; }
    if (weight !== null) { this.newEdge.weight = weight; }
  }

  getNewEdge() {
    return this.newEdge;
  }

  resetNewEdge() {
    this.newEdge.started = false;
    this.newEdge.node1 = null;
    this.newEdge.node2 = null;
    this.newEdge.weight = 0;
  }

  // #############
  // Utility functions
  calculateCenter(position: IPosition, size: ISize): IPosition {
    const center: IPosition = {
      x: position.x + (size.width / 2),
      y: position.y + (size.height / 2)
    };
    return center;
  }

}
