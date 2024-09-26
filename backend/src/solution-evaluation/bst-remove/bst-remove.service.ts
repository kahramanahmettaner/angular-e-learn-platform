import { Injectable } from '@nestjs/common';
import { IBstNodeJSON } from 'src/models/BstNodeJSON.interface';
import { convertBstToArray, getBstHeight } from '../utils/bst-utils';

@Injectable()
export class BstRemoveService {
    

    evaluateSolution(initialStructure: IBstNodeJSON, studentSolution: IBstNodeJSON[], expectedSolution: IBstNodeJSON[], maxPoints: number) {
        
        // Convert BST structure from object repesentation to array representation 
        const initialBstHeight = getBstHeight(initialStructure);
        const initialBstArray = convertBstToArray(initialStructure, initialBstHeight);
    
        const studentSolutionArray = []
        studentSolution.forEach( currentStepBst => {
            const studentBstHeight = getBstHeight(currentStepBst);
            const currentStepBstArray = convertBstToArray(currentStepBst, studentBstHeight);
            studentSolutionArray.push(currentStepBstArray);
        });
    
        const expectedBstsArray = []
        expectedSolution.forEach( currentStepBst => {
            const expectedBstHeight = getBstHeight(currentStepBst);
            const currentStepBstArray = convertBstToArray(currentStepBst, expectedBstHeight);
            expectedBstsArray.push(currentStepBstArray);
        });


        // Get nodes to delete
        const nodesToDelete: (string)[] = [];
        for (let stepIndex = 0; stepIndex < expectedBstsArray.length; stepIndex++) {

            const currentStepBst: (string | null)[] = expectedBstsArray[stepIndex];
            const prevStepBst: (string | null)[] = stepIndex > 0 ? expectedBstsArray[stepIndex-1] : initialBstArray;
            
            const currentStepNodesToDelete = this.extractNodesToDelete(prevStepBst, currentStepBst);
            const currentStepNodesInserted = this.extractNodesToDelete(currentStepBst, prevStepBst);

            if (currentStepNodesToDelete.length !== 1) {
                throw new Error('Invalid expected solution. In each new solution step, one single node must be removed.');
            }
            if (currentStepNodesInserted.length > 0) {
               throw new Error('Invalid expected solution. No node can be inserted.');
            }
            nodesToDelete.push(currentStepNodesToDelete[0])
        }
        
        // Generate all possible solutions
        const allPossibleSolutions = this.generatePossibleSolutions(initialBstArray, nodesToDelete);

        let receivedPoints = 0;
        let feedback = ''; 
        
        // Iterate through each generated possible solution to evaluate against the student's submission
        allPossibleSolutions.forEach( (possibleSolution: (string|null)[][]) => {
            // Evaluate the student's solution using the current possible solution and accumulate points and feedback
            const { possibleReceivedPoints, possibleFeedback } = this.evaluatePossibleSolution(
                initialBstArray, studentSolutionArray, possibleSolution, maxPoints
            );
            
            // Update the received points and feedback if the current evaluation yields a higher score
            if (possibleReceivedPoints >= receivedPoints) {
                receivedPoints = possibleReceivedPoints;
                feedback = possibleFeedback;
            }

        })

        // Return the total points received and the corresponding feedback
        return {
            receivedPoints, feedback
        }
    }

