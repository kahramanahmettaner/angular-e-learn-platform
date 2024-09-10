import { IBstNodeJSON } from "./BstNodeJSON.interface";
import { IGraphConfiguration } from "./GraphConfiguration.interface";
import { IGraphDataJSON } from "./GraphDataJSON.interface";

export default interface IAssignment {
    id: number,
    title: string,
    text: string,
    stepsEnabled: boolean,
    dataStructure: 'graph' | 'tree',
    initialStructure: IGraphDataJSON | IBstNodeJSON | null;
    expectedSolution: IGraphDataJSON[] | (IBstNodeJSON | null)[];
    graphConfiguration: IGraphConfiguration | null;
}