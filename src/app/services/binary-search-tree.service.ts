import { Injectable } from '@angular/core';
import { IBstNode } from '../models/BstNode.interface';
import { IPosition } from '../models/Position.interface';
import { ISize } from '../models/Size.interface';
import { BstState } from '../models/BstState.enum';
import { IBstNewEdge } from '../models/BstNewEdge.interface';
import { BstChildRole } from '../models/BstChildRole.enum';
import { BstNodeRole } from '../models/BstNodeRole.enum';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BinarySearchTreeService {

  private rootNode$!: BehaviorSubject<IBstNode | null>;
  private nodes$!: BehaviorSubject<IBstNode[]>; 
  private newEdge$!: BehaviorSubject<IBstNewEdge>; 
  private idCounter!: number;

  constructor() { 

    // ##############
    // Initialize
    this.rootNode$ = new BehaviorSubject<IBstNode | null>(null);
    this.nodes$ = new BehaviorSubject<IBstNode[]>([]);
    this.newEdge$ = new BehaviorSubject<IBstNewEdge>({ 
      started: false, parent: null, child: null, childRole: BstChildRole.NO_PARENT 
    });
    this.idCounter = 0;
  }

  // ##########
  // Getters  
  getNodes(): Observable<IBstNode[]> {
    return this.nodes$;
  }

  getRootNode(): Observable<IBstNode | null> {
    return this.rootNode$;
  }

  getNewEdge(): Observable<IBstNewEdge>  {
    return this.newEdge$;
  }
  // ###########
  // Update

  addNode(newNodeAttributes: Partial<IBstNode>, childRole: BstChildRole) {

    // Destructure the attributes and assign default values if they are undefined
    const { 
      value = '',
      parent = null,
      leftChild = null,
      rightChild = null,
      position = { x: 0, y: 0},
      size = { width: 100, height: 100 }, // TODO: 
    } = newNodeAttributes;

    // Check if childRole and parent are suitable for each other
    if ((parent === null && (childRole === BstChildRole.LEFT_CHILD || childRole === BstChildRole.RIGHT_CHILD)) ||
        (parent !== null && childRole === BstChildRole.NO_PARENT)) {
      throw new Error('Invalid parent-child relationship');
    }

    // Generate new node
    const newNode: IBstNode = {
      nodeId: this.idCounter,
      value: value,
      parent: null,
      leftChild: null,
      rightChild: null,
      position: position,
      size: size,
      center: this.calculateCenter(position, size)
    }

    // Increment id counter for the next nodes
    this.idCounter += 1;

    // Add the node and adjust the relations of the previous and current parents and childs
    this.nodes$.next([ ...this.nodes$.getValue(), newNode ]);
    this.connectNodes(newNode, leftChild, BstChildRole.LEFT_CHILD);
    this.connectNodes(newNode, rightChild, BstChildRole.RIGHT_CHILD);
    this.connectNodes(parent, newNode, childRole);
    //this.resolveRelationConflicts(newNode, childRole);

    // TODO: In which cases should be rootNode set?
    if (this.rootNode$.getValue() === null) { 
      this.rootNode$.next(newNode); 
    }
  }

  resetTree() {
    this.rootNode$.next(null);
    this.nodes$.next([]);
    this.resetNewEdge();
    this.idCounter = 0;
  }

  setNodes(nodes: IBstNode[]) {
    this.nodes$.next(nodes);
  }

  resetNewEdge() {
    this.newEdge$.next({ 
      started: false, parent: null, child: null, childRole: BstChildRole.NO_PARENT 
    });
  }
    
  updateNewEdge( newValues: Partial<IBstNewEdge> ) {
    const { started, parent, child, childRole } = newValues;
    const current = this.newEdge$.getValue();

    if (started) {
      current.started = started;
    }
    if (parent) { 
      current.parent = parent;
    }
    if (child) { 
      current.child = child;
    }
    if (childRole) { 
      current.childRole = childRole;
    }

    this.newEdge$.next(current); 
  }

  connectNodes(parent: IBstNode | null, child: IBstNode | null, childRole: BstChildRole) {
    if (parent === null || child === null || childRole === BstChildRole.NO_PARENT) {
      // throw new Error('For a new link parent and one of the children are required!')
      return
    }

    // TODO: check if the parent has parent recursively and set the root node if there is no parent anymore
    // first link ever or parent to root node
    if (this.rootNode$.getValue() === null || this.rootNode$.getValue() === child) { 
      this.rootNode$.next(parent);
    }

    if (childRole === BstChildRole.LEFT_CHILD) {
      
      if (parent.leftChild !== null) { parent.leftChild.parent = null }
      if (child.parent != null) { 
        if (child.parent.leftChild === child) { child.parent.leftChild = null }
        if (child.parent.rightChild === child) { child.parent.rightChild = null }
      }

      parent.leftChild = child
      child.parent = parent
    } else {
      
      if (parent.rightChild !== null) { parent.rightChild.parent = null }
      if (child.parent != null) { 
        if (child.parent.leftChild === child) { child.parent.leftChild = null }
        if (child.parent.rightChild === child) { child.parent.rightChild = null }
      }

      parent.rightChild = child
      child.parent = parent
    }
  }

  disconnectNode(node: IBstNode, roleToDisconnect: BstNodeRole, childRoleToDisconnect: BstChildRole | null = null) {

    // Disconnect from parent node
    if (roleToDisconnect === BstNodeRole.PARENT) {
      if (node.parent?.leftChild == node) { node.parent.leftChild = null; }
      if (node.parent?.rightChild == node) { node.parent.rightChild = null; }
      node.parent = null;
      return
    }

    // Disconnect from child node
    if (childRoleToDisconnect === null) { throw new Error('The child role is not provided that denotes which child will be disconnected from the node') }
    if (childRoleToDisconnect === BstChildRole.LEFT_CHILD && node.leftChild !== null) {
      node.leftChild.parent = null;
      node.leftChild = null;
    }
    if (childRoleToDisconnect === BstChildRole.RIGHT_CHILD && node.rightChild !== null) {
      node.rightChild.parent = null;
      node.rightChild = null;
    } 
  }

  
  removeNode(node: IBstNode) {
    
    if (this.rootNode$.getValue() === node) {
      this.rootNode$.next(null);
      // TODO: use modal to get the new root node 
      // for instance, there is no rootNode until any nodes connected to each other
    }

    if (node.leftChild !== null) { node.leftChild.parent = null }
    if (node.rightChild !== null) { node.rightChild.parent = null }
    if (node.parent !== null) {
      if (node.parent.leftChild === node) { node.parent.leftChild = null }
      if (node.parent.rightChild === node) { node.parent.rightChild = null }
    }

    let index = this.nodes$.getValue().indexOf(node);
    if (index !== -1) {
      const nodesList = this.nodes$.getValue();
      nodesList.splice(index, 1);
      this.nodes$.next(nodesList);
    }
  }

  // Function to return the JSON structure of the tree starting from the root node
  getTreeStructure(): any {
    if (!this.rootNode$.getValue()) {
      return 'No nodes connected to each other to present a tree structure!';
    }

    return this.constructTreeStructure(this.rootNode$.getValue());
  }

  private constructTreeStructure(node: IBstNode | null): any {
    if (!node) {
      return null; // If node is null, return null
    }
    
    // Construct JSON object for the current node
    const nodeStructure: any = {
      nodeId: node.nodeId,
      value: node.value,
      // ###################
      // TODO: all three attributes are necessary?
      position: node.position,
      size: node.size,
      center: node.center,
      // ###################
      leftChild: this.constructTreeStructure(node.leftChild), // Recursively construct JSON for left child
      rightChild: this.constructTreeStructure(node.rightChild) // Recursively construct JSON for right child
    };

    return nodeStructure;
  }

  
  // ############################################
  // extra functionalities to use in future
  // ############################################

  preOrder() {
    this.preOrderRecursive(this.rootNode$.getValue())
  }

  private preOrderRecursive(currentNode: IBstNode | null) {
    if (currentNode!=null) {
      // Implement doSomething()
      
      this.preOrderRecursive(currentNode.leftChild)
      this.preOrderRecursive(currentNode.rightChild)
    }
  }

  isEmpty() {
    return (this.rootNode$.getValue() === null)
  }

  calculateCenter(position: IPosition, size: ISize): IPosition {
    const center: IPosition = {
      x: position.x + (size.width / 2),
      y: position.y + (size.height / 2)
    };
    return center;
  }


  downloadTreeAsJSON() {
    // prepare
    const treeStructure = this.getTreeStructure();
    const json = JSON.stringify(treeStructure, null, 2);
    
    const blob = new Blob([json], { type: 'application/json' });
    
    // download
    const link = document.createElement('a');
    link.download = 'binary_search_tree.json';
    link.href = window.URL.createObjectURL(blob);
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(link.href);
  }

  createTreeFromJSON(json: string, parentId: number = -1) {

    let binarySearchTreeJSON;
    try {
      binarySearchTreeJSON = JSON.parse(json);
    } catch (error) {
      console.error('Error parsing JSON data:', error);
    }

    // clean the current state 
    this.resetTree();

    if (binarySearchTreeJSON != null) {
      
      const rootNodeJSON = binarySearchTreeJSON.rootNode;
      // create new Object because directly using the ones from json causes some issues
      const rootNode = {
        nodeId: rootNodeJSON.nodeId, 
        value: rootNodeJSON.value,
        parent: null,
        leftChild: null,
        rightChild: null,
        position: rootNodeJSON.position,
        size: rootNodeJSON.size,
        center: rootNodeJSON.center
      };
      
      this.rootNode$.next(rootNode);

      this.createTreeFromJSONRecursiv(rootNode, rootNodeJSON)
    }
  }

  private createTreeFromJSONRecursiv(parentNode: IBstNode, parentNodeJSON: IBstNode){

    this.nodes$.next([ ...this.nodes$.getValue() ,parentNode ])
    
    if (parentNodeJSON.leftChild !== null) {
      const left: IBstNode = {
        nodeId: parentNodeJSON?.leftChild.nodeId, 
        value: parentNodeJSON?.leftChild.value,
        parent: parentNode,
        leftChild: null,
        rightChild: null,
        position: parentNodeJSON?.leftChild.position,
        size: parentNodeJSON?.leftChild.size,
        center: parentNodeJSON?.leftChild.center
      } 
      parentNode.leftChild = left
      this.createTreeFromJSONRecursiv(left, parentNodeJSON.leftChild)
    }

    if (parentNodeJSON.rightChild !== null) {
      const right: IBstNode = {
        nodeId: parentNodeJSON?.rightChild.nodeId, 
        value: parentNodeJSON?.rightChild.value,
        parent: parentNode,
        leftChild: null,
        rightChild: null,
        position: parentNodeJSON?.rightChild.position,
        size: parentNodeJSON?.rightChild.size,
        center: parentNodeJSON?.rightChild.center
      }
      parentNode.rightChild = right
      this.createTreeFromJSONRecursiv(right, parentNodeJSON.rightChild)
    }
  }

  isTreeValid(): BstState {
    if (this.isEmpty()) { return BstState.NO_ROOT }

    if (this.getNumberOfConnectedNodes(this.rootNode$.getValue()) !== this.nodes$.getValue().length) { return BstState.INVALID }

    return BstState.VALID
  }

  getNumberOfConnectedNodes(currentNode: IBstNode | null): number {
    if (currentNode === null ) { return 0 }

    return 1 + this.getNumberOfConnectedNodes(currentNode.leftChild) + this.getNumberOfConnectedNodes(currentNode.rightChild)
  }

  getRecentNode() {
    return this.nodes$.getValue()[this.nodes$.getValue().length - 1]
  }


}