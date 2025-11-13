export interface PathNode {
  x: number;
  y: number;
  connections: number[];
}

export interface Building {
  id: string;
  name: string;
  nodeIndex: number;
  type: 'church' | 'cathedral' | 'chapel' | 'gate';
}