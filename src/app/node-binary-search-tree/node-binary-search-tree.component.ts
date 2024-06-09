import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IBstNode } from '../models/BstNode.interface';
import { BinarySearchTreeService } from '../services/binary-search-tree.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IPosition } from '../models/Position.interface';
import { IBstNewEdge } from '../models/BstNewEdge.interface';
import { BstChildRole } from '../models/BstChildRole.enum';
import { BstParentRole } from '../models/BstParentRole.enum';
import { BstNodeRole } from '../models/BstNodeRole.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-node-binary-search-tree',
  standalone: true,
  imports: [CdkDrag, FormsModule, CommonModule],
  templateUrl: './node-binary-search-tree.component.html',
  styleUrl: './node-binary-search-tree.component.css'
})
export class NodeBinarySearchTreeComponent implements OnInit, OnDestroy {

  // #############################
  // Expose the enums to the template
  public ParentRole = BstParentRole;
  public ChildRole = BstChildRole;
  public NodeRole = BstNodeRole;

  // #############################
  // References for HTML Elements
  @ViewChild('nodeValueInput') nodeValueInput!: ElementRef<HTMLInputElement>;


  // #############################
  // Inputs from parent component
  @Input() node!: IBstNode;
  @Input() index!: number;
  

  // #############################
  // Class properties
  nodeZIndex: number;
  displayNodeToolset: boolean;
  editNodeValue: boolean;

  private newEdgeSubscription!: Subscription;

  newEdge!: IBstNewEdge;

  
  // #############################
  // Constructor
  constructor(private bstService: BinarySearchTreeService) {
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

    // #############################
    // Subscribe to Observables from the bstService
    this.newEdgeSubscription = this.bstService.getNewEdge().subscribe( newEdge => {
      this.newEdge = newEdge; 
    });
  }

  ngOnDestroy(): void {
    // #############################
    // Unsubscribe from all subscriptions to prevent memory leaks
    if (this.newEdgeSubscription) {
      this.newEdgeSubscription.unsubscribe();
    }
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

  nodeOnDragStart(event: CdkDragStart) {
    // Drag start...
  }

  nodeOnDragEnd(event: CdkDragEnd) {
    // Drag end...
  }  

  nodeOnDragMove(event: CdkDragMove) {
    // Update node data (position, center)
    this.node.position.x = event.source.getFreeDragPosition().x;
    this.node.position.y = event.source.getFreeDragPosition().y;
    this.node.center = this.bstService.calculateCenter(this.node.position, this.node.size);
  }


  // #############################
  // Functions for interactions with node toolset
  onNewNodeClick(event:any, role: Partial<{childRole: BstChildRole, parentRole: BstParentRole}>) {
    
    const { childRole = BstChildRole.NO_PARENT, parentRole = BstParentRole.NO_CHILD } = role;

    // Check if the parameter childRole and parentRole are suitable
    if ((childRole !== BstChildRole.NO_PARENT && parentRole !== BstParentRole.NO_CHILD) ||
        (childRole === BstChildRole.NO_PARENT && parentRole === BstParentRole.NO_CHILD)) {
      throw new Error('Invalid role configuration: Only one of childRole or parentRole must be set.');
    }

    // TODO: Size is not being configured here, instead the default value in the service (100, 100) is being used


    // New node will be leftChild of the current node
    if (childRole === BstChildRole.LEFT_CHILD) {

      // Calculate position of the new node based on the current node
      let position: IPosition = {
        x: this.node.position.x - 130,
        y: this.node.position.y + 130,
      }

      // Add the node
      this.bstService.addNode({ position, parent: this.node }, childRole);
    }
    
    // New node will be rightChild of the current node
    else if (childRole === BstChildRole.RIGHT_CHILD) {

      // Calculate position of the new node based on the current node
      let position: IPosition = {
        x: this.node.position.x + 130,
        y: this.node.position.y + 130,
      }

      // Add the node
      this.bstService.addNode({ position, parent: this.node }, childRole);
    }

    // New node will be parent
    // The current node will be leftChild
    else if (parentRole === BstParentRole.PARENT_OF_LEFT_CHILD) {

      // Calculate position of the new node based on the current node
      let position: IPosition = {
        x: this.node.position.x + 130,
        y: this.node.position.y - 130,
      }

      // Add the node
      this.bstService.addNode({ position, leftChild: this.node }, BstChildRole.NO_PARENT);
    }

    // New node will be parent
    // The current node will be leftChild
    else if (parentRole === BstParentRole.PARENT_OF_RIGHT_CHILD) {

      // Calculate position of the new node based on the current node
      let position: IPosition = {
        x: this.node.position.x - 130,
        y: this.node.position.y - 130,
      }

      // Add the node
      this.bstService.addNode({ position, rightChild: this.node }, BstChildRole.NO_PARENT);
    }
  }

  onDisconnectNodeClick(event: MouseEvent, roleToDisconnect: BstNodeRole, childRoleToDisconnect: BstChildRole | null = null) {
    this.bstService.disconnectNode(this.node, roleToDisconnect, childRoleToDisconnect);
  }

  onConnectNodeClick(event: MouseEvent, selectedNodeRole: BstNodeRole, selectedChildRole: BstChildRole | null = null) {

    // First node selection
    if (this.newEdge.started === false) {
      this.bstService.updateNewEdge({ started: true });

      // Current node will be child and second node parent
      if (selectedNodeRole === BstNodeRole.CHILD) { 
        this.bstService.updateNewEdge({ child: this.node });
      }

      // Current node will be parent and second node child
      else {
        // Check if the child role is provided
        if (selectedChildRole === null) { throw new Error('The child role is not provided that denotes if left or right child will be connected to the node in future'); }
        this.bstService.updateNewEdge({ parent: this.node, childRole: selectedChildRole });
      }
    }


    // Second node selection
    else {
      // Current node will be child and previous selected node parent
      if (selectedNodeRole === BstNodeRole.CHILD) { 

        // Check if the child is already selected
        if (this.newEdge.child !== null) { throw new Error('Child is already selected'); }

        // Add this as child
        this.bstService.updateNewEdge({ child: this.node });
        
        // Connect the nodes
        this.bstService.connectNodes(this.newEdge.parent, this.newEdge.child, this.newEdge.childRole);

        // Reset new link for future use
        this.bstService.resetNewEdge();
      }

      // Current node will be parent and previous selected node child
      else {
        // Check if the child role is provided
        if (selectedChildRole === null) { throw new Error('The child role is not provided that denotes if left or right child will be connected to the node'); }

        // Check if the parent is already selected
        if (this.newEdge.parent !== null) { throw new Error('Parent is already selected'); }

        // Add this as child
        this.bstService.updateNewEdge({ parent: this.node, childRole: selectedChildRole });
        
        // Connect the nodes
        this.bstService.connectNodes(this.newEdge.parent, this.newEdge.child, this.newEdge.childRole);

        // Reset new link for future use
        this.bstService.resetNewEdge();
      }
      
    }
  }

  onDeleteNodeClick(event:any) {
    this.bstService.removeNode(this.node);
  }
  
  onEditNodeValueClick() {
    this.editNodeValue = true;

    // Ensure that the input element is mounted 
    setTimeout(() => {
      this.nodeValueInput.nativeElement.focus();
    }, 0);
  }
}

