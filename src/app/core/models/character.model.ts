export interface Position {
  x: number;
  y: number;
}

export interface Character {
  id: string;
  name: string;
  position: Position;
  sprite: string;
  isMoving: boolean;
  direction: 'up' | 'down' | 'left' | 'right';
}