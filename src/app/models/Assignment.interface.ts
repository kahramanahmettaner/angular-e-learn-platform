import { IBstNodeJSON } from "./BstNodeJSON.interface";
import { IGraphDataJSON } from "./GraphDataJSON.interface";
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
        exampleSolutionSteps: IGraphDataJSON[],
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
        exampleSolutionSteps: (IBstNodeJSON | null)[]
    }
}
