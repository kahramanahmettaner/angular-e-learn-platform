import { IBstNodeJSON } from "./BstNodeJSON.interface";
import { IGraphEdgeJSON } from "./GraphEdgeJSON.nterface";
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
        initialRootNode: IBstNodeJSON | null
    }
}
