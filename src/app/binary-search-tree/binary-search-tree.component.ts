import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { BinarySearchTreeService } from '../services/binary-search-tree.service';
import { INode } from '../models/Node.interface';
import { IPosition } from '../models/Position.interface';
import { ISize } from '../models/Size.interface';
import { IRectangle } from '../models/Rectangle.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeState } from '../models/TreeState.enum';
import { NodeBinarySearchTreeComponent } from '../node-binary-search-tree/node-binary-search-tree.component';
import { INewLink } from '../models/NewLink.interface';
import { ChildRole } from '../models/ChildRole.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-binary-search-tree',
  standalone: true,
  imports: [DragDropModule, CdkDrag, CommonModule, FormsModule, NodeBinarySearchTreeComponent],
  templateUrl: './binary-search-tree.component.html',
  styleUrl: './binary-search-tree.component.css'
})
export class BinarySearchTreeComponent implements OnInit, OnDestroy, AfterViewInit {

  
  // #############################
  // References for HTML Elements
  @ViewChild('workspace') workspace!: ElementRef;
  @ViewChildren('tool') toolElements!: QueryList<ElementRef>;
  @ViewChild('toolbar') toolbar!: ElementRef;
  @ViewChildren(NodeBinarySearchTreeComponent) nodeComponents!: QueryList<NodeBinarySearchTreeComponent>;


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
  nodes!: INode[];
  newLink!: INewLink;


  // #############################
  // Constructor
  constructor( 
    private bstService: BinarySearchTreeService,
    private router: Router
  ) { 
    
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
    this.nodes = this.bstService.getNodesAsList();
    this.newLink = this.bstService.getNewLink();

    // #############################
    // Set up event listeners
    window.addEventListener('keydown', this.onKeyDown);

    // Calculate the differences
    const xDifference = this.toolbarRect.topLeft.x - this.workspaceRect.topLeft.x;
    const yDifference = this.toolbarRect.topLeft.y - this.workspaceRect.topLeft.y;

    this.difference = { x: xDifference, y: yDifference };
  }

  ngAfterViewInit() {
    this.calculateUI();
  }

  ngOnDestroy() {
    // #############################
    // Remove event listeners
    window.removeEventListener('keydown', this.onKeyDown);
  }


  // #############################
  // Callback functions for event listeners
  private onKeyDown = (event: KeyboardEvent) => {
    // to cancel new link between nodes
    if (event.key === 'Escape') {
      if (this.newLink.started) { this.bstService.resetNewLink(); } 
    }
  }

  onJSONToConsoleClick() {
    if (this.bstService.isTreeValid() === TreeState.VALID) {
      console.log('JSON Output for the tree:', this.bstService.getTreeStructure())
      alert('Die Ausgabe ist in der Konsole')
    } else if (this.bstService.isTreeValid() === TreeState.INVALID) {
      alert("Die Aktion kann nicht durchgeführt werden, da die Baumstruktur ungültig ist.\nMöglicherweise gibt es Knoten, die ausgehend vom Wurzeknoten nicht erreichbar sind.")
    } else {
      alert("Die Aktion kann nicht durchgeführt werden, da die Baumstruktur ungültig ist.\nEntweder existiert kein Wurzelknoten oder es gibt keine Knoten die miteinander verbunden sind.")
    }
  }

  onDownloadAsJSONClick() {
    if (this.bstService.isTreeValid() === TreeState.VALID) {
      this.bstService.downloadTreeAsJSON()
    } else if (this.bstService.isTreeValid() === TreeState.INVALID) {
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

    // Add new node
    this.bstService.addNode({ position: newNodePosition, size: newNodeSize }, ChildRole.NO_PARENT)
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

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }
}
