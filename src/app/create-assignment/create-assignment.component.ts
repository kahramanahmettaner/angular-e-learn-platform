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
import { IGraphNodeJSON } from '../models/GraphNodeJSON.interface';
import { IBstNodeJSON } from '../models/BstNodeJSON.interface';
import { IGraphEdgeJSON } from '../models/GraphEdgeJSON.interface';
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
  options = ['tree', 'graph'];
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
      selectedOption: ['', Validators.required],
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
      if (this.form.value.selectedOption === 'graph') {
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
            nodes: {
              visited: this.form.value.checkboxNodeVisited,
              weight: this.form.value.checkboxNodeWeighted
            },
            edges: {
              directed: this.form.value.checkboxEdgeDirected,
              weight: this.form.value.checkboxEdgeWeighted
            }}
        });
      }

      // ## CASE 1.2: Bst -> Set BstService
      else if (this.form.value.selectedOption === 'tree') {
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
      if (this.form.value.selectedOption === 'graph') {

        // Clone the graph content and load it to the GraphService
        const clonedGraphContent: IGraphDataJSON = JSON.parse(JSON.stringify(this.assignmentGraphStructure));
        this.loadWorkspaceContent({
          graphContent: clonedGraphContent,
          graphConfiguration: {
            nodes: {
              visited: this.form.value.checkboxNodeVisited,
              weight: this.form.value.checkboxNodeWeighted
            },
            edges: {
              directed: this.form.value.checkboxEdgeDirected,
              weight: this.form.value.checkboxEdgeWeighted
            }}
        });
      }

      // ## CASE 2.2: Bst -> Set BstService
      else if (this.form.value.selectedOption === 'tree') {
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
    if (this.form.value.selectedOption === 'graph') {

      // Reset Graph Service to ensure the previous content is removed
      this.graphService.resetGraph();

      // If graph configuration is provided, set it 
      if (graphConfiguration) {
        this.graphService.configureGraph({
          "nodes": graphConfiguration.nodes,
          "edges": graphConfiguration.edges
        })
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
    else if (this.form.value.selectedOption === 'tree') {
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
    if (this.form.value.selectedOption === 'graph') {
      
      // Clone GraphService content
      const graphDataJSON = this.graphService.graphToJSON();
      const clonedGraphContent: IGraphDataJSON = JSON.parse(JSON.stringify(graphDataJSON));

      // Update the graph structure according to the mode. It can be initial structure or example solution
      if (mode === 'solution') {
        this.solutionGraphStructure[step] = clonedGraphContent;
      } else if (mode === 'assignment') {
        this.assignmentGraphStructure = clonedGraphContent;
      }
    }

    // ## CASE 2: Bst -> get data from BstService
    else if (this.form.value.selectedOption === 'tree') {

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
    if (this.form.controls['selectedOption'].value === 'graph') {

      // Get Graph Configuration from form data
      this.graphService.configureGraph({
        nodes: {
          visited: this.form.value.checkboxNodeVisited,
          weight: this.form.value.checkboxNodeWeighted
        },
        edges: {
          directed: this.form.value.checkboxEdgeDirected,
          weight: this.form.value.checkboxEdgeWeighted
        }
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
          nodes: {
            visited: this.form.value.checkboxNodeVisited,
            weight: this.form.value.checkboxNodeWeighted
          },
          edges: {
            directed: this.form.value.checkboxEdgeDirected,
            weight: this.form.value.checkboxEdgeWeighted
          }}
      });
    }


    // ## CASE 2: Bst Assignment -> Set BstService
    else if (this.form.controls['selectedOption'].value === 'tree') {

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
    if (this.form.value.selectedOption === 'tree') {

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
    if (this.form.value.selectedOption === 'graph') {

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
    let newAssignment: IAssignment;
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
    let newAssignment: IAssignment;
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

  getFormValuesAsAssignment(): IAssignment {
    if (!this.form.valid) {
      throw new Error('Form is invalid.');
    }

    const newAssignment: IAssignment = {
      id: this.assignmentService.generateDummyId(), // TODO: for now use this function but id should not be given here but in backend
      title: this.form.value.title,
      text: this.form.value.text,
      stepsEnabled: this.form.value.stepsEnabled,
      dataStructure: this.form.value.selectedOption,
    };

    // Set configuration for graph or tree according to the selected dataStructure
    if (this.form.value.selectedOption === "graph") {
      
      newAssignment.graphConfiguration = {
        initialNodeData: this.assignmentGraphStructure.nodes,
        initialEdgeData: this.assignmentGraphStructure.edges,
        exampleSolutionSteps: this.solutionGraphStructure,
        nodeConfiguration: {
          weight: this.form.value.checkboxNodeWeighted,
          visited: this.form.value.checkboxNodeVisited
        },
        edgeConfiguration: {
          directed: this.form.value.checkboxEdgeDirected,
          weight: this.form.value.checkboxEdgeWeighted
        }
      };

    } else if (this.form.value.selectedOption === "tree") { 
        newAssignment.binarySearchTreeConfiguration = {
          initialRootNode: this.assignmentBstStructure,
          exampleSolutionSteps: this.solutionBstStructure
        };
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
        selectedOption: assignment.dataStructure,
        checkboxEdgeDirected: assignment.graphConfiguration?.edgeConfiguration.directed || false,
        checkboxEdgeWeighted: assignment.graphConfiguration?.edgeConfiguration.weight || false,
        checkboxNodeWeighted: assignment.graphConfiguration?.nodeConfiguration.weight || false,
        checkboxNodeVisited: assignment.graphConfiguration?.nodeConfiguration.visited || false
      });

      // Update graph or tree based on the data structure
      if (assignment.dataStructure === 'graph') {
        // assignment.graphConfiguration!.initialNodeData, assignment.graphConfiguration!.initialEdgeData
        const clonedAssignmentGraphNodes: IGraphNodeJSON[] = JSON.parse(JSON.stringify(assignment.graphConfiguration!.initialNodeData))
        const clonedAssignmentGraphEdges: IGraphEdgeJSON[] = JSON.parse(JSON.stringify(assignment.graphConfiguration!.initialEdgeData))
        this.assignmentGraphStructure = {
          nodes: clonedAssignmentGraphNodes,
          edges: clonedAssignmentGraphEdges,
        }
        const clonedExSolGraphSteps: IGraphDataJSON[] = JSON.parse(JSON.stringify(assignment.graphConfiguration!.exampleSolutionSteps))
        this.solutionGraphStructure = clonedExSolGraphSteps;

        this.showCheckbox = true; // Show the checkboxes for graph

      } else if (assignment.dataStructure === 'tree') {
        const clonedAssignmentBstContent: IBstNodeJSON = JSON.parse(JSON.stringify(assignment.binarySearchTreeConfiguration!.initialRootNode))        
        const clonedExSolBstContent: (IBstNodeJSON | null)[] = JSON.parse(JSON.stringify(assignment.binarySearchTreeConfiguration!.exampleSolutionSteps))  
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

  onChangeOption(event: any): void {
    const option = event.target.value;

    if (this.structureIsSet) {
      alert('Der Entwurf wurde zurückgesetzt.')
      this.resetWorkspaceContent();
    }

    // Show checkboxes only if graph structure is selected
    this.showCheckbox = option === 'graph'; 
  }

  onChangeCheckbox(event: any): void {
    if (this.structureIsSet) {
      alert('Der Entwurf wurde zurückgesetzt.')
      this.resetWorkspaceContent();
    }
  }

}
