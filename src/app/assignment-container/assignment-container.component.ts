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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { IGraphDataSemantic } from '../models/GraphDataSemantic.interface';
import { graphNodeJSONToSemantic } from '../utils';
import { IBstNodeJSON } from '../models/BstNodeJSON.interface';
import { IGraphDataJSON } from '../models/GraphDataJSON.interface';
import { IGraphConfiguration } from '../models/GraphConfiguration.interface';


@Component({
  selector: 'app-assignment-container',
  standalone: true,
  imports: [CommonModule, RouterLink, GraphComponent, BinarySearchTreeComponent, FormsModule, MatButtonToggleModule],
  templateUrl: './assignment-container.component.html',
  styleUrl: './assignment-container.component.css'
})
export class AssignmentContainerComponent implements OnInit {

  public assignment$!: Observable<IAssignment | null>;
  public solutionBst$!: Observable<(IBstNodeJSON | null)[]>;
  public solutionGraph$!: Observable<IGraphDataJSON[]>;
  
  public workspaceModePrevious: string = 'assignment';
  public workspaceModeCurrent: string = 'assignment';
  public solutionStepPrevious: number = 0;
  public solutionStepCurrent: number = 0;

  // TODO: Is this required?
  public assignment: IAssignment | null = null;
  public solutionBst: (IBstNodeJSON | null)[] = [];
  public solutionGraph: IGraphDataJSON[] = [];

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

    // get solution observable
    this.solutionBst$ = this.assignmentService.getSolutionBst();
    this.solutionGraph$ = this.assignmentService.getSolutionGraph();


    // reset the state of the graph and bst
    this.graphService.resetGraph();
    this.bstService.resetTree();

    // subscribe to get assignment data
    this.assignment$.subscribe((assignment) => {
      if (assignment !== null) {
        // set the state of the graph and bst

        // TODO: Find a proper solution to prevent this
        // added this line to use only values from the assignment and not to overwrite the assignment content from service
        // e.g. position atribute is being overwritten when using assignment object directly
        const clonedAssignment = JSON.parse(JSON.stringify(assignment));
        this.assignment = clonedAssignment;

        // configure
        
        this.updateWorkspace();
        //this.setAssignmentState(/*assignment*/);
      }
    })

    // subscribe to get solution data
    this.solutionBst$.subscribe((solution) => {
      this.solutionBst = solution;
    })
    
    this.solutionGraph$.subscribe((solution) => {
      this.solutionGraph = solution;
    })
  }

  onSubmitButtonClick() {
    // graph-assigment
    if (this.assignment?.dataStructure === 'graph') {
      // To save workspace content if it is in solution mode
      this.updateWorkspace();
  
      this.submissionJSON = this.assignmentService.checkSolution();
    }

    // binary-search-tree-assigment
    else if (this.assignment?.dataStructure === 'tree') {
      // To save workspace content if it is in solution mode
      this.updateWorkspace();
  
      this.submissionJSON = this.assignmentService.checkSolution();
    }
  }

  addNewSolutionStep() {
    this.assignmentService.addNewSolutionStep();
  }

  updateWorkspace() {

    // If workspace was in solution mode before update
    if (this.workspaceModePrevious === 'solution') {
      
      // Save the previous content before resetting it
      this.saveWorkspaceContent();
    }

    // Update the previous mode for the future changes
    this.workspaceModePrevious = this.workspaceModeCurrent;

    // Load solution to the workspace
    if (this.workspaceModeCurrent === 'solution') {

      // Graph
      if (this.assignment?.dataStructure === 'graph') {
        const graphContent = this.solutionGraph[this.solutionStepCurrent];

        // TODO: Find a proper solution to prevent this
        // added this line to use only values and not the references
        const clonedGraphContent: IGraphDataJSON = JSON.parse(JSON.stringify(graphContent));
        this.loadWorkspaceContent({graphContent: clonedGraphContent});
      }

      // Tree
      else if (this.assignment?.dataStructure === 'tree') {
        const bstContent = this.solutionBst[this.solutionStepCurrent];

        // TODO: Find a proper solution to prevent this
        // added this line to use only values and not the references
        const clonedBstContent: IBstNodeJSON = JSON.parse(JSON.stringify(bstContent));
        this.loadWorkspaceContent({bstContent: clonedBstContent});
      }

    } 

    // Load assignment to the workspace
    else if (this.workspaceModeCurrent === 'assignment') {

      // Graph
      if (this.assignment?.dataStructure === 'graph') {

        // No configuration
        if (this.assignment.graphConfiguration === undefined) {
          alert('Keine Konfiguration für Graph gefunden.');
          return
        }

        // Load content and configuration
        this.loadWorkspaceContent({
          graphContent: {
            nodes: this.assignment.graphConfiguration.initialNodeData,
            edges: this.assignment.graphConfiguration.initialEdgeData
          },
          graphConfiguration: {
            nodes: this.assignment.graphConfiguration.nodeConfiguration,
            edges: this.assignment.graphConfiguration.edgeConfiguration,
          }
        })    
      }

      // Tree
      else if (this.assignment?.dataStructure === 'tree') {
      
        // No configuration
        if (this.assignment.binarySearchTreeConfiguration === undefined) {
          alert('Keine Konfiguration für Binären Suchbaum gefunden.');
          return
        } 

        this.loadWorkspaceContent({
          bstContent: this.assignment.binarySearchTreeConfiguration.initialRootNode
        })
      }
    }

    this.solutionStepPrevious = this.solutionStepCurrent;
  }

  loadWorkspaceContent(params: Partial<{
    graphContent: IGraphDataJSON;
    bstContent: IBstNodeJSON | null,
    graphConfiguration: IGraphConfiguration | null
  }>) {

    let {
      graphContent,
      bstContent = null,
      graphConfiguration
    } = params;
    
    // Graph
    if (this.assignment?.dataStructure === 'graph') {

      // Reset
      this.graphService.resetGraph();

      if (graphConfiguration) {
        // TODO: does configuration need to set here or better somewhere else?
        this.graphService.configureGraph({
          "nodes": graphConfiguration.nodes,
          "edges": graphConfiguration.edges
        })
      }

      // Set data
      if (graphContent === undefined) {
        graphContent = { nodes: [], edges: [] }
      }
      this.graphService.graphDataFromJSON(graphContent.nodes, graphContent.edges);
    }
    
    // Tree
    else if (this.assignment?.dataStructure === 'tree') {
      console.log(bstContent)
      // Reset
      this.bstService.resetTree();

      // TODO: createTreeFromJSON does nothing if bstContent is null for instance
      // but here if it is null we need to set bst workspace empty
      // if it is null than just resetTree() and it is already done above so do nothing
      // this.bstService.createTreeFromJSON(bstContent);

      // if there is bst data than set it 
      if (bstContent !== null && bstContent !== undefined) {
        this.bstService.createTreeFromJSON(bstContent);
      }
    }
  }

  saveWorkspaceContent() {
    
    if (this.assignment?.dataStructure === 'graph') {
      const graphDataJSON = this.graphService.graphToJSON();
      this.assignmentService.updateSolutionGraph(graphDataJSON, this.solutionStepPrevious);
    }

    else if (this.assignment?.dataStructure === 'tree') {
      const rootNodeJSON = this.bstService.treeToJSON();
      this.assignmentService.updateSolutionBst(rootNodeJSON, this.solutionStepPrevious);
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
