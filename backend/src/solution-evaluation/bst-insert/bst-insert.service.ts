import { Injectable } from '@nestjs/common';
import { IBstNodeJSON } from 'src/models/BstNodeJSON.interface';
import { convertBstToArray, getBstHeight, bstArrayHasOnlyUniqueNodes } from '../utils/bst-utils';

@Injectable()
export class BstInsertService {

    /**
     * Evaluates the student's solution for a Binary Search Tree (BST) assignment against the expected solution.
     * 
     * This function compares the student's BST solution to the initial and expected BST structures to determine
     * if the student's solution is correct and calculates the corresponding score. It also provides feedback 
     * based on various conditions:
     * 
     * - **Uniqueness**: Checks if the student's solution contains only unique nodes. If not, 0 points are awarded.
     * - **Correctness**: Checks if the student's solution matches the expected solution in terms of structure and node values.
     *   - If the student's solution is identical to the expected solution, the maximum points are awarded.
     *   - If the solution does not contain the initial BST or has a different height, 0 points are awarded.
     *   - If nodes are incorrectly placed, points are deducted proportionally.
     * 
     * @param initialStructure - The initial BST structure provided for the assignment.
     * @param studentSolution - The BST structure submitted by the student as their solution.
     * @param expectedSolution - The correct BST structure that the student’s solution should match.
     * @param maxPoints - The maximum number of points that can be awarded for this assignment.
     * 
     * @returns An object containing:
     * - `receivedPoints`: The number of points awarded based on the evaluation.
     * - `feedback`: A string containing feedback for the student explaining the results of the evaluation.
     */
    evaluateSolution(initialStructure: IBstNodeJSON, studentSolution: IBstNodeJSON, expectedSolution: IBstNodeJSON, maxPoints: number) {
        
        let receivedPoints = 0;
        const feedback: string[] = [];


        // #####
        // Convert BST structure from object repesentation to array representation 

        const initialBstHeight = getBstHeight(initialStructure);
        const studentBstHeight = getBstHeight(studentSolution);
        const expectedBstHeight = getBstHeight(expectedSolution);
    
        const initialBstArray = convertBstToArray(initialStructure, initialBstHeight);
        const studentBstArray = convertBstToArray(studentSolution, studentBstHeight);
        const expectedBstArray = convertBstToArray(expectedSolution, expectedBstHeight);



        // #####
        // Check for duplicate nodes in the student's BST solution

        const nodesAreUnique = bstArrayHasOnlyUniqueNodes(studentBstArray);
        if (!nodesAreUnique) {
            feedback.push('Die Lösung muss ausschließlich eindeutige Zahlen enthalten.');
            feedback.push(`\n > Insgesamt erzielte Punkte: 0 / ${maxPoints}.`);
            return {
                feedback: feedback.join('\n'),
                receivedPoints: 0
            }
        }
        


        // #####
        // Check if the student's solution matches the expected solution

        let identical = true;

        // Skip detailed comparison if tree heights differ
        let j = 0
        if (studentBstHeight !== expectedBstHeight) {
            j = expectedBstArray.length; // Skip the following loop
            identical = false;
        }

        // Compare nodes for equality
        for (let i = j; i < expectedBstArray.length; i++) {
            if ( expectedBstArray[i] !== studentBstArray[i] ) {
            identical = false;
            }
        }
    
        if (identical) {
            feedback.push('Die Lösung ist korrekt!');
            feedback.push(`\n > Insgesamt erzielte Punkte: ${maxPoints} / ${maxPoints}.`);
            return {
                feedback: feedback.join('\n'),
                receivedPoints: maxPoints
            }
        }



        // #####
        // Check if the student's solution contains the initial BST structure
        // The solution must include initialBst as new nodes should be inserted as children of leaf nodes.
        // If initialBst is missing, it indicates the student incorrectly removed it.

        if (studentBstHeight < initialBstHeight) {
            feedback.push('Die Ausgangsstruktur wurde verändert.');
            feedback.push(`\n > Insgesamt erzielte Punkte: 0 / ${maxPoints}.`);
            return {
                feedback: feedback.join('\n'),
                receivedPoints: 0
            }
        }
    

        let includesInitial = true; 
        for (let i = 0; i < initialBstArray.length; i++) {
    
            // Check if there is an initial node which does not exist in studentBst
            if ( initialBstArray[i] !== null && initialBstArray[i] !== studentBstArray[i] ) {
            includesInitial = false;
            }
    
        }
    
        if (!includesInitial) {
            feedback.push('Die Ausgangsstruktur wurde verändert.');
            feedback.push(`\n > Insgesamt erzielte Punkte: 0 / ${maxPoints}.`);
            return {
                feedback: feedback.join('\n'),
                receivedPoints: 0
            }
        }



        // #####
        // Evaluate new nodes and incorrect placement

        const newNodes: (string | null)[] = [];
        let newNodesNumber: number = 0;

        for (let i = 0; i < expectedBstArray.length; i++) {
            if (expectedBstArray[i] !== null && ( i >= initialBstArray.length || initialBstArray[i] === null)) {
                newNodes.push(expectedBstArray[i])
                newNodesNumber++;
            } else {
                newNodes.push(null);
            }
        }

        const NODE_POINTS = maxPoints / newNodesNumber;

    
        // Award points for correctly added new nodes
        const correctNewNodesNumber = this.countCorrectNewNodes(studentBstArray, newNodes, 0);
        receivedPoints = NODE_POINTS * correctNewNodesNumber;
        
        // Feedback for nodes, that aren't added correctly
        if (correctNewNodesNumber < newNodesNumber) {
            feedback.push("Es gibt Zahlen, die nicht an den richtigen Stellen im Baum eingefügt wurden.")
        }


        // Minus points for all nodes added incorrectly
        let incorrectNodes = false;
        for (let i = 0; i < studentBstArray.length; i++) { 
            // The student solution has a node at a position where the expected solution does not
            if ( studentBstArray[i] !== null &&                   // Student has a node  
                ( i >= expectedBstArray.length ||                 // Index out of bounds for expected or:
                expectedBstArray[i] === null ||                   // No node in expected or:
                expectedBstArray[i] !== studentBstArray[i] )      // Nodes are different 
              ) {
                receivedPoints -= NODE_POINTS;
                incorrectNodes = true;
              }
        }

        // Feedback for nodes added incorrectly
        if (incorrectNodes) {
            feedback.push("Die Lösung enthält Zahlen an falschen Stellen.")
        }

        // Ensure points are not negative
        receivedPoints = Math.max(receivedPoints, 0);


        // Final feedback
        feedback.push(`\n > Insgesamt erzielte Punkte: ${receivedPoints.toFixed(2)} / ${maxPoints}.`);
        
        return {
            receivedPoints,
            feedback: feedback.join('\n'),
        }
    }

