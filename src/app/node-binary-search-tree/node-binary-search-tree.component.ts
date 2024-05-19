import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { INode } from '../models/Node.interface';
import { BinarySearchTreeService } from '../services/binary-search-tree.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IPosition } from '../models/Position.interface';
import { INewLink } from '../models/NewLink.interface';
import { ChildRole } from '../models/ChildRole.enum';
import { ParentRole } from '../models/ParentRole.enum';

@Component({
  selector: 'app-node-binary-search-tree',
  standalone: true,
  imports: [CdkDrag, FormsModule, CommonModule],
  templateUrl: './node-binary-search-tree.component.html',
  styleUrl: './node-binary-search-tree.component.css'
})
export class NodeBinarySearchTreeComponent implements OnInit {

  // #############################
  // Expose the ParentRole and ChildRole enums to the template
  public ParentRole = ParentRole;
  public ChildRole = ChildRole;

  // #############################
  // References for HTML Elements
  @ViewChild('nodeValueInput') nodeValueInput!: ElementRef<HTMLInputElement>;


  // #############################
  // Inputs from parent component
  @Input() node!: INode;
  @Input() index!: number;
  

  // #############################
  // Class properties
  displayNodeToolbar: boolean = false;
  editNodeValue: boolean = false;

  newLink: INewLink = this.bstService.getNewLink();

  
  // #############################
  // Constructor
  constructor(private bstService: BinarySearchTreeService) {

  }


  // #############################
  // Lifecycle hook methods
  ngOnInit(): void {
    // Activate the input field for the node
    this.onEditNodeValueClick();
  }


  // #############################
  // Functions for interactions with UI

  onFieldHover(event: any) {
    this.displayNodeToolbar = true;
  }

  onFieldLeave(event: any) {
    this.displayNodeToolbar = false;
  }

  onClick(event: MouseEvent) {
    
  }

  nodeOnDragStart(event: CdkDragStart) {
    //console.log('drag start...');
    //console.log(event.source.element);
  }

  nodeOnDragEnd(event: CdkDragEnd) {
    //console.log('drag end...');
    //console.log($event);
    //console.log(event.source.getFreeDragPosition())
    //this.addNode(event.source.getFreeDragPosition().x, event.source.getFreeDragPosition().y)
    //event.source.reset()
    //console.log(event.dropPoint)
  }  

  nodeOnDragMove(event: CdkDragMove) {
    // update node data (position, center)
    this.node.position.x = event.source.getFreeDragPosition().x;
    this.node.position.y = event.source.getFreeDragPosition().y;
    this.node.center = this.bstService.calculateCenter(this.node.position, this.node.size)
  }


  onNewNodeClick(event:any, role: Partial<{childRole: ChildRole, parentRole: ParentRole}>) {
    
    const { childRole = ChildRole.NO_PARENT, parentRole = ParentRole.NO_CHILD } = role;

    // Check if the parameter childRole and parentRole are suitable
    if ((childRole !== ChildRole.NO_PARENT && parentRole !== ParentRole.NO_CHILD) ||
        (childRole === ChildRole.NO_PARENT && parentRole === ParentRole.NO_CHILD)) {
      throw new Error('Invalid role configuration: Only one of childRole or parentRole must be set.');
    }

    // TODO: Size is not being passed and the default value in the service (100, 100) is being used


    // New node will be leftChild of the current node
    if (childRole === ChildRole.LEFT_CHILD) {

      // Calculate position of the new node based on the current node
      let position: IPosition = {
        x: this.node.position.x - 130,
        y: this.node.position.y + 130,
      }

      // Add the node
      this.bstService.addNode({ position, parent: this.node }, childRole)
    }
    
    // New node will be rightChild of the current node
    else if (childRole === ChildRole.RIGHT_CHILD) {

      // Calculate position of the new node based on the current node
      let position: IPosition = {
        x: this.node.position.x + 130,
        y: this.node.position.y + 130,
      }

      // Add the node
      this.bstService.addNode({ position, parent: this.node }, childRole)
    }

    // New node will be parent
    // The current node will be leftChild
    else if (parentRole === ParentRole.PARENT_OF_LEFT_CHILD) {

      // Calculate position of the new node based on the current node
      let position: IPosition = {
        x: this.node.position.x + 130,
        y: this.node.position.y - 130,
      }

      // Add the node
      this.bstService.addNode({ position, leftChild: this.node }, ChildRole.NO_PARENT)
    }

    // New node will be parent
    // The current node will be leftChild
    else if (parentRole === ParentRole.PARENT_OF_RIGHT_CHILD) {

      // Calculate position of the new node based on the current node
      let position: IPosition = {
        x: this.node.position.x - 130,
        y: this.node.position.y - 130,
      }

      // Add the node
      this.bstService.addNode({ position, rightChild: this.node }, ChildRole.NO_PARENT)
    }
      
      //this.addNewNode({pos, size})
      //this.bstService.insertToTree(this.workspaceElements[this.workspaceElements.length - 1], node, isLeftChild)
    
  }

