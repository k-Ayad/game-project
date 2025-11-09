export interface GameState {
  completedPlaces: string[];
  currentPlace: string | null;
  playerName: string;
  lastSaved: Date;
}
