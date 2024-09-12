import { IBstNodeJSON } from "src/models/BstNodeJSON.interface";

/**
 * Checks if the given BST array contains only unique nodes (excluding nulls).
 *
 * @param array - Array of nodes, which can include strings or nulls.
 * @returns True if all non-null nodes are unique, false otherwise.
 */
export function bstArrayHasOnlyUniqueNodes(array: (string | null)[]): boolean {
    // Filter out null values
    const filteredArray = array.filter((item) => item !== null);
    
    // Create a Set from the filtered array
    const uniqueItems = new Set(filteredArray);
  
    // Check if the length of the Set is the same as the length of the filtered array
    return uniqueItems.size === filteredArray.length;
}


/**
 * Converts a binary search tree (BST) to an array representation using level-order traversal.
 * 
 * Each position in the array corresponds to a node in the BST. Nodes are placed according to their 
 * position in a complete binary tree, with `null` used for missing nodes.
 * 
 * @param rootNode - The root node of the BST, or `null` if the tree is empty.
 * @param bstHeight - The height of the BST. This determines the size of the resulting array.
 * @returns An array representation of the BST, where each index corresponds to a node's position.
 */
export function convertBstToArray(rootNode: IBstNodeJSON | null, bstHeight: number): (string | null)[]  {

    // Calculate the size of the array
    const size = Math.pow(2, bstHeight) - 1;
    const result: (string | null)[] = new Array(size).fill(null);

    // Edge case: if the tree is empty
    if (!rootNode) {
        return result;
    }

    // Queue for level-order traversal, storing pairs of node and index
    const queue: { node: IBstNodeJSON, index: number }[] = [{ node: rootNode, index: 0 }];

    while (queue.length > 0) {
        const { node, index } = queue.shift()!;  // Dequeue the first element

        // Place the current node's value in the array at the appropriate index
        result[index] = node.value;

        // Enqueue the left child, if it exists
        if (node.leftChild) {
            queue.push({ node: node.leftChild, index: 2 * index + 1 });
        }

        // Enqueue the right child, if it exists
        if (node.rightChild) {
            queue.push({ node: node.rightChild, index: 2 * index + 2 });
        }
    }

    return result;
}


/**
 * Calculates the height of a Binary Search Tree (BST).
 *
 * The height of a tree is the number of edges from the root to the furthest leaf node. 
 * This function uses a recursive approach to compute the height of a given BST node.
 * 
 * @param {IBstNodeJSON | null} bst - The root node of the BST or subtree to calculate the height for.
 * @returns {number} - The height of the BST.
 */
export function getBstHeight(bst: IBstNodeJSON | null): number {
    // Base case: if the tree is empty, height is 0
    if (bst === null) {
        return 0;
    }

    // Recursively calculate the height of the left and right subtrees
    const leftHeight = getBstHeight(bst.leftChild);
    const rightHeight = getBstHeight(bst.rightChild);

    // The height of the current node is 1 + the maximum of the heights of its subtrees
    return 1 + Math.max(leftHeight, rightHeight);
}