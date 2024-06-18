import { IBstNodeSemantic } from "./BstNodeSemantic.interface";
import { IGraphConfiguration } from "./GraphConfiguration.interface";
import { IGraphDataSemantic } from "./GraphDataSemantic.interface";
import { ILLMPrompt } from "./LLMPrompt.interface";

export interface ISubmission {
    promptForLLM: ILLMPrompt
    assignmentTitle: string
    assignmentDescription: string
    dataStructure: string
    graph?: {
        configuration: IGraphConfiguration
        initialStructure: IGraphDataSemantic
    }
    binarySearchTree?: {
        initialStructure: IBstNodeSemantic | null
    }
    solution: IBstNodeSemantic | null | IGraphDataSemantic
}