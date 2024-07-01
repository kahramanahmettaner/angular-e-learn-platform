import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import IAssignment from '../models/Assignment.interface';
import { dummyData } from './data';
import { ISubmission } from '../models/Submission.interface';
import { IBstNodeSemantic } from '../models/BstNodeSemantic.interface';
import { binarySearchTreeSemantic, downloadJSON, graphEdgeJSONToSemantic, graphJSONToSemantic, graphNodeJSONToSemantic, graphNodeToSemantic } from '../utils';
import { BinarySearchTreeService } from './binary-search-tree.service';
import { IGraphDataSemantic } from '../models/GraphDataSemantic.interface';
import { IGraphNodeSemantic } from '../models/GraphNodeSemantic.interface';
import { IGraphEdgeSemantic } from '../models/GraphEdgeSemantic.interface';
import { IGraphDataJSON } from '../models/GraphDataJSON.interface';
import { IBstNodeJSON } from '../models/BstNodeJSON.interface';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  private assignments$ = new BehaviorSubject<IAssignment[]>([]);
  private currentAssignment$: BehaviorSubject<IAssignment | null> = new BehaviorSubject<IAssignment | null>(null);
  
  private solutionGraph$: BehaviorSubject<IGraphDataJSON[]> = new BehaviorSubject<IGraphDataJSON[]>([]);
  private solutionBst$: BehaviorSubject<(null | IBstNodeJSON)[]> = new BehaviorSubject<(null | IBstNodeJSON)[]>([]);

  private submission$: BehaviorSubject<ISubmission> = new BehaviorSubject<ISubmission>({ 
    promptForLLM: {
      role: "E-Tutor für Informatik-Studenten",
      description: "Du sollst Informatik-Studenten helfen, verschiedene Themen besser zu verstehen, insbesondere Graph-Strukturen, Binäre-Suchbäume-Strukturen und Ableitungsbäume-Strukturen. Du wirst Aufgaben und die Lösungen der Studenten als JSON-Dateien erhalten. Deine Aufgabe ist es, die Lösung des Studenten zu bewerten, ihm dabei zu helfen, zu verstehen, ob und was er falsch gemacht hat, und dabei zu versuchen, sein Verständnis für das Thema zu verbessern. Diese Erklärung sollte nicht sehr lang sein. Deswegen brauchst du nicht mehr zu wiederholen was Aufgabe ist oder was Lösung der Student ist. Erkläre nur, ob die Lösung richtig oder falsch ist, was genau in der Lösung richtig oder falsch ist, und wie man vorgehen könnte für richtige Antwort. Wenn Lösung falsch ist, zeige die richtige Lösung.",
  },
    assignmentTitle: '',
    assignmentDescription: '',
    dataStructure: ''
  });
  
  constructor(private bstService: BinarySearchTreeService) {
    this.init();
  }

  public init(): void {
    // TODO: fetch assigments from backend and update assignments$
    
    // for now, use dummy data instead
    const dummy_assignments: IAssignment[] = dummyData();
    this.assignments$.next(dummy_assignments);
  }

  // ##########
  // Assignment

  getAssignments(): Observable<IAssignment[]> {
    return this.assignments$;
  }

  getCurrentAssignment(): Observable<IAssignment | null> {
    return this.currentAssignment$;
  } 

  createAssignment(newAssignment: IAssignment) {
    // TODO:  Send a POST request to the backend to create a new assignment
    
    // for now, add new assignment to the list
    this.assignments$.next([ ...this.assignments$.getValue(), newAssignment]);
  }

  setCurrentAssignment(id: number): void {
  
    const assignments = this.assignments$.getValue();
    
    const assignment: IAssignment | undefined = assignments.find( assignment => assignment.id === id )
    if (assignment !== undefined) {
      this.currentAssignment$.next(assignment);



      // binary search tree
      if (assignment.dataStructure === 'tree') {
        const initialStructureJSON = assignment.binarySearchTreeConfiguration?.initialRootNode;
        let initialStructureSemantic = null;
        if (initialStructureJSON !== null && initialStructureJSON !== undefined) {
         initialStructureSemantic = binarySearchTreeSemantic(initialStructureJSON);
        }

        //this.solutionBst$.next([null]);
        this.solutionBst$.next([]);
        this.addNewSolutionStep();
        this.submission$.next({
          promptForLLM: this.submission$.getValue().promptForLLM,
          assignmentTitle: assignment.title,
          assignmentDescription: assignment.text,
          dataStructure: assignment.dataStructure,
          binarySearchTree: {
            initialStructure: initialStructureSemantic,
            solution: []
          }
        })
      }

      // graph
      else if (assignment.dataStructure === 'graph') {
        const initialNodesJSON = assignment.graphConfiguration?.initialNodeData;
        const initialEdgesJSON = assignment.graphConfiguration?.initialEdgeData;
        

        // TODO: fix so that it is not required to check this here 
        if (initialNodesJSON === undefined || initialEdgesJSON === undefined) {
          throw new Error('No graph data.')
        }

        const nodeConfig = assignment.graphConfiguration?.nodeConfiguration;
        const edgeConfig = assignment.graphConfiguration?.edgeConfiguration;
        
        // TODO: fix so that it is not required to check this here 
        if (nodeConfig === undefined || edgeConfig === undefined) {
          throw new Error('No graph configuration.')
        }

        const initialStructureSemantic: IGraphDataSemantic = graphJSONToSemantic({ 
          nodes: initialNodesJSON, edges: initialEdgesJSON 
        })

        this.submission$.next({
          promptForLLM: this.submission$.getValue().promptForLLM,
          assignmentTitle: assignment.title,
          assignmentDescription: assignment.text,
          dataStructure: assignment.dataStructure,
          graph: {
            configuration: {
              nodes: nodeConfig,
              edges: edgeConfig,
            },
            initialStructure: initialStructureSemantic,
            solution: []
          }
        })
        //this.solutionGraph$.next([{nodes: [], edges: []}]);
        this.solutionGraph$.next([]);
        this.addNewSolutionStep();
      }

      // TODO: handle this case better
      else {
        throw new Error('Unknown data structure.')
      }
  
      return;
    }
    
    this.currentAssignment$.next(null);
  }

  getAssignmentById(id: number): Observable<IAssignment | undefined> {
    return this.assignments$.pipe(
      map((assignments) => assignments.find((assignment) => assignment.id === id))
    );
  }

  
  // ##########
  // Solution

  
  // getSubmission(): Observable<ISubmission> {
  //   return this.submission$;
  // }

  getSolutionBst(): Observable<(null | IBstNodeJSON)[]> {
    return this.solutionBst$;
  }
  
  getSolutionGraph(): Observable<IGraphDataJSON[]> {
    return this.solutionGraph$;
  }

  updateSolutionBst(newSolution: IBstNodeJSON | null , stepIndex: number = 0): void {
    this.solutionBst$.getValue()[stepIndex] = newSolution;
    this.solutionBst$.next(this.solutionBst$.getValue());
  }

  updateSolutionGraph(newSolution: IGraphDataJSON , stepIndex: number = 0): void {
    this.solutionGraph$.getValue()[stepIndex] = newSolution;
    this.solutionGraph$.next(this.solutionGraph$.getValue());
  }

  addNewSolutionStep() {
    if (this.currentAssignment$.getValue()?.dataStructure === 'tree') {
      
      // Use the data of the last step for the new step if exists ; else use assignment data
      let last: IBstNodeJSON | null;

      const bstSolutions = this.solutionBst$.getValue();
      if (bstSolutions.length !== 0) {
        last = bstSolutions[bstSolutions.length - 1];
      } 
      else {
        const root = this.currentAssignment$.getValue()?.binarySearchTreeConfiguration?.initialRootNode;
        if (root !== undefined) {
          last = root
        } else {
          last = null;
        }
      }

      // Clone the data to use values and not references
      const cloned = JSON.parse(JSON.stringify(last));

      // Add it to the solution steps
      this.solutionBst$.next([...this.solutionBst$.getValue(), cloned]);
    } 
    else if (this.currentAssignment$.getValue()?.dataStructure === 'graph') {
      
      // Use the data of the last step for the new step if exists ; else use assignment data
      let last: IGraphDataJSON;

      const graphSolutions = this.solutionGraph$.getValue();
      if (graphSolutions.length !== 0) {
        last = graphSolutions[graphSolutions.length - 1];
      } 
      else {
        const graphNodes = this.currentAssignment$.getValue()?.graphConfiguration?.initialNodeData;
        const graphEdges = this.currentAssignment$.getValue()?.graphConfiguration?.initialEdgeData;
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
      this.solutionGraph$.next([...this.solutionGraph$.getValue(), cloned]);
    }
  }

  checkSolution(): string {
    const submission = this.submission$.getValue();
  
    // TODO: do not update submission here to add solution: 
    if (submission.dataStructure === 'tree') {

      if (submission.binarySearchTree) { 
        const solutionBstSemantic: (IBstNodeSemantic | null)[] = []
        this.solutionBst$.getValue().forEach(bstData => {
          let bstDataSemantic = null;
          if (bstData !== null) {
            bstDataSemantic = binarySearchTreeSemantic(bstData);
          }
          solutionBstSemantic.push(bstDataSemantic);
        });
        submission.binarySearchTree.solution = solutionBstSemantic;  
      }

    } else if (submission.dataStructure === 'graph') {

      if (submission.graph) { 
        const solutionGraphSemantic: IGraphDataSemantic[] = []
        this.solutionGraph$.getValue().forEach(graphData => {
          const graphDataSemantic = graphJSONToSemantic(graphData);
          solutionGraphSemantic.push(graphDataSemantic);
        });
        submission.graph.solution = solutionGraphSemantic;  
      }

    } 

    //downloadJSON(submission);
    return JSON.stringify(submission, null, 2);
  }

  // TODO: delete this function
  generateDummyId(): number {
    const assignments = this.assignments$.getValue();
    const maxId = assignments.reduce((max, assignment) => {
      return assignment.id > max ? assignment.id : max;
    }, 0);
    return maxId + 1;
  }
}
