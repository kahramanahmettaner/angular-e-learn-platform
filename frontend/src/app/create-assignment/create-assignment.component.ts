import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import IAssignment from '../models/Assignment.interface';
import { AssignmentService } from '../services/assignment.service';
import { Router } from '@angular/router';
import { GraphComponent } from '../graph/graph.component';
import { BinarySearchTreeComponent } from '../binary-search-tree/binary-search-tree.component';
import { GraphService } from '../services/graph.service';
import { BinarySearchTreeService } from '../services/binary-search-tree.service';
import { IBstNodeJSON } from '../models/BstNodeJSON.interface';
import { readFile, downloadJSON } from '../utils';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { IGraphDataJSON } from '../models/GraphDataJSON.interface';
import { IGraphConfiguration } from '../models/GraphConfiguration.interface';

@Component({
  selector: 'app-create-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, GraphComponent, BinarySearchTreeComponent, MatButtonToggleModule],
  templateUrl: './create-assignment.component.html',
  styleUrl: './create-assignment.component.css'
})
export class CreateAssignmentComponent implements OnInit {

  // ########################################
  // Component class properties

  // Form related properties 
  form: FormGroup;
  dataStructures = [
    'tree', 'graph'
  ];
    // { title: 'Binärer Suchbaum', value: 'tree' },
    // { title: 'Graph', value: 'graph' }
  assignmentTypes = [
    'bst_insert', 'bst_remove',
    'dijkstra', 'floyd', 'kruskal', 'transitive_closure'
  ];
    // { title: 'Binärer Suchbaum - Einfügen', value: 'bst_insert' },
    // { title: 'Binärer Suchbaum - Löschen', value: 'bst_remove' },
    // { title: 'Dijkstra Algorithmus', value: 'dijkstra' },
    // { title: 'Floyd Algorithmus', value: 'floyd' },
    // { title: 'Kruskal Algorithmus', value: 'kruskal' },
    // { title: 'Transitive Hülle', value: 'transitive_closure' },
  showCheckbox = false;

  // Workspace related properties
  workspaceIsActive = false;
  structureIsSet = false;
  
  workspaceModePrevious: string = 'assignment';
  workspaceModeCurrent: string = 'assignment';  
  public solutionStepPrevious: number = 0;
  public solutionStepCurrent: number = 0;

  assignmentBstStructure: IBstNodeJSON | null = null;
  solutionBstStructure: (IBstNodeJSON | null)[] = [];
  
  assignmentGraphStructure: IGraphDataJSON = {
    nodes: [], edges: []
  };
  solutionGraphStructure: IGraphDataJSON[] = [
  //   {
  //   nodes: [], edges: []
  // }
  ];



