import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import IAssignment from '../models/Assignment.interface';
import { BinarySearchTreeService } from './binary-search-tree.service';
import { HttpClient } from '@angular/common/http';
import { IBstNodeJSON } from '../models/BstNodeJSON.interface';
import { IGraphDataJSON } from '../models/GraphDataJSON.interface';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  private assignments$ = new BehaviorSubject<IAssignment[]>([]);
  private solutionFeedback$ = new BehaviorSubject<string>('');

  constructor(
    private httpClient: HttpClient
  ) {
    this.init();
  }

  public init(): void {
    
    this.fetchAssignments()

  }


  // ##########
  // API Calls

  private fetchAssignments() {
    
    this.httpClient.get<IAssignment[]>('http://localhost:3000/assignments').subscribe( assigment => {
      this.assignments$.next(assigment);
    })

  }  

  createAssignment(newAssignment: Partial<IAssignment>) {
    return this.httpClient.post('http://localhost:3000/assignments', newAssignment).subscribe( data => {
      console.log(data);
    })
  }  

  submitSolution(assignmentId: number, studentSolution: (IBstNodeJSON | null)[] | IGraphDataJSON[]) {
    this.httpClient.post(
      'http://localhost:3000/student-solutions', 
      {
        assignmentId, studentSolution
      }).subscribe( (data: any) => {
        this.solutionFeedback$.next(data.feedback);
    })
  }

  checkSolution(): string {
    return 'NOT IMPLEMENTED!'
  }

  // ##########
  // Assignment

  getAssignments(): Observable<IAssignment[]> {
    return this.assignments$;
  }

  getAssignmentById(id: number): Observable<IAssignment | undefined> {
    return this.assignments$.pipe(
      map((assignments) => assignments.find((assignment) => assignment.id === id))
    );
  }

  getFeedback(): Observable<string> {
    return this.solutionFeedback$;
  }

}
