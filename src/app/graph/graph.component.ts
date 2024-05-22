import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IPosition } from '../models/Position.interface';
import { IRectangle } from '../models/Rectangle.interface';
import { GraphService } from '../services/graph.service';
import { ISize } from '../models/Size.interface';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { NodeGraphComponent } from '../node-graph/node-graph.component';
import { IGraphNode } from '../models/GraphNode.interface';
import { EdgeGraphComponent } from '../edge-graph/edge-graph.component';
import { IGraphEdge } from '../models/GraphEdge.interface';
import { INewGraphEdge } from '../models/NewGraphEdge.interface';
import { EdgeToolsetGraphComponent } from '../edge-toolset-graph/edge-toolset-graph.component';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [DragDropModule, CdkDrag, NodeGraphComponent, EdgeGraphComponent, EdgeToolsetGraphComponent],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent  implements OnInit, AfterViewInit {

  // #############################
  // References for HTML Elements
  @ViewChild('workspace') workspace!: ElementRef;
  @ViewChildren('tool') toolElements!: QueryList<ElementRef>;
  @ViewChild('toolbar') toolbar!: ElementRef;
  @ViewChildren(NodeGraphComponent) nodeComponents!: QueryList<NodeGraphComponent>;

  // #############################
  // Class properties
  dragPosition: IPosition;
  difference: IPosition;
  workspaceRect: IRectangle;
  toolbarRect: IRectangle;
  // TODO: Find a proper way to listen to UI change to update workSpaceRect etc. 

  mouseX: number;
  mouseY: number;

  toolbarElements!: string[];
  nodes!: IGraphNode[];
  edges!: IGraphEdge[];
  newEdge!: INewGraphEdge;
  
  
  // #############################
  // Constructor
  constructor( private graphService: GraphService) { 
    
    // #############################
    // Initialize Properties
    this.dragPosition = { x: 0, y:0 };
    this.difference =  { x: 0, y: 0 };
    this.workspaceRect = { 
      topLeft: { x: 0, y: 0},  
      bottomRight: { x: 0, y: 0},
      size: { width: 0, height: 0 }
    }
    this.toolbarRect = { 
      topLeft: { x: 0, y: 0},  
      bottomRight: { x: 0, y: 0},
      size: { width: 0, height: 0 }
    }

    this.mouseX = 0;
    this.mouseY = 0;
  }


  // #############################
  // Lifecycle hook methods

  ngOnInit(): void {

    // #############################
    // Initialize properties
    this.toolbarElements = ["Toolbar1"];  // TODO:
  
    this.nodes = this.graphService.getNodes();
    this.edges = this.graphService.getEdges();
    this.newEdge = this.graphService.getNewEdge();
    
    // TODO:
    // Calculate the differences
    const xDifference = this.toolbarRect.topLeft.x - this.workspaceRect.topLeft.x;
    const yDifference = this.toolbarRect.topLeft.y - this.workspaceRect.topLeft.y;

    this.difference = { x: xDifference, y: yDifference };
  }

  ngAfterViewInit() {
    this.calculateUI();
  }


  // #############################
  // Functions for children events
  removeEdge(index: number) {
    const edgeToDelete = this.edges[index];
    this.graphService.removeEdge(edgeToDelete);
  }

  changeEdgeDirection(index: number) {
    const edgeToUpdate = this.edges[index];
    this.graphService.changeEdgeDirection(edgeToUpdate);
  }


  // #############################
  // Functions for interactions with UI

  notImplemented() {
    alert('Noch nicht implementiert')
  }


  // #############################
  // Functions for interactions with toolbar
  
  // Drag start
  toolOnDragStart(event: CdkDragStart) {
    // TODO: where to do this?
    this.calculateUI()
  } 

  // Drag move
  toolOnDragMove(event: CdkDragMove) {

    // Update dragPosition
    this.dragPosition.x = event.source.getFreeDragPosition().x;
    this.dragPosition.y = event.source.getFreeDragPosition().y;
  }

  // Drag end
  toolOnDragEnd(event: CdkDragEnd) {

    // TODO: 
    this.calculateUI()

    // TODO: how to set size dynamically?
    const newNodeSize: ISize = {
      width: 100,
      height: 100
      // width: event.source.element.nativeElement.clientWidth,
      // height: event.source.element.nativeElement.clientHeight
    }

    // Get the drag point to set the size of new node
    const newNodePosition: IPosition = {
      x: event.source.getFreeDragPosition().x,
      y: event.source.getFreeDragPosition().y
    }

    // Check if the position is inside the workspace and adjust it if it is not
    if (newNodePosition.x < this.workspaceRect.topLeft.x) { 
      newNodePosition.x = this.workspaceRect.topLeft.x + this.difference.x
    } else if (newNodePosition.x + newNodeSize.width > this.workspaceRect.bottomRight.x) { 
      newNodePosition.x = this.workspaceRect.bottomRight.x - newNodeSize.width + this.difference.x
    } else {
      newNodePosition.x += this.difference.x
    }
    if (newNodePosition.y < this.workspaceRect.topLeft.y) { 
      newNodePosition.y = this.workspaceRect.topLeft.y + this.difference.y
    } else if (newNodePosition.y + newNodeSize.height > this.workspaceRect.bottomRight.y) { 
      newNodePosition.y = this.workspaceRect.bottomRight.y - newNodeSize.height + this.difference.y
    } else {
      newNodePosition.y += this.difference.y
    }

    // Reset the Toolbar Element
    event.source.reset()

    // TODO: node is returned
    this.graphService.addNode({ position: newNodePosition, size: newNodeSize })
  }

  // #############################
  // Functions for interactions with workspace
  
  onWorkspaceClick(event: MouseEvent) {
    // TODO: implement onWorkspaceClick listener 
  }

  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }


  // #############################
  // Utility functions

  calculateUI() {
    // Check if the UI elements initialized
    if (this.workspace && this.toolbar) {

      // Calculate Workspace rectangle
      const { x: wX, y: wY, width: wWidth, height: wHeight } = this.workspace.nativeElement.getBoundingClientRect();
      this.workspaceRect = { 
        topLeft: { x: wX, y: wY },
        bottomRight: { x: wX + wWidth, y: wY + wHeight },
        size: { width: wWidth, height: wHeight }
      }

      // Calculate Toolbar rectangle
      const { x: tX, y: tY, width: tWidth, height: tHeight } = this.toolbar.nativeElement.getBoundingClientRect();
      this.toolbarRect = { 
        topLeft: { x: tX, y: tY },
        bottomRight: { x: tX + tWidth, y: tY + tHeight },
        size: { width: tWidth, height: tHeight }
      }

      // Calculate the differences
      const xDifference = this.toolbarRect.topLeft.x - this.workspaceRect.topLeft.x;
      const yDifference = this.toolbarRect.topLeft.y - this.workspaceRect.topLeft.y;

      // Update the difference property
      this.difference = { x: xDifference, y: yDifference };
    }
  }

}
