import { Injectable } from '@angular/core';
import { INode } from '../models/Node.interface';
import { IPosition } from '../models/Position.interface';
import { ISize } from '../models/Size.interface';
import { TreeState } from '../models/TreeState.enum';
import { INewLink } from '../models/NewLink.interface';
import { ChildRole } from '../models/ChildRole.enum';
import { NodeRole } from '../models/NodeRole.enum';

@Injectable({
  providedIn: 'root'
})
export class BinarySearchTreeService {

  private rootNode: INode | null = null;
  private nodes: Array<INode> = [];
  private idCounter: number = 0;

  constructor() { 
  
  }

  addNode(newNodeAttributes: Partial<INode>, childRole: ChildRole) {

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
    if ((parent === null && (childRole === ChildRole.LEFT_CHILD || childRole === ChildRole.RIGHT_CHILD)) ||
        (parent !== null && childRole === ChildRole.NO_PARENT)) {
      throw new Error('Invalid parent-child relationship');
    }

    // Generate new node
    const newNode: INode = {
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
    this.nodes.push(newNode);
    this.connectNodes(newNode, leftChild, ChildRole.LEFT_CHILD);
    this.connectNodes(newNode, rightChild, ChildRole.RIGHT_CHILD);
    this.connectNodes(parent, newNode, childRole);
    //this.resolveRelationConflicts(newNode, childRole);

    // TODO: In which cases should be rootNode set?
    if (this.rootNode === null) { 
      this.rootNode = newNode; 
    }
  }

  connectNodes(parent: INode | null, child: INode | null, childRole: ChildRole) {
    if (parent === null || child === null || childRole === ChildRole.NO_PARENT) {
      // throw new Error('For a new link parent and one of the children are required!')
      return
    }

    // TODO: check if the parent has parent recursively and set the root node if there is no parent anymore
    // first link ever or parent to root node
    if (this.rootNode === null || this.rootNode === child) { 
      this.rootNode = parent;
    }

    if (childRole === ChildRole.LEFT_CHILD) {
      
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

  disconnectNode(node: INode, roleToDisconnect: NodeRole, childRoleToDisconnect: ChildRole | null = null) {

    // Disconnect from parent node
    if (roleToDisconnect === NodeRole.PARENT) {
      if (node.parent?.leftChild == node) { node.parent.leftChild = null; }
      if (node.parent?.rightChild == node) { node.parent.rightChild = null; }
      node.parent = null;
      return
    }

    // Disconnect from child node
    if (childRoleToDisconnect === null) { throw new Error('The child role is not provided that denotes which child will be disconnected from the node') }
    if (childRoleToDisconnect === ChildRole.LEFT_CHILD && node.leftChild !== null) {
      node.leftChild.parent = null;
      node.leftChild = null;
    }
    if (childRoleToDisconnect === ChildRole.RIGHT_CHILD && node.rightChild !== null) {
      node.rightChild.parent = null;
      node.rightChild = null;
    } 
  }

  
  deleteNode(node: INode) {
    
    if (this.rootNode === node) {
      this.rootNode = null;
      // TODO: use modal to get the new root node 
      // for instance, there is no rootNode until any nodes connected to each other
    }

    if (node.leftChild !== null) { node.leftChild.parent = null }
    if (node.rightChild !== null) { node.rightChild.parent = null }
    if (node.parent !== null) {
      if (node.parent.leftChild === node) { node.parent.leftChild = null }
      if (node.parent.rightChild === node) { node.parent.rightChild = null }
    }

    let index = this.nodes.indexOf(node);
    if (index !== -1) {
       this.nodes.splice(index, 1);
    }
  }


  getNodesAsList() {
    return this.nodes;
  }

  getRootNode() {
    return this.rootNode;
  }

  // Function to return the JSON structure of the tree starting from the root node
  getTreeStructure(): any {
    if (!this.rootNode) {
      return 'No nodes connected to each other to present a tree structure!';
    }

    return this.constructTreeStructure(this.rootNode);
  }

  private constructTreeStructure(node: INode | null): any {
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
    this.preOrderRecursive(this.rootNode)
  }

  private preOrderRecursive(currentNode: INode | null) {
    if (currentNode!=null) {
      // Implement doSomething()
      
      this.preOrderRecursive(currentNode.leftChild)
      this.preOrderRecursive(currentNode.rightChild)
    }
  }

  isEmpty() {
    return (this.rootNode === null)
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

    try {
      const rootNodeJSON = JSON.parse(json); // Parse JSON string to object
      if (!rootNodeJSON) {
        throw new Error('Invalid JSON data');
      }

      // clean the current state 
      this.nodes.splice(0, this.nodes.length);
      this.rootNode = null


      if (rootNodeJSON != null) {
        
        // create new Object because directly using the ones from json causes some issues
        this.rootNode = {
          nodeId: rootNodeJSON.nodeId, 
          value: rootNodeJSON.value,
          parent: null,
          leftChild: null,
          rightChild: null,
          position: rootNodeJSON.position,
          size: rootNodeJSON.size,
          center: rootNodeJSON.center
        } 
        this.createTreeFromJSONRecursiv(this.rootNode, rootNodeJSON)
      }

    } catch (error) {
      console.error('Error parsing JSON data:', error);
    }
  }

  private createTreeFromJSONRecursiv(parentNode: INode, parentNodeJSON: INode){

    this.nodes.push(parentNode)
    
    if (parentNodeJSON.leftChild !== null) {
      const left: INode = {
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
      const right: INode = {
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

  isTreeValid(): TreeState {
    if (this.isEmpty()) { return TreeState.NO_ROOT }

    if (this.getNumberOfConnectedNodes(this.rootNode) !== this.nodes.length) { return TreeState.INVALID }

    return TreeState.VALID
  }

  getNumberOfConnectedNodes(currentNode: INode | null): number {
    if (currentNode === null ) { return 0 }

    return 1 + this.getNumberOfConnectedNodes(currentNode.leftChild) + this.getNumberOfConnectedNodes(currentNode.rightChild)
  }

  getRecentNode() {
    return this.nodes[this.nodes.length - 1]
  }

  // new link
  private newLink: INewLink = { started: false, parent: null, child: null, childRole: ChildRole.NO_PARENT }

  getNewLink() {
    return this.newLink
  }

  resetNewLink() {
    this.newLink.started = false;
    this.newLink.parent = null;
    this.newLink.child = null;
    this.newLink.childRole = ChildRole.NO_PARENT;
  }

  updateNewLink( newValues: Partial<INewLink> ) {
    const { started, parent, child, childRole } = newValues;
    if (started) { this.newLink.started = started; }
    if (parent) { this.newLink.parent = parent; }
    if (child) { this.newLink.child = child; }
    if (childRole) { this.newLink.childRole = childRole; }
  }
}