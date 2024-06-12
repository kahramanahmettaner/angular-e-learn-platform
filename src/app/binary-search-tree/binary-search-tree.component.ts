import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { BinarySearchTreeService } from '../services/binary-search-tree.service';
import { IBstNode } from '../models/BstNode.interface';
import { IPosition } from '../models/Position.interface';
import { ISize } from '../models/Size.interface';
import { IRectangle } from '../models/Rectangle.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BstState } from '../models/BstState.enum';
import { NodeBinarySearchTreeComponent } from '../node-binary-search-tree/node-binary-search-tree.component';
import { IBstNewEdge } from '../models/BstNewEdge.interface';
import { BstChildRole } from '../models/BstChildRole.enum';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IBstNodeJSON } from '../models/BstNodeJSON.interface';
import { calculateArrowPoints, calculateEdgeStart, calculateEdgeEnd } from '../utils';

@Component({
  selector: 'app-binary-search-tree',
  standalone: true,
  imports: [DragDropModule, CdkDrag, CommonModule, FormsModule, NodeBinarySearchTreeComponent],
  templateUrl: './binary-search-tree.component.html',
  styleUrl: './binary-search-tree.component.css'
})
export class BinarySearchTreeComponent implements OnInit, OnDestroy, AfterViewInit {

  // #############################
  // Expose the enums to the template
  public calculateArrowPoints = calculateArrowPoints;
  public calculateEdgeStart = calculateEdgeStart;
  public calculateEdgeEnd = calculateEdgeEnd;

  // #############################
  // References for HTML Elements
  @ViewChild('workspace') workspace!: ElementRef;
  @ViewChildren('tool') toolElements!: QueryList<ElementRef>;
  @ViewChild('toolbar') toolbar!: ElementRef;
  @ViewChildren(NodeBinarySearchTreeComponent) nodeComponents!: QueryList<NodeBinarySearchTreeComponent>;


  // #############################
  // Class properties
  dragPosition: IPosition;
  wsRelativeToTb: IPosition;
  workspaceRect: IRectangle;
  toolbarRect: IRectangle;
  // TODO: Find a proper way to listen to UI change to update workSpaceRect etc. 

  mouseX: number;
  mouseY: number;

  toolbarElements!: string[];
 
  private nodesSubscription!: Subscription;
  private newEdgeSubscription!: Subscription;
  
  nodes!: IBstNode[];
  newEdge!: IBstNewEdge;

  // #############################
  // Constructor
  constructor( 
    private bstService: BinarySearchTreeService,
    private router: Router
  ) { 
    
    // #############################
    // Initialize Properties
    this.dragPosition = { x: 0, y:0 };
    this.wsRelativeToTb =  { x: 0, y: 0 };
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

    
    // #############################
    // Subscribe to Observables from the bstService
    this.nodesSubscription = this.bstService.getNodes().subscribe( nodes => {
      this.nodes = nodes;
    });

    this.newEdgeSubscription = this.bstService.getNewEdge().subscribe( newEdge => {
      this.newEdge = newEdge;
    });
    
    this.calculateUI();

    // #############################
    // Set up event listeners
    window.addEventListener('keydown', this.onKeyDown);
  }

  ngAfterViewInit() {
    this.calculateUI();
  }

  ngOnDestroy() {
    // #############################
    // Remove event listeners
    window.removeEventListener('keydown', this.onKeyDown);

    // #############################
    // Unsubscribe from all subscriptions to prevent memory leaks
    if (this.nodesSubscription) {
      this.nodesSubscription.unsubscribe();
    }
    if (this.newEdgeSubscription) {
      this.newEdgeSubscription.unsubscribe();
    }
  }


  // #############################
  // Callback functions for event listeners
  private onKeyDown = (event: KeyboardEvent) => {
    // to cancel new link between nodes
    if (event.key === 'Escape') {
      if (this.newEdge.started) { this.bstService.resetNewEdge(); } 
    }
  }

  onJSONToConsoleClick() {
    if (this.bstService.isTreeValid() === BstState.VALID) {
      const tree_structure: IBstNodeJSON | null = this.bstService.getTreeStructure();
      if (tree_structure) {
        console.log('JSON Output for the tree:', tree_structure);
      }
      else {
        console.log('No nodes connected to each other to present a tree structure!');
      }
      alert('Die Ausgabe ist in der Konsole');
    } else if (this.bstService.isTreeValid() === BstState.INVALID) {
      alert("Die Aktion kann nicht durchgeführt werden, da die Baumstruktur ungültig ist.\nMöglicherweise gibt es Knoten, die ausgehend vom Wurzeknoten nicht erreichbar sind.")
    } else {
      alert("Die Aktion kann nicht durchgeführt werden, da die Baumstruktur ungültig ist.\nEntweder existiert kein Wurzelknoten oder es gibt keine Knoten die miteinander verbunden sind.")
    }
  }

  onDownloadAsJSONClick() {
    if (this.bstService.isTreeValid() === BstState.VALID) {
      this.bstService.downloadTreeAsJSON()
    } else if (this.bstService.isTreeValid() === BstState.INVALID) {
      alert("Die Aktion kann nicht durchgeführt werden, da die Baumstruktur ungültig ist.\nMöglicherweise gibt es Knoten, die ausgehend vom Wurzeknoten nicht erreichbar sind.")
    } else {
      alert("Die Aktion kann nicht durchgeführt werden, da die Baumstruktur ungültig ist.\nEntweder existiert kein Wurzelknoten oder es gibt keine Knoten die miteinander verbunden sind.")
    }
  }

  onJSONFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.readFile(file);
    }
  }

  private readFile(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      this.bstService.createTreeFromJSON(fileContent);
    };

    reader.readAsText(file);
  }

  // TODO: for the functioanlities which are not implemented
  notImplemented(text: string){
    alert(text)
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
    this.dragPosition.x = event.source.getFreeDragPosition().x + event.source.element.nativeElement.offsetLeft - this.wsRelativeToTb.x;
    this.dragPosition.y = event.source.getFreeDragPosition().y + event.source.element.nativeElement.offsetTop - this.wsRelativeToTb.y;
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
      x: event.source.getFreeDragPosition().x + event.source.element.nativeElement.offsetLeft - this.wsRelativeToTb.x,
      y: event.source.getFreeDragPosition().y + + event.source.element.nativeElement.offsetTop - this.wsRelativeToTb.y
    }

    // Check if the position is inside the workspace and adjust it if it is not
    if (newNodePosition.x < 0) { 
      newNodePosition.x = 0
    } else if (newNodePosition.x + newNodeSize.width > this.workspaceRect.size.width) { 
      newNodePosition.x = this.workspaceRect.size.width - newNodeSize.width
    }

    if (newNodePosition.y < 0) { 
      newNodePosition.y = 0
    } else if (newNodePosition.y + newNodeSize.height > this.workspaceRect.size.height) { 
      newNodePosition.y = this.workspaceRect.size.height - newNodeSize.height
    }

    // Reset the Toolbar Element
    event.source.reset()

    // Add new node
    this.bstService.addNode({ position: newNodePosition, size: newNodeSize }, BstChildRole.NO_PARENT)
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
      const xDifference = this.workspaceRect.topLeft.x - this.toolbarRect.topLeft.x;
      const yDifference = this.workspaceRect.topLeft.y - this.toolbarRect.topLeft.y;

      // Update the difference property
      this.wsRelativeToTb = { x: xDifference, y: yDifference };
    }
  }

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }

  // #############################
  // Utility functions
  
}