  // TODO: link Delete functions -> implement the logic in service
  onParentLinkDeleteClick(event: MouseEvent) {
    if ( this.node.parent !== null ) {
      if (this.node.parent.leftChild === this.node) { this.node.parent.leftChild = null }
      else if (this.node.parent.rightChild === this.node) { this.node.parent.rightChild = null }
    }
    this.node.parent = null
  }
  
    
  onLeftChildLinkDeleteClick(event: MouseEvent) {
    if (this.node.leftChild) { this.node.leftChild.parent = null }
    this.node.leftChild = null
  }

  
  onRightChildLinkDeleteClick(event: MouseEvent) {
    if (this.node.rightChild) { this.node.rightChild.parent = null }
    this.node.rightChild = null
  }

  onParentLinkClick(event: MouseEvent) {
    if (this.newLink.started === false) {
      this.bstService.updateNewLink({
        started: true,
        child: this.node, 
      })
    } else {
      // TODO: do not throw an error but do something else
      if (this.newLink.child !== null) { throw new Error('Child is already choosed') }
      this.bstService.updateNewLink({
        child: this.node,
      })
    
      this.bstService.connectNodes(this.newLink.parent, this.newLink.child, this.newLink.childRole)

      // reset new link
      this.bstService.resetNewLink()
    }
  }

  onLeftChildLinkClick(event: MouseEvent) {
    if (this.newLink.started === false) {
      this.bstService.updateNewLink({
        started: true,
        parent: this.node, 
        childRole: ChildRole.LEFT_CHILD,
      })
    } else {

      // TODO: do not throw an error but do something else
      if (this.newLink.parent !== null) { throw new Error('Parent is already choosed') }
      this.bstService.updateNewLink({
        parent: this.node,
      })

      this.bstService.connectNodes(this.newLink.parent, this.newLink.child, ChildRole.LEFT_CHILD)

      // reset new link
      this.bstService.resetNewLink()

    }
  }

  onRightChildLinkClick(event: MouseEvent) {
    if (this.newLink.started === false) {
      this.bstService.updateNewLink({
        started: true,
        parent: this.node, 
        childRole: ChildRole.RIGHT_CHILD,
      })
    } else {
        // TODO: do not throw an error but do something else
        if (this.newLink.parent !== null) { throw new Error('Parent is already choosed') }
        this.bstService.updateNewLink({
          parent: this.node,
        })

        this.bstService.connectNodes(this.newLink.parent, this.newLink.child, ChildRole.RIGHT_CHILD)
  
        // reset new link
        this.bstService.resetNewLink()
    }

  }

  onDeleteNodeClick(event:any) {
    this.bstService.deleteNode(this.node)
  }
  

  onEditNodeValueClick() {
    this.editNodeValue = true;

    setTimeout(() => {
      this.nodeValueInput.nativeElement.focus();
    }, 0);
  }
  
  // helps to do specific operations whenever adding new node
  // addNewNode(position: IPosition, size: ISize) {
  //   this.bstService.addNode({ position, size })
  // }
}

