import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { BinarySearchTreeService } from './services/binary-search-tree.service';
import { INode } from './models/Node.interface';
import { IPosition } from './models/Position.interface';
import { ISize } from './models/Size.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DragDropModule, CdkDrag, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  title = 'angular-e-learn-platform';
  
  @ViewChild('workSpace') workSpace!: ElementRef;
  @ViewChildren('nodeElements') nodeElements!: QueryList<ElementRef>;
  @ViewChildren('tool') toolElements!: QueryList<ElementRef>;
  @ViewChild('toolbar') toolbar!: ElementRef;
  @ViewChildren('nodeValueInput') nodeValueInputs! : QueryList<ElementRef>;

  onEditNodeValueClick(index: number) {
    this.editNodeValue = index
    setTimeout(() => {
      this.nodeValueInputs.get(index)?.nativeElement.focus()
    }, 0);
  }

  // helps to do specific operations whenever adding new node
  addNewNode(position: IPosition, size: ISize) {
    this.bstService.addNode(position, size)

    // focus on the new node to add a value
    this.editNodeValue = this.workspaceElements.length - 1
    
    // TODO: find a better way
    // to be sure that the ui initialized
    setTimeout(() => {
      this.nodeValueInputs.last.nativeElement.focus();
    }, 0);
  }

  onJSONToConsoleClick() {
    console.log('JSON Output for the tree:', this.bstService.getTreeStructure())
    alert('Die Ausgabe ist in der Konsole')
  }

  onDownloadAsJSONClick() {
      this.bstService.downloadTreeAsJSON()
  }

  // TODO: for the functioanlities which are not implemented
  notImplemented(text: string){
    alert(text)
  }


  newLink:{
    started: boolean;
    parent: INode | null;
    child: INode | null;
    isLeftChild: boolean;
  } = {
    started: false,
    parent: null,
    child: null,
    isLeftChild: true
  }

  // TODO: link Delete functions -> implement the logic in service
  onParentLinkDeleteClick(event: MouseEvent, node: INode) {
    if ( node.parent !== null ) {
      if (node.parent.leftChild === node) { node.parent.leftChild = null }
      else if (node.parent.rightChild === node) { node.parent.rightChild = null }
    }
    node.parent = null
  }

  
  onLeftChildLinkDeleteClick(event: MouseEvent, node: INode) {
    if (node.leftChild) { node.leftChild.parent = null }
    node.leftChild = null
  }

  
  onRightChildLinkDeleteClick(event: MouseEvent, node: INode) {
    if (node.rightChild) { node.rightChild.parent = null }
    node.rightChild = null
  }

  onParentLinkClick(event: MouseEvent, node: INode) {
    if (this.newLink.started === false) {
      this.newLink.started = true;
      this.newLink.child = node;
    } else {
      // TODO: do not throw an error but do something else
      if (this.newLink.child !== null) { throw new Error('Child is already choosed') }
      this.newLink.child = node;

      this.bstService.insertToTree(this.newLink.parent, this.newLink.child, this.newLink.isLeftChild)

      // reset new link
      this.newLink = {
        started: false,
        parent: null,
        child: null,
        isLeftChild: true
      }
    }
  }

  onLeftChildLinkClick(event: MouseEvent, node: INode) {
    if (this.newLink.started === false) {
      this.newLink.started = true;
      this.newLink.parent = node;
      this.newLink.isLeftChild = true;
    } else {

      // TODO: do not throw an error but do something else
      if (this.newLink.parent !== null) { throw new Error('Parent is already choosed') }
      this.newLink.parent = node;

      this.bstService.insertToTree(this.newLink.parent, this.newLink.child, true)

      // reset new link
      this.newLink = {
        started: false,
        parent: null,
        child: null,
        isLeftChild: true
      }

    }
  }

  onRightChildLinkClick(event: MouseEvent, node: INode) {
    if (this.newLink.started === false) {
      this.newLink.started = true;
      this.newLink.parent = node;
      this.newLink.isLeftChild = false;
    } else {
        // TODO: do not throw an error but do something else
        if (this.newLink.parent !== null) { throw new Error('Parent is already choosed') }
        this.newLink.parent = node;
  
        this.bstService.insertToTree(this.newLink.parent, this.newLink.child, false)
  
        // reset new link
        this.newLink = {
          started: false,
          parent: null,
          child: null,
          isLeftChild: true
        }
    }

  }

  onRightChildNewClick(event:any, node:INode) {
    const pos:IPosition = {
      x: node.position.x +130,
      y: node.position.y +130,
    }
    const size:ISize = {
      width: node.size.width,
      height: node.size.height,
    }
    this.addNewNode(pos, size)
    this.bstService.insertToTree(node, this.workspaceElements[this.workspaceElements.length - 1], false)
  }

  onLeftChildNewClick(event:any, node:INode) {
    const pos:IPosition = {
      x: node.position.x -130,
      y: node.position.y + 130,
    }
    const size:ISize = {
      width: node.size.width,
      height: node.size.height,
    }
    this.addNewNode(pos, size)
    this.bstService.insertToTree(node, this.workspaceElements[this.workspaceElements.length - 1], true)
  }

  onParentNewClick(event:any, node:INode, isLeftChild: boolean) {

    let pos:IPosition = {
      x: node.position.x + 130,
      y: node.position.y -130,
    }
    if (!isLeftChild ) {
      pos = {
        x: node.position.x - 130,
        y: node.position.y -130,
      }
    }

    const size:ISize = {
      width: node.size.width,
      height: node.size.height,
    }
    this.addNewNode(pos, size)
    this.bstService.insertToTree(this.workspaceElements[this.workspaceElements.length - 1], node, isLeftChild)
  }

  onDeleteNodeClick(event:any, node:INode) {
    this.bstService.deleteNode(node)
  }

  onWorkSpaceClick(event: MouseEvent) {
    // TODO: implement onWorkspaceClick listener 
  }
  


  dragPosition = { x: 50, y:60 };
  difference = { x: 0, y: 0 };
  workSpaceRect = { startX: 0, startY: 0, endX: 0, endY: 0, width: 0, height: 0 };
  toolbarRect = { startX: 0, startY: 0, endX: 0, endY: 0, width: 0, height: 0 };
  // TODO: Find a proper way to listen to UI change to update workSpaceRect etc. 

  constructor( private bstService: BinarySearchTreeService) { 
    window.addEventListener('keydown', (event) => {
      this.onKeyDown(event);
    });
  }

  // to cancel new link between nodes
  onKeyDown(event: KeyboardEvent) {

    if (event.key === 'Escape') {

      if (this.newLink.started) {
        this.newLink = {
          started: false,
          parent: null,
          child: null,
          isLeftChild: true
        }
      } 
    }
  }
  
  ngAfterViewInit() {
    // TODO: implement to initialize UI etc.
  }

  mouseX: number = 0;
  mouseY: number = 0;

  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  active = -1;
  editNodeValue = -1;
  onFieldHover(event: any, index: number) {
    this.active = index;
  }

  onFieldLeave(event: any) {
    this.active = -1;
  }

  toolbarElements: string[] = ["Toolbar1"]
  workspaceElements: INode[] = this.bstService.getNodesAsList();

  onToolbarDragStart(event: CdkDragStart) {
    const toolbarRect = this.toolbar.nativeElement.getBoundingClientRect();
    const workspaceRect = this.workSpace.nativeElement.getBoundingClientRect();
    const offsetX = toolbarRect.left - workspaceRect.left;
    const offsetY = toolbarRect.top - workspaceRect.top;
  }

  onClick(event: MouseEvent) {
    
  }

  nodeOnDragStart(event: CdkDragStart) {
    //console.log('drag start...');
    //console.log(event.source.element);
  }

  nodeOnDragMove(event: CdkDragMove, node: INode) {
    //console.log('drag move...');
    //console.log($event);
    node.position.x = event.source.getFreeDragPosition().x
    node.position.y = event.source.getFreeDragPosition().y
    node.center = this.bstService.calculateCenter(node.position, node.size)
  }

  // TODO: whenever you calculate something with toolbarElemenent you should consider the difference of toolbar and workspace
  // TODO: find a proper way to fix this

  nodeOnDragEnd(event: CdkDragEnd) {
    //console.log('drag end...');
    //console.log($event);
    //console.log(event.source.getFreeDragPosition())
    //this.addNode(event.source.getFreeDragPosition().x, event.source.getFreeDragPosition().y)
    //event.source.reset()
    //console.log(event.dropPoint)
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
    this.addNewNode(newNodePosition, newNodeSize)
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
