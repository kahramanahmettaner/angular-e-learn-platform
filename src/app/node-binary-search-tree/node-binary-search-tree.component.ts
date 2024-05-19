import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { INode } from '../models/Node.interface';
import { BinarySearchTreeService } from '../services/binary-search-tree.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ISize } from '../models/Size.interface';
import { IPosition } from '../models/Position.interface';
import { INewLink } from '../models/NewLink.interface';

@Component({
  selector: 'app-node-binary-search-tree',
  standalone: true,
  imports: [CdkDrag, FormsModule, CommonModule],
  templateUrl: './node-binary-search-tree.component.html',
  styleUrl: './node-binary-search-tree.component.css'
})
export class NodeBinarySearchTreeComponent implements OnInit {

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

  // TODO: do not have to pass node as input parameter because it is already in component
  /*
  onNewNodeClick(event:any, node:INode, newNodeRelationship: NodeRelation) {

    // calculate position
    let pos: IPosition = {
      x: node.position.x + 130,
      y: node.position.y -130,
    }

    // TODO: Size of the currentNode is beeing used right now
    const size: ISize = {
      width: node.size.width,
      height: node.size.height,
    }
    this.addNewNode(pos, size)
    this.bstService.insertToTree(this.workspaceElements[this.workspaceElements.length - 1], node, isLeftChild)
  }
  */


  onParentNewClick(event:any, isLeftChild: boolean) {

    let pos:IPosition = {
      x: this.node.position.x + 130,
      y: this.node.position.y -130,
    }
    if (!isLeftChild ) {
      pos = {
        x: this.node.position.x - 130,
        y: this.node.position.y -130,
      }
    }

    const size:ISize = {
      width: this.node.size.width,
      height: this.node.size.height,
    }
    this.addNewNode(pos, size)

    // TODO: do this in service

    this.bstService.insertToTree(this.bstService.getRecentNode(), this.node, isLeftChild)
  }

  onRightChildNewClick(event:any) {
    const pos:IPosition = {
      x: this.node.position.x +130,
      y: this.node.position.y +130,
    }
    const size:ISize = {
      width: this.node.size.width,
      height: this.node.size.height,
    }
    this.addNewNode(pos, size)
    this.bstService.insertToTree(this.node, this.bstService.getRecentNode(), false)
  }

  onLeftChildNewClick(event:any) {
    const pos:IPosition = {
      x: this.node.position.x -130,
      y: this.node.position.y + 130,
    }
    const size:ISize = {
      width: this.node.size.width,
      height: this.node.size.height,
    }
    this.addNewNode(pos, size)
    this.bstService.insertToTree(this.node, this.bstService.getRecentNode(), true)
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
      
        console.log(this.newLink)
        this.bstService.insertToTree(this.newLink.parent, this.newLink.child, this.newLink.isLeftChild)
  
        // reset new link
        this.bstService.resetNewLink()
      }
    }
  
    onLeftChildLinkClick(event: MouseEvent) {
      if (this.newLink.started === false) {
        this.bstService.updateNewLink({
          started: true,
          parent: this.node, 
          isLeftChild: true,
        })
      } else {
  
        // TODO: do not throw an error but do something else
        if (this.newLink.parent !== null) { throw new Error('Parent is already choosed') }
        this.bstService.updateNewLink({
          parent: this.node,
        })
  
        this.bstService.insertToTree(this.newLink.parent, this.newLink.child, true)
  
        // reset new link
        this.bstService.resetNewLink()
  
      }
    }
  
    onRightChildLinkClick(event: MouseEvent) {
      if (this.newLink.started === false) {
        this.bstService.updateNewLink({
          started: true,
          parent: this.node, 
          isLeftChild: false,
        })
      } else {
          // TODO: do not throw an error but do something else
          if (this.newLink.parent !== null) { throw new Error('Parent is already choosed') }
          this.bstService.updateNewLink({
            parent: this.node,
          })

          this.bstService.insertToTree(this.newLink.parent, this.newLink.child, false)
    
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
    addNewNode(position: IPosition, size: ISize) {
      this.bstService.addNode(position, size)
    }
}

