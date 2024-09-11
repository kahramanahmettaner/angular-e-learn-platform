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

  public workspaceModePrevious: string = 'assignment';
  public workspaceModeCurrent: string = 'assignment';
  public solutionStepPrevious: number = 0;
  public solutionStepCurrent: number = 0;

  public assignment$!: Observable<IAssignment | undefined>;
  public assignment: IAssignment | null = null;

  assignmentBstStructure: IBstNodeJSON | null = null;
  assignmentGraphStructure: IGraphDataJSON = {
    nodes: [], edges: []
  };

  public solutionBst: (IBstNodeJSON | null)[] = [];
  public solutionGraph: IGraphDataJSON[] = [];

  public feedback$!: Observable<string>;
  public feedback: string = '';

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

    // reset the state of the graph and bst
    this.graphService.resetGraph();
    this.bstService.resetTree();
    
    // get feedback observable and subscribe
    this.feedback$ = this.assignmentService.getFeedback();
    this.feedback$.subscribe( data => { this.feedback = data }) 

    // get assignment observable by id
    this.assignment$ = this.assignmentService.getAssignmentById(id);

    // subscribe to get assignment data
    this.assignment$.subscribe((assignment) => {

      if (assignment) {
        // set the state of the graph and bst

        // TODO: Find a proper solution to prevent this
        // added this line to use only values from the assignment and not to overwrite the assignment content from service
        // e.g. position atribute is being overwritten when using assignment object directly
        const clonedAssignment: IAssignment = JSON.parse(JSON.stringify(assignment));
        this.assignment = clonedAssignment;


        // TODO: ##############
        // TODO: Temporary placeholder functions for type checking. 
        // These functions always return true and should be replaced with 
        // proper type guards to validate IGraphDataJSON and IBstNodeJSON structures.
        function isGraphStructure(obj: any): obj is IGraphDataJSON {
          return true
        }
        function isBstStructure(obj: any): obj is IBstNodeJSON {
          return true
        }

        if (this.assignment.dataStructure === 'graph' && isGraphStructure(this.assignment.initialStructure)) {
          this.assignmentGraphStructure = this.assignment?.initialStructure
        }
        if (this.assignment.dataStructure === 'tree' && (isBstStructure(this.assignment.initialStructure) || this.assignment.initialStructure === null)) {
          this.assignmentBstStructure = this.assignment?.initialStructure
        }
        

        // configure

        this.updateWorkspace();
        //this.setAssignmentState(/*assignment*/);
      }
    })

  }

  onSubmitButtonClick() {

    // graph-assigment
    if (this.assignment?.dataStructure === 'graph') {
      // To save workspace content if it is in solution mode
      this.updateWorkspace();
      
      this.assignmentService.submitSolution(this.assignment.id, this.solutionGraph)

    }

    // binary-search-tree-assigment
    else if (this.assignment?.dataStructure === 'tree') {
      // To save workspace content if it is in solution mode
      this.updateWorkspace();

      this.assignmentService.submitSolution(this.assignment.id, this.solutionBst);
      
    }
  }

  addNewSolutionStep() {
    // Before adding new step, the current step need to be saved
    if (this.workspaceModePrevious === 'solution'){
      this.saveWorkspaceContent();
    }

    // ###
    // Add new solution step

    if (this.assignment?.dataStructure === 'tree') {

      // Use the data of the last step for the new step if exists ; else use assignment data
      let last: IBstNodeJSON | null;
      const numberOfSolutionSteps = this.solutionBst.length;

      if (numberOfSolutionSteps !== 0) {
        last = this.solutionBst[numberOfSolutionSteps - 1];
      } 
      else {
        const root = this.assignmentBstStructure
        
        if (root !== undefined) {
          last = root
        } else {
          last = null;
        }

      }

      // Clone the data to use values and not references
      const cloned = JSON.parse(JSON.stringify(last));

      // Add it to the solution steps
      this.solutionBst.push(cloned);

      // Set the current step
      this.solutionStepCurrent = this.solutionBst.length - 1;
      this.solutionStepPrevious = this.solutionStepCurrent;


    } else if (this.assignment?.dataStructure === 'graph') {

      // Use the data of the last step for the new step if exists ; else use assignment data
      let last: IGraphDataJSON;

      const numberOfSolutionSteps = this.solutionGraph.length;

      if (numberOfSolutionSteps !== 0) {
        last = this.solutionGraph[numberOfSolutionSteps - 1];
      } 
      else {
        const graphNodes = this.assignmentGraphStructure.nodes;
        const graphEdges = this.assignmentGraphStructure.edges;
        if (graphNodes !== undefined && graphEdges !== undefined) {
          last = {
            nodes: graphNodes,
            edges: graphEdges
          }
        } else {
          last = {
            nodes: [],
            edges: []
          };
        }
      }
      
      // Clone the data to use values and not references
      const cloned = JSON.parse(JSON.stringify(last));

      // Add it to the solution steps
      this.solutionGraph.push(cloned);

      // Set the current step
      this.solutionStepCurrent = this.solutionGraph.length - 1;
      this.solutionStepPrevious = this.solutionStepCurrent;

  }
    // call updateWorkspace function for other needed updates required related to the step change
    this.updateWorkspace();
  }


  updateWorkspace() {

    // If workspace was in solution mode before update
    if (this.workspaceModePrevious === 'solution') {
      
      // Save the previous content before resetting it
      this.saveWorkspaceContent();
    }

    // Load solution to the workspace
    if (this.workspaceModeCurrent === 'solution') {

      // Graph
      if (this.assignment?.dataStructure === 'graph') {
        // If there is no step yet, add the first step
        if (this.solutionGraph.length === 0) {
          this.addNewSolutionStep()
        }

        // Get Current Step
        const graphContent: IGraphDataJSON = this.solutionGraph[this.solutionStepCurrent];

        // TODO: Find a proper solution to prevent this
        // added this line to use only values and not the references
        const clonedGraphContent: IGraphDataJSON = JSON.parse(JSON.stringify(graphContent));
        this.loadWorkspaceContent({ graphStructure: clonedGraphContent });
      }

      // Tree
      else if (this.assignment?.dataStructure === 'tree') {
        // If there is no step yet, add the first step
        if (this.solutionBst.length === 0) {
          this.addNewSolutionStep()
        }

        // Get Current Step
        const bstContent = this.solutionBst[this.solutionStepCurrent];

        // TODO: Find a proper solution to prevent this
        // added this line to use only values and not the references
        const clonedBstContent: IBstNodeJSON = JSON.parse(JSON.stringify(bstContent));
        this.loadWorkspaceContent({ bstStructure: clonedBstContent });
      }

    } 

    // Load assignment to the workspace
    else if (this.workspaceModeCurrent === 'assignment') {

      // Graph
      if (this.assignment?.dataStructure === 'graph') {

        // No configuration
        if (!this.assignment.graphConfiguration) {
          alert('Keine Konfiguration für Graph gefunden.');
          return
        }

        // Load content and configuration
        this.loadWorkspaceContent({
          graphStructure: JSON.parse(JSON.stringify(this.assignmentGraphStructure)),
          graphConfiguration: this.assignment.graphConfiguration
        })    
      }

      // Tree
      else if (this.assignment?.dataStructure === 'tree') {
      
        // No configuration
        // if (this.assignment.binarySearchTreeConfiguration === undefined) {
        //   alert('Keine Konfiguration für Binären Suchbaum gefunden.');
        //   return
        // } 

        this.loadWorkspaceContent({
          bstStructure: JSON.parse(JSON.stringify(this.assignmentBstStructure))
        })
      }
    }


    // Update the previous mode for the future changes
    this.workspaceModePrevious = this.workspaceModeCurrent;
    this.solutionStepPrevious = this.solutionStepCurrent;
  }

  loadWorkspaceContent(params: {
    bstStructure?: IBstNodeJSON | null,
    graphStructure?: IGraphDataJSON,
    graphConfiguration?: IGraphConfiguration
  }
  ) {

    let { bstStructure, graphStructure, graphConfiguration } = params;

    // Graph
    if (this.assignment?.dataStructure === 'graph') {
      
      // Reset
      this.graphService.resetGraph();

      if (graphConfiguration) {
        // TODO: does configuration need to set here or better somewhere else?
        this.graphService.configureGraph(graphConfiguration);
      }

      // Set data
      if (graphStructure === undefined || graphStructure === null) {
        graphStructure = { nodes: [], edges: [] }
      }
      this.graphService.graphDataFromJSON(graphStructure.nodes, graphStructure.edges);
    }
    
    // Tree
    else if (this.assignment?.dataStructure === 'tree') {

      // Reset
      this.bstService.resetTree();

      // TODO: createTreeFromJSON does nothing if bstContent is null for instance
      // but here if it is null we need to set bst workspace empty
      // if it is null than just resetTree() and it is already done above so do nothing
      // this.bstService.createTreeFromJSON(bstContent);

      // if there is bst data than set it 
      if (bstStructure !== null && bstStructure !== undefined) {
        this.bstService.createTreeFromJSON(bstStructure);
      }
    }
  }

  saveWorkspaceContent() {
    
    if (this.assignment?.dataStructure === 'graph') {
      const graphDataJSON = this.graphService.graphToJSON();
      this.solutionGraph[this.solutionStepPrevious] = graphDataJSON;
    }

    else if (this.assignment?.dataStructure === 'tree') {
      const rootNodeJSON = this.bstService.treeToJSON();
      this.solutionBst[this.solutionStepPrevious] = rootNodeJSON;
    }
  }

}
