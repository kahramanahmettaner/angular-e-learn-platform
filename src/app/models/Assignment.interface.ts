import { IBstNodeJSON } from "./BstNodeJSON.interface";
import { IGraphEdgeJSON } from "./GraphEdgeJSON.interface";
import { IGraphNodeJSON } from "./GraphNodeJSON.interface";

export default interface IAssignment {
    id: number,
    title: string,
    text: string,
    stepsEnabled: boolean,
    dataStructure: 'graph' | 'tree',
    graphConfiguration?: {
        initialNodeData: IGraphNodeJSON[],
        initialEdgeData: IGraphEdgeJSON[],
        exampleSolutionNodeData: IGraphNodeJSON[],
        exampleSolutionEdgeData: IGraphEdgeJSON[], 
        nodeConfiguration: {
            weight: boolean,
            visited: boolean            
        },
        edgeConfiguration: {
            directed: boolean,
            weight: boolean
        },
    },
    binarySearchTreeConfiguration?: {
        initialRootNode: IBstNodeJSON | null,
        exampleSolutionRootNode: IBstNodeJSON | null
    }
}
