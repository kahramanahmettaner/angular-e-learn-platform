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

  // TODO: Is this required?
  public assignment: IAssignment | null = null;

  // TODO: Delete this
  public submissionJSON: string = '';

  // TODO: Delete this
  public promptCopied: boolean = false;

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
        this.assignment = assignment;
        this.setAssignmentState(/*assignment*/);
      }
    })
  }

  setAssignmentState(/*assignment: IAssignment*/) {

    // graph-assigment
    if (this.assignment?.dataStructure === 'graph') {
        
      // No configuration
      if (this.assignment.graphConfiguration === undefined) {
        alert('Keine Konfiguration für Graph gefunden.');
        return
      } 
            
      // Set graph state
      this.graphService.configureGraph({
        "nodes": this.assignment.graphConfiguration?.nodeConfiguration,
        "edges": this.assignment.graphConfiguration?.edgeConfiguration,
      })

      this.graphService.graphDataFromJSON(this.assignment.graphConfiguration.initialNodeData, this.assignment.graphConfiguration.initialEdgeData);    
    }

    // binary-search-tree-assigment
    else if (this.assignment?.dataStructure === 'tree') {

      // No configuration
      if (this.assignment.binarySearchTreeConfiguration === undefined) {
        alert('Keine Konfiguration für Binären Suchbaum gefunden.');
        return
      } 

      // Set bst state
      this.bstService.createTreeFromJSON(this.assignment.binarySearchTreeConfiguration.initialRootNode);
    }
  }

  onSubmitButtonClick() {
    // graph-assigment
    if (this.assignment?.dataStructure === 'graph') {
      const graphDataSemantic = this.graphService.graphToSemantic();
      this.assignmentService.updateSolution(graphDataSemantic);
  
      this.submissionJSON = this.assignmentService.checkSolution();
    }

    // binary-search-tree-assigment
    else if (this.assignment?.dataStructure === 'tree') {
      const rootNode = this.bstService.treeSemantic();
      this.assignmentService.updateSolution(rootNode);
  
      this.submissionJSON = this.assignmentService.checkSolution();
    }
  }

  onCopyPromptClick() {
    navigator.clipboard.writeText(this.submissionJSON).then(() => {
      this.promptCopied = true;

      setTimeout( () => { this.promptCopied = false; }, 2000)
    }).catch(err => {
      console.error('Could not copy text: ', err);
    })
  }
}
