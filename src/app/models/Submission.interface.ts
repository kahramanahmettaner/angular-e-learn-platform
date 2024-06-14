import { IBstNodeSemantic } from "./BstNodeSemantic.interface";
import { ILLMPrompt } from "./LLMPrompt.interface";

export interface ISubmission {
    promptForLLM: ILLMPrompt
    assignmentTitle: string
    assignmentDescription: string
    initialStructure: IBstNodeSemantic | null
    solution: IBstNodeSemantic | null
}