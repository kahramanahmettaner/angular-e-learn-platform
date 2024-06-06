import { IGraphEdge } from "./GraphEdge.interface";
import { IGraphNode } from "./GraphNode.interface";
import { INode } from "./Node.interface";

export default interface IAssignment {
    id: number,
    title: string,
    text: string,
    stepsEnabled: boolean,
    dataStructure: 'graph' | 'tree',
    graphConfiguration?: {
        initialNodeData: IGraphNode[],
        initialEdgeData: IGraphEdge[],
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
        initialNodeData: INode[],
    }
}