    evaluatePossibleSolution(initialBstArray: (string | null)[], studentSolution: (string | null)[][], possibleSolution: (string | null)[][], maxPoints: number) {

        // Calculate the maximum points per step by dividing maxPoints with the number of correct steps
        const stepMaxPoints = maxPoints / possibleSolution.length;
        let receivedPoints = 0;
        let feedback: string = '';
        let violation = false; // Flag to indicate if there is a violation in the student's solution
        const lastEvaluatedIndex = 0;

        
        // Loop through each step in the student's solution
        for (let stepIndex = 0; stepIndex < studentSolution.length; stepIndex++) {
            
            // Check if the number of steps in the student's solution exceeds the expected number of steps
            if (stepIndex >= possibleSolution.length) {
                feedback = 'Die Anzahl der Lösungsschritte überschreitet maximalen erwarteten Schritte.\n'
                feedback += `\n> Insgesamt erzielte Punkte: ${receivedPoints.toFixed(2)} / ${maxPoints}.`
                return {
                    feedback,
                    receivedPoints: 0
                }
            }

            const studentStepBst = studentSolution[stepIndex];
            const expectedStepBst = possibleSolution[stepIndex];
            const prevStepBst = stepIndex > 0 ? possibleSolution[stepIndex-1] : initialBstArray;

            feedback += `> Schritt ${stepIndex + 1}: `;
            
            const nodesToRemove = this.extractNodesToDelete(prevStepBst, expectedStepBst);
            const studentRemovedNodes = this.extractNodesToDelete(prevStepBst, studentStepBst);
            const studentInsertedNodes = this.extractNodesToDelete(studentStepBst, prevStepBst);
            
            // Ensure that exactly one node is removed in each step
            if (studentRemovedNodes.length !== 1) {
                feedback += 'In jedem Schritt muss genau ein Knoten gelöscht werden.'
                feedback += '\n###############\n\n'
                violation = true;
                break;
            }

            // Check if the correct edge is removed
            if (nodesToRemove[0] === null || studentRemovedNodes[0] !== nodesToRemove[0]) {
                feedback += 'Ein falscher Knoten wurde gelöscht.'
                feedback += '\n###############\n\n'
                violation = true;
                break;
            }

            // Ensure that no nodes are inserted
            if (studentInsertedNodes.length !== 0) {
                feedback += 'Es darf in den Baum kein Knoten hinzugefügt werden.'
                feedback += '\n###############\n\n'
                violation = true;
                break;
            }

            // If the correct node is removed, add points for this step
            receivedPoints += stepMaxPoints;
            feedback += '\n Der Lösungsschritt ist korrekt!'
            feedback += '\n###############\n\n'
        }

        // If there was a violation, indicate that further steps are not evaluated
        if (violation && lastEvaluatedIndex < possibleSolution.length - 1) {
            feedback += 'Daher wurden die weiteren Schritte nicht bewertet.\n'
        }
        else if (studentSolution.length < possibleSolution.length) {
            feedback += 'Die Lösung enthält weniger Schritte als erwartet.\n'
        }

        if (receivedPoints === maxPoints) {
            feedback = 'Die Lösung ist korrekt!\n'
        }

        // Provide total points and feedback
        feedback += `\n> Insgesamt erzielte Punkte: ${receivedPoints.toFixed(2)} / ${maxPoints}.`

        return {
            possibleReceivedPoints: receivedPoints,
            possibleFeedback: feedback
        }
    }

    generatePossibleSolutions(
        currentBstArray: (string | null)[], 
        nodesToDelete: string[], 
        steps: (string | null)[][] = []
    ): (string | null)[][][] {
    
        // Clone the current BST and the list of nodes to delete to avoid mutation
        currentBstArray = JSON.parse(JSON.stringify(currentBstArray));
        nodesToDelete = JSON.parse(JSON.stringify(nodesToDelete));
    
        // If no nodes are left to delete, return the list of steps taken so far
        if (nodesToDelete.length <= 0) { 
            return [steps]; // Return a solution containing the steps
        }
    
        // Get the node to delete and remove it from the deletion queue
        const currentNodeToDelete: string = nodesToDelete.shift();
        const indexNodeToDelete = currentBstArray.indexOf(currentNodeToDelete);
    
        // If the node doesn't exist, return without doing anything
        if (indexNodeToDelete === -1) return;
    
        // Get the left and right child indices
        const leftChildIndex = this.getLeftChildIndex(indexNodeToDelete);
        const rightChildIndex = this.getRightChildIndex(indexNodeToDelete);
        const leftChild = currentBstArray.length <= leftChildIndex ? null : currentBstArray[leftChildIndex];
        const rightChild = currentBstArray.length <= rightChildIndex ? null : currentBstArray[rightChildIndex];
    
        // If the node has no children, remove it as a leaf
        if (leftChild === null && rightChild === null) {
            const updatedBstArray = this.removeLeaf(currentBstArray, indexNodeToDelete);
            // Push the modified state of the BST after deletion
            const newSteps = [...steps, JSON.parse(JSON.stringify(updatedBstArray))]; 
            // Recursively generate solutions with the new state and pass down the steps
            return this.generatePossibleSolutions(updatedBstArray, nodesToDelete, newSteps);
        }
    
        // If the node has only a right subtree, remove it and replace it with the right child
        if (leftChild === null) {
            const updatedBstArray = this.removeSingle(currentBstArray, indexNodeToDelete, 'RIGHT');
            const newSteps = [...steps, JSON.parse(JSON.stringify(updatedBstArray))]; 
            return this.generatePossibleSolutions(updatedBstArray, nodesToDelete, newSteps);
        }
    
        // If the node has only a left subtree, remove it and replace it with the left child
        if (rightChild === null) {
            const updatedBstArray = this.removeSingle(currentBstArray, indexNodeToDelete, 'LEFT');
            const newSteps = [...steps, JSON.parse(JSON.stringify(updatedBstArray))]; 
            return this.generatePossibleSolutions(updatedBstArray, nodesToDelete, newSteps);
        }
    
        // If the node has both left and right children:
        // Possible solution 1: Replace the node with the maximum node from the left subtree
        const updatedBstArrayLeft = this.removeNodeWithTwoChildren(currentBstArray, indexNodeToDelete, 'LEFT');
        const possibleSolutionsLeftSubtree = this.generatePossibleSolutions(
            updatedBstArrayLeft, 
            nodesToDelete, 
            [...steps, JSON.parse(JSON.stringify(updatedBstArrayLeft))] // Push step for left child replacement
        );
    
        // Possible solution 2: Replace the node with the minimum node from the right subtree
        const updatedBstArrayRight = this.removeNodeWithTwoChildren(currentBstArray, indexNodeToDelete, 'RIGHT');
        const possibleSolutionsRightSubtree = this.generatePossibleSolutions(
            updatedBstArrayRight, 
            nodesToDelete, 
            [...steps, JSON.parse(JSON.stringify(updatedBstArrayRight))] // Push step for right child replacement
        );
        
        // Combine both solutions (steps for both left and right subtree options)
        return [...possibleSolutionsLeftSubtree, ...possibleSolutionsRightSubtree];
    }