    /**
     * Counts the number of correctly inserted new nodes in a binary tree, starting from a given index.
     * 
     * Recursively checks each node in the `nodesArrayToCheck` against the `newNodesArray` to determine if new nodes 
     * were inserted correctly. If a new node is found and matches the expected node, it is counted as correct.
     * Subtrees are ignored if their root node is incorrect.
     * 
     * @param nodesArrayToCheck - Array of nodes in the current tree, including potentially correct nodes.
     * @param newNodesArray - Array of new nodes expected to be inserted into the tree.
     * @param currentNodeIndex - Index of the node currently being checked in the arrays.
     * @returns The number of correctly inserted new nodes.
     */
    countCorrectNewNodes( nodesArrayToCheck: (string | null)[], newNodesArray: (string | null)[], currentNodeIndex: number ): number {

        // Base case: No more nodes to check
        if (currentNodeIndex >= nodesArrayToCheck.length) {
            return 0;
        }

        // No more new nodes to check
        if (currentNodeIndex >= newNodesArray.length) {
            return 0;
        }
        
        // Number of correctly inserted new nodes
        let subTreeCorrectNewNodes = 0;

        // Check if the current node is a new node and if it is correct
        let newNodeIsIncorrect = false;
        const newNode = newNodesArray[currentNodeIndex];
        if (newNode !== null) { // meaning, at this point, a new node needs to be inserted into the tree

            if (newNode === nodesArrayToCheck[currentNodeIndex]) { // It is correct
            subTreeCorrectNewNodes = 1;
            }
            else {
            newNodeIsIncorrect = true;
            }

        }

        // Recursively check left and right children if the current node is correct
        // If the current node is a new node but incorrect -> Ignore it's subtree
        if (!newNodeIsIncorrect) {
            // Repeat the same process for each subtree recursively
            
            // for leftChild    (leftChildIndex = 2 * currentNodeIndex + 1)
            const leftChildIndex = 2 * currentNodeIndex + 1;
            subTreeCorrectNewNodes += this.countCorrectNewNodes(nodesArrayToCheck, newNodesArray, leftChildIndex);

            // for rightChild   (rightChildIndex = 2 * currentNodeIndex + 2)
            const rightChildIndex = leftChildIndex + 1;
            subTreeCorrectNewNodes += this.countCorrectNewNodes(nodesArrayToCheck, newNodesArray, rightChildIndex);
        }

        return subTreeCorrectNewNodes;
    }

}
