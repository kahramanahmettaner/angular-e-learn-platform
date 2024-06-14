import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import IAssignment from '../models/Assignment.interface';
import { dummyData } from './data';
import { ISubmission } from '../models/Submission.interface';
import { IBstNodeSemantic } from '../models/BstNodeSemantic.interface';
import { binarySearchTreeSemantic, downloadJSON } from '../utils';
import { BinarySearchTreeService } from './binary-search-tree.service';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  private assignments$ = new BehaviorSubject<IAssignment[]>([]);
  private currentAssignment$: BehaviorSubject<IAssignment | null> = new BehaviorSubject<IAssignment | null>(null);
  private submission$: BehaviorSubject<ISubmission> = new BehaviorSubject<ISubmission>({ 
    promptForLLM: {
      role: "E-Tutor für Informatik-Studenten",
      description: "Du sollst Informatik-Studenten helfen, verschiedene Themen besser zu verstehen, insbesondere Graph-Strukturen, Binäre-Suchbäume-Strukturen und Ableitungsbäume-Strukturen. Du wirst Aufgaben und die Lösungen der Studenten als JSON-Dateien erhalten. Deine Aufgabe ist es, die Lösung des Studenten zu bewerten, ihm dabei zu helfen, zu verstehen, ob und was er falsch gemacht hat, und dabei zu versuchen, sein Verständnis für das Thema zu verbessern. Diese Erklärung sollte nicht sehr lang sein. Deswegen brauchst du nicht mehr zu wiederholen was Aufgabe ist oder was Lösung der Student ist. Erkläre nur, ob die Lösung richtig oder falsch ist, was genau in der Lösung richtig oder falsch ist, und wie man vorgehen könnte für richtige Antwort. Wenn Lösung falsch ist, zeige die richtige Lösung.",
  },
    assignmentTitle: '',
    assignmentDescription: '',
    initialStructure: null,
    solution: null 
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
      const initialStructureJSON = assignment.binarySearchTreeConfiguration?.initialRootNode;
      let initialStructureSemantic = null;
      if (initialStructureJSON !== null && initialStructureJSON !== undefined) {
       initialStructureSemantic = binarySearchTreeSemantic(initialStructureJSON);
      }

      this.submission$.next({
        ...this.submission$.getValue(),
        assignmentTitle: assignment.title,
        assignmentDescription: assignment.text,
        initialStructure: initialStructureSemantic,
        solution: null
      })
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

  
  getSubmission(): Observable<ISubmission> {
    return this.submission$;
  }

  updateSolution(solution: IBstNodeSemantic | null): void {
    const currentSubmission = this.submission$.getValue();
    
    this.submission$.next({ 
      ...currentSubmission,
      solution 
    });
  }

  checkSolution(): string {
    const submission = this.submission$.getValue();
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
