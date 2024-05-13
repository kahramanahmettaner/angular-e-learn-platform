import { Injectable } from '@angular/core';
import { INode } from '../models/Node.interface';
import { IPosition } from '../models/Position.interface';
import { ISize } from '../models/Size.interface';

@Injectable({
  providedIn: 'root'
})
export class BinarySearchTreeService {

  private rootNode: INode | null = null;
  private nodes: Array<INode> = [];
  private idCounter: number = 0;

  constructor() { 
  
  }

  addNode(position: IPosition, size: ISize) {
    
    const newNode: INode = {
      nodeId: this.idCounter,
      value: '',
      parent: null,
      leftChild: null,
      rightChild: null,
      position: position,
      size: size,
      center: this.calculateCenter(position, size)
    }

    this.idCounter += 1;
    //console.log(newNode)
    this.nodes.push(newNode);
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
  
  insertToTree( 
    parent: INode | null = null,
    child: INode | null = null, 
    isLeftChild: boolean
  ) {
    if (parent === null || child === null) {
      throw new Error('For a new link parent and one of the children are required!')
    }

    // first link ever or parent to root node
    if (this.rootNode === null || this.rootNode === child) { 
      this.rootNode = parent;
    }

    if (isLeftChild) {
      
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
  // extra functionalities to ise in future
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
}
