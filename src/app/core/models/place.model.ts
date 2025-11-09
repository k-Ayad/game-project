import { Position } from './character.model';

export interface Place {
  id: string;
  name: string;
  position: Position;
  width: number;
  height: number;
  isCompleted: boolean;
  miniGameType: string;
  description: string;
  iconUrl?: string;
}
