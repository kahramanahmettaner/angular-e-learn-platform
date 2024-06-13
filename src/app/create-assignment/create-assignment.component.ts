import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import IAssignment from '../models/Assignment.interface';
import { AssignmentService } from '../services/assignment.service';
import { Router } from '@angular/router';
import { GraphComponent } from '../graph/graph.component';
import { BinarySearchTreeComponent } from '../binary-search-tree/binary-search-tree.component';
import { GraphService } from '../services/graph.service';
import { BinarySearchTreeService } from '../services/binary-search-tree.service';
import { IGraphNodeJSON } from '../models/GraphNodeJSON.interface';
import { Subscription } from 'rxjs';
import { IBstNodeJSON } from '../models/BstNodeJSON.interface';
import { IGraphEdgeJSON } from '../models/GraphEdgeJSON.nterface';
import { readFile, downloadJSON } from '../utils';

@Component({
  selector: 'app-create-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, GraphComponent, BinarySearchTreeComponent],
  templateUrl: './create-assignment.component.html',
  styleUrl: './create-assignment.component.css'
})
export class CreateAssignmentComponent implements OnInit, OnDestroy {

  form: FormGroup;
  options = ['tree', 'graph'];
  showCheckbox = false;

  workspaceIsActive = false;
  initialStructureSet = false;

  graphNodes!: IGraphNodeJSON[];
  graphEdges!: IGraphEdgeJSON[];
  bstRootNode!: IBstNodeJSON | null;

  graphNodesSubscription!: Subscription;
  graphEdgesSubscription!: Subscription;
  bstRootNodeSubscription!: Subscription;

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
      checkboxEdgeDirected: [false],
      checkboxEdgeWeighted: [false],
      checkboxNodeWeighted: [false]
    });

          
    this.graphNodes = [];
    this.graphEdges = [];
  }

  ngOnInit(): void {
    this.resetState();

    // #############################
    // Subscribe to Observables from the graphService and bstService
    this.graphNodesSubscription = this.graphService.getNodes().subscribe( nodes => {
      const tempNodes: IGraphNodeJSON[] = [];
      nodes.forEach(node => {
        const nodeJSON: IGraphNodeJSON = this.graphService.adjustNodeAttributes(node);
        tempNodes.push(nodeJSON);
      });
      this.graphNodes = tempNodes;
    });

    this.graphEdgesSubscription = this.graphService.getEdges().subscribe( edges => {
      const tempEdges: IGraphEdgeJSON[] = [];
      edges.forEach(edge => {
        const edgeJSON: IGraphEdgeJSON = this.graphService.adjustEdgeAttributes(edge);
        tempEdges.push(edgeJSON);
      });
      this.graphEdges = tempEdges;
    });

    this.bstRootNodeSubscription = this.bstService.getRootNode().subscribe( root => {
      this.bstRootNode = this.bstService.getTreeStructure();
    });
  }

  ngOnDestroy(): void {
    
    // #############################
    // Unsubscribe from all subscriptions to prevent memory leaks
    if (this.graphNodesSubscription) {
      this.graphNodesSubscription.unsubscribe();
    }
    if (this.graphEdgesSubscription) {
      this.graphEdgesSubscription.unsubscribe();
    }
    if (this.bstRootNodeSubscription) {
      this.bstRootNodeSubscription.unsubscribe();
    }
  }

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
      id: this.assignmentService.generateDummyId(), // TODO: for now use this function but it should not be given here but in backend
      title: this.form.value.title,
      text: this.form.value.text,
      stepsEnabled: this.form.value.stepsEnabled,
      dataStructure: this.form.value.selectedOption,
    };

    // Set configuration for graph or tree according to the selected dataStructure
    if (this.form.value.selectedOption === "graph") {
      newAssignment.graphConfiguration = {
        initialNodeData: this.graphNodes,
        initialEdgeData: this.graphEdges,
        nodeConfiguration: {
          weight: this.form.value.checkboxNodeWeighted,
          visited: false
        },
        edgeConfiguration: {
          directed: this.form.value.checkboxEdgeDirected,
          weight: this.form.value.checkboxEdgeWeighted
        }
      };
    } else if (this.form.value.selectedOption === "tree") { 
        newAssignment.binarySearchTreeConfiguration = {
          initialRootNode: this.bstService.getTreeStructure(),
        };
    }
    
    return newAssignment;
  }

  importAssignmentFromJSON(jsonString: string): void {
    try {
      const assignment: IAssignment = JSON.parse(jsonString);

      // Update form controls
      this.form.patchValue({
        title: assignment.title,
        stepsEnabled: assignment.stepsEnabled,
        text: assignment.text,
        selectedOption: assignment.dataStructure,
        checkboxEdgeDirected: assignment.graphConfiguration?.edgeConfiguration.directed || false,
        checkboxEdgeWeighted: assignment.graphConfiguration?.edgeConfiguration.weight || false,
        checkboxNodeWeighted: assignment.graphConfiguration?.nodeConfiguration.weight || false
      });

      // Update graph or tree based on the data structure
      if (assignment.dataStructure === 'graph') {
        this.graphService.graphDataFromJSON(assignment.graphConfiguration!.initialNodeData, assignment.graphConfiguration!.initialEdgeData);
        this.showCheckbox = true; // Show the checkboxes for graph
      } else if (assignment.dataStructure === 'tree') {
        this.bstService.createTreeFromJSON(assignment.binarySearchTreeConfiguration!.initialRootNode);
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

    if (this.initialStructureSet) {
      alert('Der Entwurf wurde zurückgesetzt.')
      this.resetState();
    }

    // Show checkboxes only if graph structure is selected
    this.showCheckbox = option === 'graph'; 
  }

  onChangeCheckbox(event: any): void {
    if (this.initialStructureSet) {
      alert('Der Entwurf wurde zurückgesetzt.')
      this.resetState();
    }
  }

  resetState() {
    this.initialStructureSet = false;
    this.graphService.resetGraph();
    this.bstService.resetTree();
  }

  activateWorkspace() {
    this.workspaceIsActive = true;
    this.initialStructureSet = true;

    if (this.form.controls['selectedOption'].value === 'graph') {

      // Set Graph Configuration
      this.graphService.configureGraph({
        nodes: {
          visited: false,
          weight: this.form.value.checkboxNodeWeighted
        },
        edges: {
          directed: this.form.value.checkboxEdgeDirected,
          weight: this.form.value.checkboxEdgeWeighted
        }
      })
    }
    
  }

  deactivateWorkspace() {
    this.workspaceIsActive = false;
  }
}