    removeNodeWithTwoChildren(currentBstArray: (string | null)[], indexNodeToDelete: number, subtree: 'LEFT' | 'RIGHT') {
      const updatedBstArray = JSON.parse(JSON.stringify(currentBstArray));

      if (subtree === 'LEFT') {
        const leftChildIndex = this.getLeftChildIndex(indexNodeToDelete)
        const indexOfMax = this.findIndexOfMax(updatedBstArray, leftChildIndex);
    
        updatedBstArray[indexNodeToDelete] = updatedBstArray[indexOfMax];

        // Check here if it also has e.g. left subtree. It can not have right subtree
        updatedBstArray[indexOfMax] = null;

        const maxLeftChildIndex = this.getLeftChildIndex(indexOfMax); 

        if (updatedBstArray.length > maxLeftChildIndex && updatedBstArray[maxLeftChildIndex] !== null) {
          updatedBstArray[indexOfMax] = updatedBstArray[maxLeftChildIndex];
          this.promoteAndClean({
            currentSolution: updatedBstArray,
            parentPrevIndex: maxLeftChildIndex,
            parentNewIndex: indexOfMax
          });
        }

        return updatedBstArray;
      }

      if (subtree === 'RIGHT') {
        const rightChildIndex = this.getRightChildIndex(indexNodeToDelete)
        const indexOfMin = this.findIndexOfMin(updatedBstArray, rightChildIndex);
    
        updatedBstArray[indexNodeToDelete] = updatedBstArray[indexOfMin];
  
        // Check here if it also has e.g. right subtree. It can not have left subtree
        updatedBstArray[indexOfMin] = null;
  
        const minRightChildIndex = this.getRightChildIndex(indexOfMin); 
  
        if (updatedBstArray.length > minRightChildIndex && updatedBstArray[minRightChildIndex] !== null) {
          updatedBstArray[indexOfMin] = updatedBstArray[minRightChildIndex];
          this.promoteAndClean({
            currentSolution: updatedBstArray,
            parentPrevIndex: minRightChildIndex,
            parentNewIndex: indexOfMin
          });
        }

        return updatedBstArray;
      }
    }

    removeLeaf(currentBstArray: (string | null)[], indexNodeToDelete: number) {
      const updatedBstArray = JSON.parse(JSON.stringify(currentBstArray));

      // Remove the node
      updatedBstArray[indexNodeToDelete] = null;
      return updatedBstArray;
    }

