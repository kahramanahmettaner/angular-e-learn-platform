import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import IAssignment from '../models/Assignment.interface';
import { dummyData } from './data';

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
    const dummy_assignments: IAssignment[] = dummyData();
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
}
