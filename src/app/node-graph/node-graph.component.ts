import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IPosition } from '../models/Position.interface';
import { IGraphNode } from '../models/GraphNode.interface';
import { GraphService } from '../services/graph.service';
import { INewGraphEdge } from '../models/NewGraphEdge.interface';
import { IGraphEdge } from '../models/GraphEdge.interface';
import { IGraphConfiguration } from '../models/GraphConfiguration.interface';

@Component({
  selector: 'app-node-graph',
  standalone: true,
  imports: [CdkDrag, FormsModule, CommonModule],
  templateUrl: './node-graph.component.html',
  styleUrl: './node-graph.component.css'
})
export class NodeGraphComponent implements OnInit {

  // #############################
  // References for HTML Elements
  @ViewChild('nodeValueInput') nodeValueInput!: ElementRef<HTMLInputElement>;


  // #############################
  // Inputs from parent component
  @Input() node!: IGraphNode;
  @Input() index!: number;
  

  // #############################
  // Class properties
  nodeZIndex: number;
  displayNodeToolset: boolean;
  editNodeValue: boolean;

  newEdge!: INewGraphEdge;
  graphConfiguration!: IGraphConfiguration;
  
  // #############################
  // Constructor
  constructor(private graphService: GraphService) {
    // Initalize properties
    this.nodeZIndex = 1;
    this.displayNodeToolset = false;
    this.editNodeValue = false;
  }


  // #############################
  // Lifecycle hook methods
  ngOnInit(): void {
  
    // Activate the input field for the node
    this.onEditNodeValueClick();

    // Initialize properties
    this.newEdge = this.graphService.getNewEdge();
    this.graphConfiguration = this.graphService.getGraphConfiguration();
  }


  // #############################
  // Functions for interactions with node
  onFieldHover(event: any) {
  
    // Activate the toolset for the node and adjust z index
    this.displayNodeToolset = true;
    this.nodeZIndex = 10;
  }

  onFieldLeave(event: any) {

    // Deactivate the toolset for the node and adjust z index
    this.displayNodeToolset = false;
    this.nodeZIndex = 1;
  }

  onClick(event: MouseEvent) {
    
  }

  // Drag start
  nodeOnDragStart(event: CdkDragStart) {
    
  }

  // Drag end
  nodeOnDragEnd(event: CdkDragEnd) {
    
  }  

  // Drag move
  nodeOnDragMove(event: CdkDragMove) {
    // Update node data (position, center)
    this.node.position.x = event.source.getFreeDragPosition().x;
    this.node.position.y = event.source.getFreeDragPosition().y;
    this.node.center = this.graphService.calculateCenter(this.node.position, this.node.size);
  }


  // #############################
  // Functions for interactions with node toolset
  onNewNodeClick(event:any, isIncoming: boolean | null = null) {
    if (this.graphConfiguration.edges.directed && isIncoming === null) {
      throw new Error('The edges must be undirected')
    }
    
    // TODO: Size is not being configured here, instead the default value in the service (100, 100) is being used


    let position: IPosition = {
      x: this.node.position.x + 130,
      y: this.node.position.y + 130,
    }

    // Add the node
    const newNode = this.graphService.addNode({ position });

    // Add the edge between this node and new generated
    if (isIncoming) {
      // from newNode to this.node
      this.graphService.addEdge(newNode, this.node)
    } else {
      // from this.node to newNode
      this.graphService.addEdge(this.node, newNode)
    }
  }

  onConnectNodeDirectedClick(event: MouseEvent, isIncoming: boolean) {

    // First node selection
    if (this.newEdge.started === false) {
      this.graphService.updateNewEdge({ started: true });

      // Incoming edge - ends at current node
      if (isIncoming) { 
        this.graphService.updateNewEdge({ node2: this.node });
      }

      // Outgoing edge - originates from current node
      else {
        // Check if the child role is provided
        this.graphService.updateNewEdge({ node1: this.node });
      }
    }

    // Second node selection
    else {
        // TODO: Can an edge points to two nodes at the same time or should be another edge created for this?
        // Check if the edge already points to another node
        if (isIncoming && this.newEdge.node2 !== null) { 
          throw new Error('The Edge already points to another node.'); 
        }

        // Check if the edge already originates from another node
        if (!isIncoming && this.newEdge.node1 !== null) { 
          throw new Error('The Edge already originates from another node.'); 
        }

        // Incoming edge - ends at current node
        if (isIncoming) { 
          this.graphService.updateNewEdge({ node2: this.node });
        }
  
        // Outgoing edge - originates from current node
        else {
          // Check if the child role is provided
          this.graphService.updateNewEdge({ node1: this.node });
        }

        // Add new edge
        try {
          if ( this.newEdge.node1 !== null && this.newEdge.node2 !== null) {
            this.graphService.addEdge(
              this.newEdge.node1, 
              this.newEdge.node2, 
              this.newEdge.weight
            );
          }
        } catch(err) { console.error(err) }
        
        // Reset new link for future use
        this.graphService.resetNewEdge();
      }
  }

  onConnectNodeUndirectedClick(event: MouseEvent) {

    // First node selection
    if (this.newEdge.started === false) {
      this.graphService.updateNewEdge({ started: true, node1: this.node });
    }
    // Second node selection
    else {
      
      this.graphService.updateNewEdge({ node2: this.node });
      
      // Add new edge
      try {
        if ( this.newEdge.node1 !== null && this.newEdge.node2 !== null) {
          this.graphService.addEdge(
            this.newEdge.node1, 
            this.newEdge.node2, 
            this.newEdge.weight
          );
        }
      } catch(err) { console.error(err) }
      
      // Reset new link for future use
      this.graphService.resetNewEdge();
    } 
  }

  onDeleteNodeClick(event:any) {
    this.graphService.removeNode(this.node);
  }
  
  onEditNodeValueClick() {
    this.editNodeValue = true;

    // Ensure that the input element is mounted 
    setTimeout(() => {
      this.nodeValueInput.nativeElement.focus();
    }, 0);
  }
}
