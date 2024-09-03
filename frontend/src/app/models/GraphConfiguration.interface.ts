export interface IGraphConfiguration {
    nodes: {
        weight: boolean,
        visited: boolean
    },
    edges: {
        directed: boolean,
        weight: boolean
    }
}