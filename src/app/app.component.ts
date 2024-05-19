import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { BinarySearchTreeService } from './services/binary-search-tree.service';
import { INode } from './models/Node.interface';
import { IPosition } from './models/Position.interface';
import { ISize } from './models/Size.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeState } from './models/TreeState.enum';
import { NodeBinarySearchTreeComponent } from './node-binary-search-tree/node-binary-search-tree.component';
import { INewLink } from './models/NewLink.interface';
import { ChildRole } from './models/ChildRole.enum';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DragDropModule, CdkDrag, CommonModule, FormsModule, NodeBinarySearchTreeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'angular-e-learn-platform';

  // #############################
  // References for HTML Elements
  @ViewChild('workSpace') workSpace!: ElementRef;
  @ViewChildren('tool') toolElements!: QueryList<ElementRef>;
  @ViewChild('toolbar') toolbar!: ElementRef;
  @ViewChildren(NodeBinarySearchTreeComponent) nodeComponents!: QueryList<NodeBinarySearchTreeComponent>;


  // #############################
  // Class properties
  newLink: INewLink = this.bstService.getNewLink();


  // #############################
  // Constructor
  constructor( private bstService: BinarySearchTreeService) { 

  }


  // #############################
  // Lifecycle hook methods

  ngOnInit(): void {
    // #############################
    // Set up event listeners
    window.addEventListener('keydown', this.onKeyDown);
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
  

  // #############################
  // Functions for interactions with UI

  // TODO: is this function really required?
  // helps to do specific operations whenever adding new node
  addNewNode(position: IPosition, size: ISize) {
    
    //this.bstService.addNode({ position, size });

    //####this.nodeComponents.last.nodeValueInput.nativeElement.focus();

    // focus on the new node to add a value

    // TODO: you can activate it on ngOnInit 
    // TODO: but how to deactivate the other ones?
    
    //####this.nodeComponents.last.editNodeValue = true;
    
    // TODO: find a better way
    // to be sure that the ui initialized
    setTimeout(() => {
      //####this.nodeComponents.last.nodeValueInput.nativeElement.focus();
      //this.nodeValueInputs.last.nativeElement.focus();
    }, 0);
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

  onWorkSpaceClick(event: MouseEvent) {
    // TODO: implement onWorkspaceClick listener 
  }
  
  dragPosition = { x: 50, y:60 };
  difference = { x: 0, y: 0 };
  workSpaceRect = { startX: 0, startY: 0, endX: 0, endY: 0, width: 0, height: 0 };
  toolbarRect = { startX: 0, startY: 0, endX: 0, endY: 0, width: 0, height: 0 };
  // TODO: Find a proper way to listen to UI change to update workSpaceRect etc. 
  
  ngAfterViewInit() {
    // TODO: implement to initialize UI etc.
  }

  mouseX: number = 0;
  mouseY: number = 0;

  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  toolbarElements: string[] = ["Toolbar1"]
  workspaceElements: INode[] = this.bstService.getNodesAsList();

  onToolbarDragStart(event: CdkDragStart) {
    const toolbarRect = this.toolbar.nativeElement.getBoundingClientRect();
    const workspaceRect = this.workSpace.nativeElement.getBoundingClientRect();
    const offsetX = toolbarRect.left - workspaceRect.left;
    const offsetY = toolbarRect.top - workspaceRect.top;
  }
  
  toolOnDragStart(event: CdkDragStart) {
    //console.log('drag start...');
    //console.log(event.source.element);
    
    // TODO: where to do this?
    this.calculateUI()
  } 

  toolOnDragMove(event: CdkDragMove) {
    //console.log('drag move...');
    //console.log($event);
    
    this.dragPosition.x = event.source.getFreeDragPosition().x;
    this.dragPosition.y = event.source.getFreeDragPosition().y;
  }

  toolOnDragEnd(event: CdkDragEnd) {
    //console.log('drag end...');
    //console.log($event);
    //console.log(event.source.getFreeDragPosition())
    
    this.calculateUI()

    // TODO: how to set size dynamically?
    const newNodeSize: ISize = {
      width: 100,
      height: 100
      // width: event.source.element.nativeElement.clientWidth,
      // height: event.source.element.nativeElement.clientHeight
    }

    const newNodePosition: IPosition = {
      x: event.source.getFreeDragPosition().x,
      y: event.source.getFreeDragPosition().y
    }

    if (newNodePosition.x < this.workSpaceRect.startX) { 
      newNodePosition.x = this.workSpaceRect.startX + this.difference.x
    } else if (newNodePosition.x + newNodeSize.width > this.workSpaceRect.endX) { 
      newNodePosition.x = this.workSpaceRect.endX - newNodeSize.width + this.difference.x
    } else {
      newNodePosition.x += this.difference.x
    }
    if (newNodePosition.y < this.workSpaceRect.startY) { 
      newNodePosition.y = this.workSpaceRect.startY + this.difference.y
    } else if (newNodePosition.y + newNodeSize.height > this.workSpaceRect.endY) { 
      newNodePosition.y = this.workSpaceRect.endY - newNodeSize.height + this.difference.y
    } else {
      newNodePosition.y += this.difference.y
    }
        
    // TODO: for instance, only adding nodes to the tree if there is links between nodes
    // but this causes that the very first element can not being added in tree
    //this.bstService.addNode(newNodePosition, newNodeSize)
    event.source.reset()

    this.bstService.addNode({ position: newNodePosition, size: newNodeSize }, ChildRole.NO_PARENT)
  }

  calculateUI() {
    if (this.workSpace && this.toolbar) {
      const { x: wX, y: wY, width: wWidth, height: wHeight } = this.workSpace.nativeElement.getBoundingClientRect();
      this.workSpaceRect = { 
        startX: wX,
        startY: wY, 
        endX: wX + wWidth,
        endY: wY + wHeight,
        width: wWidth, 
        height: wHeight, 
      }

      const { x: tX, y: tY, width: tWidth, height: tHeight } = this.toolbar.nativeElement.getBoundingClientRect();
      this.toolbarRect = { 
        startX: tX,
        startY: tY, 
        endX: tX + tWidth,
        endY: tY + tHeight,
        width: tWidth, 
        height: tHeight, 
      }

      // Calculate the differences
      const xDifference = this.toolbarRect.startX - this.workSpaceRect.startX;
      const yDifference = this.toolbarRect.startY - this.workSpaceRect.startY;

      this.difference = { x: xDifference, y: yDifference };
    }
  }


}
