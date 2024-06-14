import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import IAssignment from '../models/Assignment.interface';
import { AssignmentService } from '../services/assignment.service';
import { GraphService } from '../services/graph.service';
import { CommonModule } from '@angular/common';
import { GraphComponent } from '../graph/graph.component';
import { BinarySearchTreeComponent } from '../binary-search-tree/binary-search-tree.component';
import { BinarySearchTreeService } from '../services/binary-search-tree.service';

@Component({
  selector: 'app-assignment-container',
  standalone: true,
  imports: [CommonModule, RouterLink, GraphComponent, BinarySearchTreeComponent],
  templateUrl: './assignment-container.component.html',
  styleUrl: './assignment-container.component.css'
})
export class AssignmentContainerComponent implements OnInit {

  public assignment$!: Observable<IAssignment | null>;

  // TODO: Delete this
  public submissionJSON: string = '';

  constructor(
    private assignmentService: AssignmentService,
    private graphService: GraphService,
    private bstService: BinarySearchTreeService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    // get assignment id from url
    const idStr = this.route.snapshot.paramMap.get('id') || '-1';
    const id = parseInt(idStr);

    // get assignment observable by id
    this.assignmentService.setCurrentAssignment(id);
    this.assignment$ = this.assignmentService.getCurrentAssignment();

    // reset the state of the graph and bst
    this.graphService.resetGraph();
    this.bstService.resetTree();

    // subscribe to get assignment data
    this.assignment$.subscribe((assignment) => {
      if (assignment !== null) {
        // set the state of the graph and bst
        this.setAssignmentState(assignment);
      }
    })
  }

  setAssignmentState(assignment: IAssignment) {

    // graph-assigment
    if (assignment?.dataStructure === 'graph') {
        
      // No configuration
      if (assignment.graphConfiguration === undefined) {
        alert('Keine Konfiguration für Graph gefunden.');
        return
      } 
            
      // Set graph state
      this.graphService.configureGraph({
        "nodes": assignment.graphConfiguration?.nodeConfiguration,
        "edges": assignment.graphConfiguration?.edgeConfiguration,
      })

      this.graphService.graphDataFromJSON(assignment.graphConfiguration.initialNodeData, assignment.graphConfiguration.initialEdgeData);    
    }

    // bianry-search-tree-assigment
    else if (assignment?.dataStructure === 'tree') {

      // No configuration
      if (assignment.binarySearchTreeConfiguration === undefined) {
        alert('Keine Konfiguration für Binären Suchbaum gefunden.');
        return
      } 

      // Set bst state
      this.bstService.createTreeFromJSON(assignment.binarySearchTreeConfiguration.initialRootNode);
    }
  }

  onSubmitButtonClick() {
    const rootNode = this.bstService.treeSemantic();
    this.assignmentService.updateSolution(rootNode);

    this.submissionJSON = this.assignmentService.checkSolution();
  }
}
