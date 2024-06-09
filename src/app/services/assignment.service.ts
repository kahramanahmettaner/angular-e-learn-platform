import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import IAssignment from '../models/Assignment.interface';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  private assignments$ = new BehaviorSubject<IAssignment[]>([]);
  
  constructor() {
    this.init();  
  }

  public init(): void {
    // TODO: fetch assigments from backend and update assignments$
    
    // for now, use dummy data instead
    const dummy_assignments: IAssignment[] = this.dummyData();
    this.assignments$.next(dummy_assignments);
  }

  public getAssignments(): Observable<IAssignment[]> {
    return this.assignments$;
  }

  createAssignment(newAssignment: IAssignment) {
    // TODO:  Send a POST request to the backend to create a new assignment
    
    // for now, add new assignment to the list
    this.assignments$.next([ ...this.assignments$.getValue(), newAssignment])
  }

  public getAssignmentById(id: number): Observable<IAssignment | undefined> {
    return this.assignments$.pipe(
      map((assignments) => assignments.find((assignment) => assignment.id === id))
    );
  }

  // TODO: delete this function
  generateDummyId(): number {
    const assignments = this.assignments$.getValue();
    const maxId = assignments.reduce((max, assignment) => {
      return assignment.id > max ? assignment.id : max;
    }, 0);
    return maxId + 1;
  }

  // TODO: delete this function
  public dummyData(): IAssignment[] {
    return [
      { 
        "id": 1,
        "title": "Aufgabe 1",
        "text": "Text für Aufgabe 1",
        "stepsEnabled": false,
        "dataStructure": "graph",
        "graphConfiguration": {
          "initialNodeData": [],
          "initialEdgeData": [],
          "nodeConfiguration": {
            "weight": false,
            "visited": false
          },
          "edgeConfiguration": {
            "directed": true,
            "weight": true
          }
        }
      },
      {
        "id": 2,
        "title": "Aufgabe 2",
        "text": "Text für Aufgabe 2",
        "stepsEnabled": false,
        "dataStructure": "graph",
        "graphConfiguration": {
          "initialNodeData": [],
          "initialEdgeData": [],
          "nodeConfiguration": {
            "weight": false,
            "visited": false
          },
          "edgeConfiguration": {
            "directed": false,
            "weight": true
          }
        }
      }
    ]
  }
}