  // #######################################################
  // Constructor - Component lifecycle related
  constructor(
    private assignmentService: AssignmentService,
    private fb: FormBuilder,
    private router: Router,
    private graphService: GraphService,
    private bstService: BinarySearchTreeService,
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      stepsEnabled: [false],
      text: ['', Validators.required],
      maxPoints: [100, Validators.required],
      selectedDataStructure: ['', Validators.required],
      selectedAssignmentType: ['', Validators.required],
      checkboxEdgeDirected: [false ],
      checkboxEdgeWeighted: [false],
      checkboxNodeWeighted: [false],
      checkboxNodeVisited: [false]
    });
  }

  ngOnInit(): void {
    this.resetWorkspaceContent();
  }

  // #######################################################
  // Workspace Content Related

  //TODO:
  updateWorkspace() {
    // Save the previous content before resetting it
    this.saveWorkspaceContent(this.workspaceModePrevious, this.solutionStepPrevious);

    // #####
    // ## CASE 1: Example Solution ->  Load it to the service
    if (this.workspaceModeCurrent === 'solution') {

      // ## CASE 1.1: Graph -> Set GraphService
      if (this.form.value.selectedDataStructure === 'graph') {
        // If there is no step yet, add the first step
        if (this.solutionGraphStructure.length === 0) {
          this.addNewSolutionStep()
        }

        // Get Current Step
        const graphContent: IGraphDataJSON = this.solutionGraphStructure[this.solutionStepCurrent];
        
        // Clone the graph content and load it to the GraphService
        const clonedGraphContent: IGraphDataJSON = JSON.parse(JSON.stringify(graphContent));
        this.loadWorkspaceContent({
          graphContent: clonedGraphContent,
          graphConfiguration: {
            nodeVisited: this.form.value.checkboxNodeVisited,
            nodeWeight: this.form.value.checkboxNodeWeighted,
            edgeWeight: this.form.value.checkboxEdgeWeighted,
            edgeDirected: this.form.value.checkboxEdgeDirected,
            }
        });
      }

      // ## CASE 1.2: Bst -> Set BstService
      else if (this.form.value.selectedDataStructure === 'tree') {
        // If there is no step yet, add the first step
        if (this.solutionBstStructure.length === 0) {
          this.addNewSolutionStep()
        }
        // Get Current Step
        const bstContent = this.solutionBstStructure[this.solutionStepCurrent];

        // Clone the bst content and load it to the BstService
        const clonedBstContent: IBstNodeJSON = JSON.parse(JSON.stringify(bstContent));
        this.loadWorkspaceContent({bstContent: clonedBstContent});
      }
    }


    // #####
    // ## CASE 2: Initial Structure ->  Load it to the workspace
    else if (this.workspaceModeCurrent === 'assignment') {
      
      // ## CASE 2.1: Graph -> Set GraphService
      if (this.form.value.selectedDataStructure === 'graph') {

        // Clone the graph content and load it to the GraphService
        const clonedGraphContent: IGraphDataJSON = JSON.parse(JSON.stringify(this.assignmentGraphStructure));
        this.loadWorkspaceContent({
          graphContent: clonedGraphContent,
          graphConfiguration: {
            nodeVisited: this.form.value.checkboxNodeVisited,
            nodeWeight: this.form.value.checkboxNodeWeighted,
            edgeWeight: this.form.value.checkboxEdgeWeighted,
            edgeDirected: this.form.value.checkboxEdgeDirected,
          }
        });
      }

      // ## CASE 2.2: Bst -> Set BstService
      else if (this.form.value.selectedDataStructure === 'tree') {
        // Clone the bst content and load it to the BstService
        const clonedBstContent: IBstNodeJSON = JSON.parse(JSON.stringify(this.assignmentBstStructure));
        this.loadWorkspaceContent({bstContent: clonedBstContent});
      }
    }

    // Update the previous mode and previous step for the future changes
    this.workspaceModePrevious = this.workspaceModeCurrent;
    this.solutionStepPrevious = this.solutionStepCurrent;
  }

  //TODO:
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
    
    // ## CASE 1: Graph ->  Load it to the GraphService
    if (this.form.value.selectedDataStructure === 'graph') {

      // Reset Graph Service to ensure the previous content is removed
      this.graphService.resetGraph();

      // If graph configuration is provided, set it 
      if (graphConfiguration) {
        this.graphService.configureGraph(graphConfiguration);
      } else {
        throw new Error('No Graph Configuration.')
      }

      // Set graph data
      if (graphContent === undefined) {
        graphContent = { nodes: [], edges: [] }
      }
      this.graphService.graphDataFromJSON(graphContent.nodes, graphContent.edges);
    }
    
    // ## CASE 2: Bst -> Load it to the BstService
    else if (this.form.value.selectedDataStructure === 'tree') {
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

  //TODO:
  saveWorkspaceContent(mode: string, step: number) {
    
    // ## CASE 1: Graph -> get data from GraphService
    if (this.form.value.selectedDataStructure === 'graph') {
      
      // graphToJSON returns also the configuration and structureType
      // Use only nodes and edges
      const graph = this.graphService.graphToJSON();
      const graphDataJSON: IGraphDataJSON = { nodes: graph.nodes, edges: graph.edges };

      // Clone GraphService content
      const clonedGraphContent: IGraphDataJSON = JSON.parse(JSON.stringify(graphDataJSON));

      // Update the graph structure according to the mode. It can be initial structure or example solution
      if (mode === 'solution') {
        this.solutionGraphStructure[step] = clonedGraphContent;
      } else if (mode === 'assignment') {
        this.assignmentGraphStructure = clonedGraphContent;
      }
    }

    // ## CASE 2: Bst -> get data from BstService
    else if (this.form.value.selectedDataStructure === 'tree') {

      // Clone BstService content
      const rootNodeJSON = this.bstService.treeToJSON();
      const clonedBstContent: IBstNodeJSON = JSON.parse(JSON.stringify(rootNodeJSON));

      // Update the bst structure according to the mode. It can be initial structure or example solution
      if (mode === 'solution') {
        this.solutionBstStructure[step] = clonedBstContent;
      } else if (mode === 'assignment') {
        this.assignmentBstStructure = clonedBstContent;
      }
    }
  }

  //TODO:
  activateWorkspace() {
    // Display workspace
    this.workspaceIsActive = true;

    // Indicates that the structure content is not empty
    // To reset structure content in case assignment configuration changes 
    this.structureIsSet = true;


    // ## CASE 1: Graph Assignment -> Set GraphService
    if (this.form.controls['selectedDataStructure'].value === 'graph') {

      // Get Graph Configuration from form data
      this.graphService.configureGraph({
        nodeVisited: this.form.value.checkboxNodeVisited,
        nodeWeight: this.form.value.checkboxNodeWeighted,
        edgeWeight: this.form.value.checkboxEdgeWeighted,
        edgeDirected: this.form.value.checkboxEdgeDirected, 
      })

      // Clone the graph structure according to the mode. It can be initial structure or example solution
      let clonedGraphContent!: IGraphDataJSON;
      if (this.workspaceModeCurrent === 'assignment') {
        clonedGraphContent = JSON.parse(JSON.stringify(this.assignmentGraphStructure)); 
      } else if (this.workspaceModeCurrent === 'solution') {
        clonedGraphContent = JSON.parse(JSON.stringify(this.solutionGraphStructure[this.solutionStepCurrent])); 
      }

      // Load workspace to the service
      this.loadWorkspaceContent({
        graphContent: clonedGraphContent,
        graphConfiguration: {
          nodeVisited: this.form.value.checkboxNodeVisited,
          nodeWeight: this.form.value.checkboxNodeWeighted,
          edgeWeight: this.form.value.checkboxEdgeWeighted,
          edgeDirected: this.form.value.checkboxEdgeDirected,
          }
      });
    }


    // ## CASE 2: Bst Assignment -> Set BstService
    else if (this.form.controls['selectedDataStructure'].value === 'tree') {

      // Clone the bst structure (initialStructure) and load to the service
      if (this.workspaceModeCurrent === 'assignment') {
        const clonedBstContent: IBstNodeJSON = JSON.parse(JSON.stringify(this.assignmentBstStructure));
        this.loadWorkspaceContent({bstContent: clonedBstContent});
      } 
      
      // Clone the bst structure (exampleSolution) and load to the service
      else if (this.workspaceModeCurrent === 'solution') {
        const clonedBstContent: IBstNodeJSON = JSON.parse(JSON.stringify(this.solutionBstStructure[this.solutionStepCurrent]));
        this.loadWorkspaceContent({bstContent: clonedBstContent});
      }
    }
  }

  deactivateWorkspace() {
    // Hide workspace
    this.workspaceIsActive = false;
    
    // Save recent updated workspace content 
    this.saveWorkspaceContent(this.workspaceModePrevious, this.solutionStepCurrent);
    
    // Reset the content in services for future use
    this.graphService.resetGraph();
    this.bstService.resetTree();
  }

  resetWorkspaceContent() {
    this.structureIsSet = false;

    // Reset Services
    this.graphService.resetGraph();
    this.bstService.resetTree();

    // Reset Workspace State
    this.workspaceModePrevious = 'assignment';
    this.workspaceModeCurrent = 'assignment';
    this.solutionStepCurrent = 0;
    this.solutionStepPrevious = 0;
    this.assignmentBstStructure = null;
    this.solutionBstStructure = [];
    this.assignmentGraphStructure = {
      nodes: [], edges: []
    };
    this.solutionGraphStructure = [];
  }

  addNewSolutionStep() {
    // Before adding new step, the current step need to be saved
    this.saveWorkspaceContent(this.workspaceModePrevious, this.solutionStepPrevious);

    // Add new solution

    // ## Case 1: Bst
    if (this.form.value.selectedDataStructure === 'tree') {

      // Use the data of the last step for the new step if exists ; else use assignment data
      let last: IBstNodeJSON | null;
      
      if (this.solutionBstStructure.length !== 0) {
        last = this.solutionBstStructure[this.solutionBstStructure.length - 1];
      } 
      else {
        if (this.assignmentBstStructure !== undefined) {
          last = this.assignmentBstStructure;
        } else {
          last = null;
        }
      }

      // Clone the data to use values and not references
      const cloned = JSON.parse(JSON.stringify(last));

      // Add it to the solution steps
      this.solutionBstStructure.push(cloned);

      // Set the current step
      this.solutionStepCurrent = this.solutionBstStructure.length - 1;
      this.solutionStepPrevious = this.solutionBstStructure.length - 1;
    }


    // ## Case 2: Graph
    if (this.form.value.selectedDataStructure === 'graph') {

      // Use the data of the last step for the new step if exists ; else use assignment data
      let last: IGraphDataJSON;

      if (this.solutionGraphStructure.length !== 0) {
        last = this.solutionGraphStructure[this.solutionGraphStructure.length - 1];
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
      this.solutionGraphStructure.push(cloned);

      // Set the current step
      this.solutionStepCurrent = this.solutionGraphStructure.length - 1;
      this.solutionStepPrevious = this.solutionGraphStructure.length - 1;
    }

    // call updateWorkspace function for other needed updates required related to the step change
    this.updateWorkspace();
  }
  
  // #######################################################
  // Assignment Content Related

  onCreateAssignment(): void {
    let newAssignment: Partial<IAssignment>;
    try {
      newAssignment = this.getFormValuesAsAssignment();
    } catch (err) {
      console.error(err);
      alert(err);
      return;
    }

    // Add new assignment
    this.assignmentService.createAssignment(newAssignment);

    // Route to the route 'assignments'
    this.navigateToRoute('assignments');
  }

  onDownloadAssignmentAsJSON(): void {
    let newAssignment: Partial<IAssignment>;
    try {
      newAssignment = this.getFormValuesAsAssignment();
    } catch (err) {
      console.error(err);
      alert(err);
      return;
    }

    // Download new assignment as json file
    downloadJSON(newAssignment, `${newAssignment.title}_assignment`);
  }

  getFormValuesAsAssignment(): Partial<IAssignment> {
    if (!this.form.valid) {
      throw new Error('Form is invalid.');
    }

    const newAssignment: Partial<IAssignment> = {
      title: this.form.value.title,
      text: this.form.value.text,
      stepsEnabled: this.form.value.stepsEnabled,
      dataStructure: this.form.value.selectedDataStructure,
      type: this.form.value.selectedAssignmentType,
      maxPoints: this.form.value.maxPoints
    };

    // Set configuration for graph or tree according to the selected dataStructure
    if (this.form.value.selectedDataStructure === "graph") {
      
      newAssignment.initialStructure = {
        nodes: this.assignmentGraphStructure.nodes,
        edges: this.assignmentGraphStructure.edges,
      }

      newAssignment.expectedSolution = this.solutionGraphStructure;
      
      newAssignment.graphConfiguration = {
        nodeWeight: this.form.value.checkboxNodeWeighted,
        nodeVisited: this.form.value.checkboxNodeVisited,
        edgeWeight: this.form.value.checkboxEdgeWeighted,
        edgeDirected: this.form.value.checkboxEdgeDirected,
      }

    } 
    else if (this.form.value.selectedDataStructure === "tree") { 
      newAssignment.initialStructure = this.assignmentBstStructure;
      newAssignment.expectedSolution = this.solutionBstStructure;
    }
    
    return newAssignment;
  }

  importAssignmentFromJSON(jsonString: string): void {
    try {
      this.resetWorkspaceContent();
      
      const assignment: IAssignment = JSON.parse(jsonString);

      // Update form controls
      this.form.patchValue({
        title: assignment.title,
        stepsEnabled: assignment.stepsEnabled,
        text: assignment.text,
        selectedDataStructure: assignment.dataStructure,
        selectedAssignmentType: assignment.type,
        maxPoints: assignment.maxPoints || 100,
        checkboxEdgeDirected: assignment.graphConfiguration?.edgeDirected || false,
        checkboxEdgeWeighted: assignment.graphConfiguration?.edgeWeight || false,
        checkboxNodeWeighted: assignment.graphConfiguration?.nodeWeight || false,
        checkboxNodeVisited: assignment.graphConfiguration?.nodeVisited || false
      });

      // Update graph or tree based on the data structure
      if (assignment.dataStructure === 'graph') {
        // assignment.graphConfiguration!.initialNodeData, assignment.graphConfiguration!.initialEdgeData
        const clonedInitialStructure: IGraphDataJSON = JSON.parse(JSON.stringify(assignment.initialStructure))
        this.assignmentGraphStructure = clonedInitialStructure;
        
        const clonedExSolGraphSteps: IGraphDataJSON[] = JSON.parse(JSON.stringify(assignment.expectedSolution))
        this.solutionGraphStructure = clonedExSolGraphSteps;

        this.showCheckbox = true; // Show the checkboxes for graph

      } else if (assignment.dataStructure === 'tree') {
        const clonedAssignmentBstContent: IBstNodeJSON = JSON.parse(JSON.stringify(assignment.initialStructure))        
        const clonedExSolBstContent: (IBstNodeJSON | null)[] = JSON.parse(JSON.stringify(assignment.expectedSolution))  
        this.assignmentBstStructure = clonedAssignmentBstContent;      
        this.solutionBstStructure = clonedExSolBstContent;      
        this.showCheckbox = false; // Hide the checkboxes for tree
      }

      // // Activate workspace
      // this.activateWorkspace();
    } catch (err) {
      console.error('Error importing assignment from JSON', err);
      alert('Invalid JSON format');
    }
  }

  onLoadAssignmentFromJSON(event: any): void {
    const file = event.target.files[0];

    if (file) {
      readFile(file)
      .then( (fileContent) => {
        this.importAssignmentFromJSON(fileContent);
      })  
    }
  }

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }

  onChangeAssignmentType(event: any): void {
    const assignmentType = event.target.value;

    if (this.structureIsSet) {
      alert('Der Entwurf wurde zurückgesetzt.')
      this.resetWorkspaceContent();
    }

    // Update form controls according to the assignment type
    if (assignmentType === 'bst_insert' || assignmentType === 'bst_remove') {
      this.form.patchValue({
        stepsEnabled: false,
        selectedDataStructure: 'tree',
      });
      
      this.showCheckbox = false;
    }

    else if (this.form.value.selectedAssignmentType === 'dijkstra') {
      this.form.patchValue({
        stepsEnabled: true,
        selectedDataStructure: 'graph',
        checkboxEdgeDirected: false,
        checkboxEdgeWeighted: true,
        checkboxNodeWeighted: true,
        checkboxNodeVisited: true
      });  
      
      this.showCheckbox = true;
    }
    else if (this.form.value.selectedAssignmentType === 'floyd') {
      this.form.patchValue({
        stepsEnabled: true,
        selectedDataStructure: 'graph',
        checkboxEdgeDirected: true,
        checkboxEdgeWeighted: true,
        checkboxNodeWeighted: false,
        checkboxNodeVisited: true
      });  
      
      this.showCheckbox = true;
    }
    else if (this.form.value.selectedAssignmentType === 'kruskal') {
      this.form.patchValue({
        stepsEnabled: true,
        selectedDataStructure: 'graph',
        checkboxEdgeDirected: false,
        checkboxEdgeWeighted: true,
        checkboxNodeWeighted: false,
        checkboxNodeVisited: false
      }); 

      this.showCheckbox = true;
    }
    else if (this.form.value.selectedAssignmentType === 'transitive_closure') {
      this.form.patchValue({
        stepsEnabled: false,
        selectedDataStructure: 'graph',
        checkboxEdgeDirected: true,
        checkboxEdgeWeighted: false,
        checkboxNodeWeighted: false,
        checkboxNodeVisited: false
      }); 
      
      this.showCheckbox = true; 
    }
    

  }

  onChangeDataStructure(event: any): void {
    const dataStructure = event.target.value;

    if (this.structureIsSet) {
      alert('Der Entwurf wurde zurückgesetzt.')
      this.resetWorkspaceContent();
    }

    // Show checkboxes only if graph structure is selected
    this.showCheckbox = dataStructure === 'graph'; 
  }

  onChangeCheckbox(event: any): void {
    if (this.structureIsSet) {
      alert('Der Entwurf wurde zurückgesetzt.')
      this.resetWorkspaceContent();
    }
  }

}