    removeSingle(currentBstArray: (string | null)[], indexNodeToDelete: number, subtree: 'LEFT' | 'RIGHT') {

      const updatedBstArray = JSON.parse(JSON.stringify(currentBstArray));
      
      // Calculate child index
      let indexChild: number = 0;
      if (subtree === 'LEFT') { indexChild = indexNodeToDelete * 2 + 1; }
      else if (subtree === 'RIGHT') { indexChild = indexNodeToDelete * 2 + 2; }

      // Replace by subtree
      this.promoteAndClean({
        currentSolution: updatedBstArray,
        parentPrevIndex: indexChild,
        parentNewIndex: indexNodeToDelete
      });

      return updatedBstArray;
    }
    
    // Main function to promote nodes and clean up unused children.
    promoteAndClean({
      currentSolution, parentPrevIndex, parentNewIndex
    }:{ 
      currentSolution: (string | null)[],
      parentPrevIndex: number,
      parentNewIndex: number
    }) {
      const toDelete = this.promoteChildren({
          currentSolution,
          parentPrevIndex,
          parentNewIndex,
      });
  
      // Perform the deletion of nodes after promotion.
      toDelete.forEach(nodeIndex => {
          currentSolution[nodeIndex] = null;
      });
  
      return currentSolution;
    }
  
    // This function handles promotion of children and returns an array of nodes to delete.
    promoteChildren({
      currentSolution, parentPrevIndex, parentNewIndex
    }:{ 
      currentSolution: (string | null)[],
      parentPrevIndex: number,
      parentNewIndex: number
    }) {
      
      // If parentPrevIndex is invalid, return an empty list (nothing to delete)
      if (parentPrevIndex < 0) { 
          return []; 
      }
      
      const length = currentSolution.length;
      const toDelete: (number)[] = [];
  
      // Ensure parentNewIndex is within bounds and perform the promotion
      if (parentNewIndex < length) {
          currentSolution[parentNewIndex] = currentSolution[parentPrevIndex];
          currentSolution[parentPrevIndex] = null;
      }
  
      const leftChildPrevIndex = parentPrevIndex * 2 + 1;
      const rightChildPrevIndex = parentPrevIndex * 2 + 2;
  
      const leftChildNewIndex = parentNewIndex * 2 + 1;
      const rightChildNewIndex = parentNewIndex * 2 + 2;
  
      // Recursively promote left child, if it exists
      if (leftChildPrevIndex < length && currentSolution[leftChildPrevIndex] !== null) {
          toDelete.push(...this.promoteChildren({
              currentSolution,
              parentPrevIndex: leftChildPrevIndex,
              parentNewIndex: leftChildNewIndex,
          }));
      } else if (leftChildNewIndex < length) {
          // Mark the new left child index for deletion later
          toDelete.push(leftChildNewIndex);
      }
  
      // Recursively promote right child, if it exists
      if (rightChildPrevIndex < length && currentSolution[rightChildPrevIndex] !== null) {
          toDelete.push(...this.promoteChildren({
              currentSolution,
              parentPrevIndex: rightChildPrevIndex,
              parentNewIndex: rightChildNewIndex,
          }));
      } else if (rightChildNewIndex < length) {
          // Mark the new right child index for deletion later
          toDelete.push(rightChildNewIndex);
      }
  
      // Return the list of nodes to delete
      return toDelete;
    }

    getLeftChildIndex(index: number): number {
      return 2 * index + 1;
    }

    getRightChildIndex(index: number): number {
      return 2 * index + 2;
    }

    findIndexOfMax(bstArray: (string | null)[], currentIndex: number): number {
    
      const rightChildIndex = this.getRightChildIndex(currentIndex);

      if (bstArray.length <= rightChildIndex || bstArray[rightChildIndex] === null) {
        return currentIndex;
      }

      return this.findIndexOfMax(bstArray, rightChildIndex);

    }    

    findIndexOfMin(bstArray: (string | null)[], currentIndex: number): number {
      const leftChildIndex = this.getLeftChildIndex(currentIndex);

      if (bstArray.length <= leftChildIndex || bstArray[leftChildIndex] === null) {
        return currentIndex;
      }

      return this.findIndexOfMin(bstArray, leftChildIndex);
    }

    extractNodesToDelete(initialBstArray: (string | null)[], finalBstArray: (string | null)[]) {
      const nodesToDelete: string[] = [];
      
      initialBstArray.forEach(node => {
        if (node !== null && !finalBstArray.includes(node)) {
          nodesToDelete.push(node);
        }
      });

      return nodesToDelete;
    }

}
