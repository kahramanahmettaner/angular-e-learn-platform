import { IPosition } from "./Position.interface";
import { ISize } from "./Size.interface";

export interface IGraphNodeJSON {
    nodeId: number;
    value: string;
    visited: boolean | null;
    weight: number | null;
    position: IPosition;
    size: ISize;
    center: IPosition;
}